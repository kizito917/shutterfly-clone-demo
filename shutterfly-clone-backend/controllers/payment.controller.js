// External imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");

const createCheckoutSession = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    const price = 10
    try {
        const { designId } = req.body;

        const designDetail = await db.UserImage.findOne({
            where: {id: designId}
        });

        if (!designDetail) {
            return apiResponse("Error", "Design not found. Kindly provide correct ID", null, 404, res);
        }

        // Create pending order
        const order = await db.Order.create({
            userId: req.user.id,
            status: 'pending',
            amount: price
        }, { transaction });

        // Create order item
        await db.OrderItem.create({
            orderId: order.id,
            designId: designId,
            quantity: 1,
            price: price
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
        const session = event.data.object;
        
        // Retrieve the session metadata
        const { designId, userId } = session.metadata;
        
        await db.Order.update({
            status: 'completed'
        }, {
            where: {
                userId
            }
        });

        await db.Payment.update({
            status: 'paid'
        }, {
            where: {
                stripeSessionId: session.id
            }
        });
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