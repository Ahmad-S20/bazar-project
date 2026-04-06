const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

// This is our "database" — a simple text file that logs orders
const ORDER_LOG = 'orders.txt';

// The address of the catalog service
const CATALOG_URL = 'http://localhost:3001';

// 🛒 PURCHASE a book by ID
app.post('/purchase/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Step 1: Ask the catalog "is this book in stock?"
    const response = await axios.get(`${CATALOG_URL}/info/${id}`);
    const book = response.data;

    // Step 2: Check if we actually got a book back
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Step 3: Check stock
    if (book.stock <= 0) {
      return res.status(400).json({ error: "Out of stock" });
    }

    // Step 4: Tell catalog to decrease stock by 1
    await axios.post(`${CATALOG_URL}/update/${id}`, { change: -1 });

    // Step 5: Log the order to our text file
    const logEntry = `Bought book: "${book.title}" at $${book.price} — ${new Date().toISOString()}\n`;
    fs.appendFileSync(ORDER_LOG, logEntry);

    console.log(`bought book ${book.title}`);
    res.json({ message: `Successfully purchased "${book.title}"` });

  } catch (error) {
    console.error("Purchase error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🚀 Start server
app.listen(3002, () => {
  console.log("Order Service running on http://localhost:3002");
});