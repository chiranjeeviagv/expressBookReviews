const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Using JSON.stringify with formatting spaces as requested
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: "Book not found" });
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  const keys = Object.keys(books); // Hint 1: Obtain all keys
  const matchedBooks = [];

  // Hint 2: Iterate through books and check matching author
  keys.forEach(key => {
    if (books[key].author.toLowerCase() === authorParam) {
      matchedBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  }
  return res.status(404).json({ message: "No books found by this author" });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();
  const keys = Object.keys(books);
  const matchedBooks = [];

  keys.forEach(key => {
    if (books[key].title.toLowerCase().includes(titleParam)) {
      matchedBooks.push({ isbn: key, ...books[key] });
    }
  });

  if (matchedBooks.length > 0) {
    return res.status(200).json(matchedBooks);
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports = { general: public_users };
