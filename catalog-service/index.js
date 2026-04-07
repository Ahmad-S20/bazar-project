const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const CSV_FILE = 'catalog.csv';

// 📖 READ books from CSV file into memory
function loadBooks() {
  const lines = fs.readFileSync(CSV_FILE, 'utf8')
    .trim() 
    .split('\n');
  
  // Skip the first line (id,title,topic,price,stock header)
  lines.shift();

  return lines.map(line => {
    const [id, title, topic, price, stock] = line.split(',');
    return {
      id: parseInt(id),
      title,
      topic,
      price: parseFloat(price),
      stock: parseInt(stock)
    };
  });
}

// 💾 WRITE books from memory back to CSV file
function saveBooks(books) {
  const header = 'id,title,topic,price,stock';
  const lines = books.map(b => `${b.id},${b.title},${b.topic},${b.price},${b.stock}`);
  fs.writeFileSync(CSV_FILE, [header, ...lines].join('\n'));
}

// Load books when server starts
let books = loadBooks();
console.log("Loaded books from CSV:", books);

// 🔍 SEARCH by topic
app.get('/search/:topic', (req, res) => {
  const topic = decodeURIComponent(req.params.topic);
  const result = books.filter(b => b.topic === topic);
  res.json(result);
});

// ℹ️ GET info by id
app.get('/info/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  res.json(book);
});

// 🔄 UPDATE stock
app.post('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const change = req.body.change;
  const book = books.find(b => b.id === id);

  if (book) {
    book.stock += change;
    saveBooks(books);  // 💾 Save to CSV immediately after every change
    res.json({ message: "Updated successfully", book });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// 📦 RESTOCK — every 60 seconds, add stock to all books
setInterval(() => {
  console.log("Restocking all books...");
  
  books = loadBooks(); // Read current state from CSV
  
  books.forEach(book => {
    book.stock += 2; // Add 2 copies of each book
  });
  
  saveBooks(books); // Save updated stock to CSV
  
  console.log("Restock complete:", books.map(b => `${b.title}: ${b.stock}`));
}, 60000); // 60000 milliseconds = 60 seconds

// 🚀 Start server
app.listen(3001, () => {
  console.log("Catalog Service running on http://localhost:3001");
});