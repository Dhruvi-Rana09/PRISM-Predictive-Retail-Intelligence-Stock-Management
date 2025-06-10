// utils/seedProducts.js
// Run this script once to populate your Firebase database with products

import { db } from '@/lib/firebase-config'; // Adjust path as needed
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const products = [
  {
    id: 1,
    name: 'Dark Minimal Sneakers',
    price: 3499,
    image: '/sneaker.jpg',
    category: 'footwear',
    inStock: true,
    description: 'Sleek and minimalist sneakers for everyday wear'
  },
  {
    id: 2,
    name: 'Black Hoodie',
    price: 1999,
    image: '/hoodie.jpg',
    category: 'clothing',
    inStock: true,
    description: 'Comfortable black hoodie with premium fabric'
  },
  {
    id: 3,
    name: 'Premium Watch',
    price: 7299,
    image: '/watch.jpg',
    category: 'accessories',
    inStock: true,
    description: 'Elegant timepiece with modern design'
  },
  {
    id: 4,
    name: 'Noise Cancelling Headphones',
    price: 5999,
    image: '/headphones.jpg',
    category: 'electronics',
    inStock: true,
    description: 'High-quality headphones with active noise cancellation'
  },
  {
    id: 5,
    name: 'Minimalist Backpack',
    price: 2899,
    image: '/backpack.jpg',
    category: 'bags',
    inStock: true,
    description: 'Clean design backpack for daily use'
  },
  {
    id: 6,
    name: 'Wireless Earbuds',
    price: 4299,
    image: '/earbuds.jpg',
    category: 'electronics',
    inStock: true,
    description: 'True wireless earbuds with premium sound'
  },
  {
    id: 7,
    name: 'Premium Leather Wallet',
    price: 1599,
    image: '/wallet.jpg',
    category: 'accessories',
    inStock: true,
    description: 'Handcrafted leather wallet with RFID protection'
  },
  {
    id: 8,
    name: 'Carbon Fiber Phone Case',
    price: 899,
    image: '/phonecase.jpg',
    category: 'accessories',
    inStock: true,
    description: 'Lightweight and durable phone protection'
  },
  {
    id: 9,
    name: 'Titanium Sunglasses',
    price: 3999,
    image: '/sunglasses.jpg',
    category: 'accessories',
    inStock: true,
    description: 'Premium titanium frame sunglasses'
  },
  {
    id: 10,
    name: 'Smart Fitness Tracker',
    price: 2799,
    image: '/fitness-tracker.jpg',
    category: 'electronics',
    inStock: true,
    description: 'Advanced fitness tracking with health monitoring'
  },
  {
    id: 11,
    name: 'Mechanical Keyboard',
    price: 6499,
    image: '/keyboard.jpg',
    category: 'electronics',
    inStock: true,
    description: 'High-performance mechanical keyboard for gaming'
  },
  {
    id: 12,
    name: 'Portable Charger',
    price: 1299,
    image: '/charger.jpg',
    category: 'electronics',
    inStock: true,
    description: 'Fast-charging portable power bank'
  },
  {
    id: 13,
    name: 'Premium Denim Jacket',
    price: 4599,
    image: '/denim-jacket.jpg',
    category: 'clothing',
    inStock: true,
    description: 'Classic denim jacket with modern fit'
  },
  {
    id: 14,
    name: 'Stainless Steel Water Bottle',
    price: 799,
    image: '/water-bottle.jpg',
    category: 'accessories',
    inStock: true,
    description: 'Insulated water bottle for all-day hydration'
  },
  {
    id: 15,
    name: 'Bluetooth Speaker',
    price: 3299,
    image: '/speaker.jpg',
    category: 'electronics',
    inStock: true,
    description: 'Portable speaker with rich, clear sound'
  },
  {
    id: 16,
    name: 'Gaming Mouse',
    price: 2199,
    image: '/gaming-mouse.jpg',
    category: 'electronics',
    inStock: true,
    description: 'Precision gaming mouse with customizable settings'
  },
];

// Function to seed products to Firebase
export async function seedProducts() {
  try {
    console.log('Starting to seed products...');
    
    for (const product of products) {
      // Use the product ID as the document ID for easy reference
      await setDoc(doc(db, 'products', product.id.toString()), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Added product: ${product.name}`);
    }
    
    console.log('All products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// Uncomment the line below and run this file to seed your database
seedProducts();
