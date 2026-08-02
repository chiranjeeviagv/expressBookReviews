const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(u => u.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
}

// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token signed with secret "access"
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 3600 });
    
    // Bind token payload directly into our application session
    req.session.authorization = { accessToken, username };
    
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login Credentials" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review parameter missing in query string" });
  }

  // Key review map by the unique session username context
  books[isbn].reviews[username] = reviewText;
  return res.status(200).json({ 
    message: "The review has been successfully added / updated.", 
    reviews: books[isbn].reviews 
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No review found from this user for this book." });
  }
});

module.exports = {
  authenticated: regd_users,
  isValid: isValid,
  users: users
};
