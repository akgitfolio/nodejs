import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
} from "./product-controller";

const router = express.Router();

// Get all products
router.get("/products", getAllProducts);

// Get a single product by ID
router.get("/products/:id", getProductById);

// Create a new product
router.post("/products", createProduct);

// Update a product
router.put("/products/:id", updateProduct);

// Delete a product
router.delete("/products/:id", deleteProduct);

router.delete("/seed", seedProducts);

export default router;
