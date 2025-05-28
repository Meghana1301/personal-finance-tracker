-- Create database
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Insert default categories
INSERT INTO categories (name, type, user_id) VALUES
  ('Salary', 'income', NULL),
  ('Freelance', 'income', NULL),
  ('Investments', 'income', NULL),
  ('Other Income', 'income', NULL),
  ('Groceries', 'expense', NULL),
  ('Rent', 'expense', NULL),
  ('Utilities', 'expense', NULL),
  ('Transportation', 'expense', NULL),
  ('Entertainment', 'expense', NULL),
  ('Healthcare', 'expense', NULL),
  ('Shopping', 'expense', NULL),
  ('Education', 'expense', NULL),
  ('Other Expenses', 'expense', NULL); 