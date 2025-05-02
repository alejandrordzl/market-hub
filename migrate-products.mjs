import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:3000/api/products';
const API_KEY = process.env.CUSTOM_API_KEY;

// Ensure the API key is set
if (!API_KEY) {
  console.error('Error: CUSTOM_API_KEY is not set in the environment variables.');
  process.exit(1);
}

// Read the JSON file
const filePath = './products.json'; // Replace with the actual path to your JSON file
const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Function to send a POST request for each product
const uploadProducts = async () => {
  for (const product of products) {
    if (!product.code || !product.price) {
      console.error(`Skipping product with missing code or price: ${JSON.stringify(product)}`);
      continue;
    }
    try {
      console.log(`Uploading product: ${product.code} to ${API_URL}`);

      const response = await axios.post(
        API_URL,
        {
          name: product.name || 'Unnamed Product',
          barCode: product.code,
          price: parseFloat(product.price),
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`Uploaded product: ${product.code} - Response:`, response.data);
    } catch (error) {
      console.error(`Failed to upload product: ${product.code}`, error);
    }
  }
};

// Execute the script
uploadProducts();