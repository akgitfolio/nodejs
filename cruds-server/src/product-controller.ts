import { Request, Response } from "express";
import { Product } from "./product";

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, quantity } = req.body;
  try {
    const product = await Product.create({
      name,
      description,
      price,
      quantity,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;
  try {
    const [updatedRowsCount] = await Product.update(
      { name, description, price, quantity },
      { where: { id } }
    );
    if (updatedRowsCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedRowsCount = await Product.destroy({ where: { id } });
    if (deletedRowsCount === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const generateDummyProducts = (count: number): any[] => {
  const products: any[] = [];

  for (let i = 1; i <= count; i++) {
    const product: any = {
      name: `Product ${i}`,
      description: `Description of Product ${i}`,
      price: parseFloat((Math.random() * 100).toFixed(2)),
      quantity: Math.floor(Math.random() * 100),
    };

    products.push(product);
  }

  return products;
};

export const seedProducts = async (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 10;
  const dummyProducts = generateDummyProducts(count);

  Product.bulkCreate(dummyProducts)
    .then(() => {
      res.json(dummyProducts);
    })
    .catch((error) => {
      console.error("Error seeding dummy products:", error);
      res.status(500).json({ error: "Failed to seed dummy products" });
    });
};
