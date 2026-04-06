const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Addresses of the two backend services
const CATALOG_URL = 'http://localhost:3001';
const ORDER_URL   = 'http://localhost:3002';

// 🔍 SEARCH — user asks "show me books about X"
// Frontend receives it, forwards to catalog, returns result
app.get('/search/:topic', async (req, res) => {
  const topic = req.params.topic;

  try {
    const response = await axios.get(`${CATALOG_URL}/search/${topic}`);
    const books = response.data;

    // Format nicely: only show title and id (not price/stock — that's info's job)
    const result = books.map(b => ({ id: b.id, title: b.title }));

    console.log(`Search for "${topic}":`, result);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

// ℹ️ INFO — user asks "tell me about book #2"
// Frontend receives it, forwards to catalog, returns result
app.get('/info/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const response = await axios.get(`${CATALOG_URL}/info/${id}`);
    console.log(`Info for book #${id}:`, response.data);
    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Could not reach catalog service" });
  }
});

// 🛒 PURCHASE — user wants to buy book #2
// Frontend receives it, forwards to order service
app.post('/purchase/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const response = await axios.post(`${ORDER_URL}/purchase/${id}`);
    console.log(`Purchase result for book #${id}:`, response.data);
    res.json(response.data);

  } catch (error) {
    // If order service returned an error (like out of stock), pass it along
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Could not reach order service" });
    }
  }
});

// 🚀 Start server
app.listen(3000, () => {
  console.log("Frontend Service running on http://localhost:3000");
});