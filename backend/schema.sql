-- THE VARCHES - MySQL Database Schema
-- Run this file to set up your database

CREATE DATABASE IF NOT EXISTS thevarches;
USE thevarches;

-- Users table (admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sketches (products) table
CREATE TABLE IF NOT EXISTS sketches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  medium VARCHAR(100),       -- e.g., "Pencil", "Charcoal", "Ink"
  dimensions VARCHAR(100),   -- e.g., "A4", "20x30cm"
  is_original BOOLEAN DEFAULT TRUE,
  stock_qty INT DEFAULT 1,
  is_featured BOOLEAN DEFAULT FALSE,
  tags VARCHAR(500),         -- comma-separated tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  sketch_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (sketch_id) REFERENCES sketches(id)
);

-- Wishlist / Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sketch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sketch_id) REFERENCES sketches(id)
);

-- Seed categories
INSERT INTO categories (name, slug, description) VALUES
  ('Portraits', 'portraits', 'Handcrafted portrait sketches'),
  ('Landscapes', 'landscapes', 'Nature and cityscape sketches'),
  ('Abstract', 'abstract', 'Abstract art and experimental sketches'),
  ('Figurative', 'figurative', 'Human figure and form studies'),
  ('Still Life', 'still-life', 'Objects, arrangements and compositions');

-- Seed admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@thevarches.com', '$2a$10$rGJ5V8sPV9/wuBHI7D6p3eJQkCf3yEJw8Xq/pT7UT1KIjVQlGCVvq', 'admin');

-- Seed sample sketches
INSERT INTO sketches (title, description, price, category_id, medium, dimensions, is_featured, tags) VALUES
  ('Whispers in Charcoal', 'A hauntingly beautiful portrait capturing raw emotion through bold charcoal strokes', 120.00, 1, 'Charcoal', 'A3 (29.7 x 42 cm)', TRUE, 'portrait,charcoal,emotion'),
  ('Urban Shadows', 'City architecture at dusk, ink lines dancing with shadow and light', 85.00, 2, 'Ink', 'A4 (21 x 29.7 cm)', TRUE, 'urban,ink,architecture'),
  ('The Quiet Mind', 'Abstract expressionist piece exploring inner calm through gestural marks', 150.00, 3, 'Graphite & Ink', 'A3 (29.7 x 42 cm)', TRUE, 'abstract,graphite,calm'),
  ('Figure Study No. 7', 'Classical figure study rendered in delicate pencil hatching', 95.00, 4, 'Pencil', 'A4 (21 x 29.7 cm)', FALSE, 'figure,pencil,classical'),
  ('Morning Light', 'A window scene with soft morning light rendered in graphite', 75.00, 5, 'Graphite', 'A5 (14.8 x 21 cm)', FALSE, 'still life,light,graphite'),
  ('The Wanderer', 'Solitary figure in vast landscape — a meditation on solitude', 130.00, 4, 'Charcoal', 'A3 (29.7 x 42 cm)', TRUE, 'figure,landscape,charcoal');
