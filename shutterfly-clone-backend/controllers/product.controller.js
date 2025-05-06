// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");

const addNewProduct = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if exact product already exist
        const productExist = await db.Product.findOne({
            where: { name }
        });

        if (productExist) {
            return apiResponse("Error", "Product with exact name already exists", null, 409, res);
        }

        // create neq product in DB
        const newlyAddedProduct = await db.Product.create({
            name, description
        });

        return apiResponse("Success", "Product added successfully", newlyAddedProduct, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to add new product", null, 500, res);
    }
}

const fetchAllProducts = async (req, res) => {
    try {
        const products = await db.Product.findAll({
            where: {
                isActive: true
            },
            include: [
                {
                    model: db.ProductItem,
                    as: 'productItems'
                },
            ]
        });

        if (!products) {
            return apiResponse("Error", "Products not found", null, 404, res);
        }

        return apiResponse("Success", "Products retrieved successfully", products, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve products", null, 500, res);
    }
}

const fetchProductDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await db.Product.findOne({
            where: {
                id,
                isActive
            },
            include: [
                {
                    model: db.ProductItem,
                    as: 'productItems'
                },
            ]
        });

        if (!product) {
            return apiResponse("Error", "Product details not found", null, 404, res);
        }

        return apiResponse("Success", "Product detailed retrieved successfully", product, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve product details", null, 500, res);
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await db.Product.findOne({
            where: {
                id,
                isActive
            },
            include: [
                {
                    model: db.ProductItem,
                    as: 'productItems'
                },
            ]
        });

        if (!product) {
            return apiResponse("Error", "Product details not found", null, 404, res);
        }

        await db.Product.update({
            ...req.body
        }, {
            where: { id }
        });

        return apiResponse("Success", "Product detailed updated successfully", null, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to update product details", null, 500, res);
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await db.Product.findOne({
            where: {
                id,
                isActive
            },
        });

        if (!product) {
            return apiResponse("Error", "Product details not found", null, 404, res);
        }

        // perform soft delete on product by setting active status to false
        await db.Product.update({
            isActive: false
        }, {
            where: { id }
        });

        return apiResponse("Success", "Product deleted successfully", null, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to delete product", null, 500, res);
    }
}

const addNewProductItem = async (req, res) => {
    try {
        const { productId, type, sku, shippingPrice, size } = req.body;

        // Verify if parent product is valid
        const isValidProductParent = await db.Product.findOne({
            where: { id: productId }
        });

        if (!isValidProductParent) {
            return apiResponse("Error", "Invalid product ID provided", null, 404, res);
        }

        const productItem = await db.ProductItem.create({
            productId, 
            type, 
            sku, 
            shippingPrice, 
            size
        });

        return apiResponse("Success", "Product item added successfully", productItem, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to add new product item", null, 500, res);
    }
}

const updateProductItem = async (req, res) => {
    try {
        const { id } = req.params;

        const productItem = await db.ProductItem.findOne({
            where: {
                id
            },
        });

        if (!productItem) {
            return apiResponse("Error", "Product item not found", null, 404, res);
        }

        await db.ProductItem.update({
            ...req.body
        }, {
            where: { id }
        });

        return apiResponse("Success", "Product item updated successfully", null, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to update product item", null, 500, res);
    }
}

const deleteProductItem = async (req, res) => {
    try {
        const { id } = req.params;

        const productItem = await db.ProductItem.findOne({
            where: {
                id
            },
        });

        if (!productItem) {
            return apiResponse("Error", "Product item not found", null, 404, res);
        }

        await db.ProductItem.destroy({
            where: { id }
        });

        return apiResponse("Success", "Product item deleted successfully", null, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to delete product item", null, 500, res);
    }
}

module.exports = {
    addNewProduct,
    fetchAllProducts,
    fetchProductDetails,
    updateProduct,
    deleteProduct,
    addNewProductItem,
    updateProductItem,
    deleteProductItem
}