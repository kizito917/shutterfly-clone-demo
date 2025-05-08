// External imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");
const { createShippingOrder } = require('../helpers/shipping.helper');

const createCheckoutSession = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    let price = 10;

    try {
        const { designId, product, productItem } = req.body;

        const designDetail = await db.UserImage.findOne({
            where: {id: designId}
        });

        if (!designDetail) {
            return apiResponse("Error", "Design not found. Kindly provide correct ID", null, 404, res);
        }

        let productData;
        if (product && productItem) {
            // Verify product is valid
            productData = await db.Product.findOne({
                where: { id: product }
            });

            if (!productData) {
                return apiResponse("Error", "Product not found. Kindly provide correct ID", null, 404, res);
            }

            const productItemDetails = await db.ProductItem.findOne({
                where: { id: productItem }
            });

            price += parseInt(productItemDetails.shippingPrice, 10);
        }

        // Create pending order
        const order = await db.Order.create({
            userId: req.user.id,
            status: 'pending',
            amount: price,
        }, { transaction });

        // Create order item
        await db.OrderItem.create({
            orderId: order.id,
            designId: designId,
            quantity: 1,
            price: price,
            shippingProductChoice: product || null,
            shippingProductItemChoice: productItem || null,
            shippingOrderId: null
        }, { transaction });

        // Create checkout url
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Styled Image: ${designDetail.imagePath}`,
                            description: `Purchase of digital styled image: ${designDetail.imagePath}`,
                            images: [`${process.env.BACKEND_URL}/${designDetail.imagePath}`],
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // success_url: `${process.env.FRONTEND_URL}/canva-editor/${designId}?payment-success=${true}&orderId=${order.id}`,
            success_url: `${process.env.FRONTEND_URL}/checkout-success`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout-failure`,
            metadata: {
                orderId: order.id,
                designId: designId,
                userId: req.user.id,
            },
        });

        // Create a payment record linked to the order
        await db.Payment.create({
            orderId: order.id,
            stripeSessionId: session.id,
            amount: price,
        }, { transaction });
        
        await transaction.commit();

        const returnPayload = {
            sessionId: session.id,
            sessionUrl: session.url,
            orderId: order.id,
        };

        return apiResponse("Success", "Checkout process successfully initialized", returnPayload, 200, res);
    } catch (err) {
        console.log(err);
        await transaction.rollback();
        return apiResponse("Error", "Unable to process checkout!", err, 500, res);
    }
}

const processPaymentWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        try {
            const transaction = await db.sequelize.transaction();
            const session = event.data.object;
            
            // Retrieve the session metadata
            const { designId, userId, orderId } = session.metadata;
            
            await db.Order.update({
                status: 'completed'
            }, {
                where: {
                    userId,
                    id: orderId
                }
            }, { transaction });

            await db.Payment.update({
                status: 'paid'
            }, {
                where: {
                    stripeSessionId: session.id
                }
            }, { transaction });

            // retrieve user profile details
            const user = await db.User.findOne({
                where: {
                    id: userId
                }
            });

            // process shipping of product (get all order items of an order)
            const orderItems = await db.OrderItem.findAll({
                where: {
                    orderId
                }
            });

            orderItems.forEach(async (order) => {
                if (order.shippingProductItemChoice) {
                    const product = await db.ProductItem.findOne({
                        where: {id: order.shippingProductItemChoice}
                    });
    
                    const assetsData = await db.UserImage.findOne({
                        where: { id: order.designId } 
                    });

                    const shippingPayload = {
                        merchantReference: `#${order.designId}`,
                        shippingMethod: "Budget",
                        recipient: {
                            address: {
                                line1: "23rd avenue, lanchaster",
                                postalOrZipCode: "91404",
                                countryCode: "US",
                                townOrCity: "Dallas",
                                stateOrCounty: "Texas"
                            },
                            name: `${user.firstName} ${user.lastName}`
                        },
                        items: [
                            {
                                merchantReference: `#${order.designId}`,
                                sku: product.sku,
                                copies: 1,
                                sizing: "fillPrintArea",
                                assets: [
                                    {
                                        "printArea": "Default",
                                        "url": `${process.env.BACKEND_URL}/${assetsData.imagePath}`
                                    }
                                ]
                            }
                        ],
                        metadata: {}
                    }
    
                    const shippingCreationResult = await createShippingOrder(shippingPayload);
                    await db.OrderItem.update({
                        shippingOrderId: shippingCreationResult.order.id
                    }, {
                        where: { id: order.id }
                    }, { transaction });
                }
            });

            await transaction.commit();
        } catch (err) {
            console.log("Error executing checkout.session.completed operations");
            await transaction.rollback();
        }
    }

    if (event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object;
        
        // Retrieve the session metadata
        const { designId, userId } = session.metadata;
        
        await db.Order.update({
            status: 'cancelled'
        }, {
            where: {
                userId
            }
        });

        await db.Payment.update({
            status: 'cancelled'
        }, {
            where: {
                stripeSessionId: session.id
            }
        });
    }
      
    res.json({ received: true });
}

module.exports = {
    createCheckoutSession,
    processPaymentWebhook
}