// External imports
const express = require('express');

// Internal imports
const { checkValidity } = require('../middlewares/checkValidity');
const { 
    addNewProduct, 
    fetchAllProducts, 
    fetchProductDetails, 
    updateProduct, 
    deleteProduct, 
    addNewProductItem, 
    updateProductItem, 
    deleteProductItem 
} = require('../controllers/product.controller');

const router = express.Router();

// Route to add new product
router.post('/new', checkValidity, addNewProduct);

// Route to add new product item
router.post('/item/new', addNewProductItem);

// Route to fetch all products
router.get('/all', checkValidity, fetchAllProducts);

// Route to fetch product details
router.get('/:id', checkValidity, fetchProductDetails);

// Route to update product details
router.put('/:id/update', checkValidity, updateProduct);

// Route to update product item
router.put('/item/:id/update', checkValidity, updateProductItem);

// Route to delete product details
router.delete('/:id/delete', checkValidity, deleteProduct);

// Route to delete product item
router.delete('/item/:id/delete', checkValidity, deleteProductItem);

module.exports = router;