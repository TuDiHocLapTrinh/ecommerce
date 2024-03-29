const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs');
  if (req.body && req.body.tittle) {
    req.body.slug = slugify(req.body.tittle);
  }
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    createProduct: newProduct ? newProduct : 'Cannot create new product',
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid);
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : 'Cannot get product',
  });
});

// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  return res.status(200).json({
    success: products ? true : false,
    productDatas: products ? products : 'Cannot get products',
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs');
  const { pid } = req.params;
  if (req?.body?.tittle) {
    req.body.slug = slugify(req.body.tittle);
  }
  const updateProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updateProduct ? true : false,
    updatedProduct: updateProduct ? updateProduct : 'Cannot update product',
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product',
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct
};
