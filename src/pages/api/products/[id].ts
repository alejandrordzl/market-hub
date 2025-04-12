import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '@/lib/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing product ID' });
  }

  switch (req.method) {
    case 'GET': {
      // Get a product by ID
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(product);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'PUT': {
      // Update a product by ID
      const { name, barCode, price } = req.body;

      if (!name && !barCode && price === undefined) {
        return res.status(400).json({ error: 'Missing fields to update' });
      }

      try {
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(barCode && { barCode }),
            ...(price !== undefined && { price }),
            updatedBy: (req as any).user.id, // Use the authenticated user's ID
            updatedAt: new Date()
          },
        });

        return res.status(200).json(updatedProduct);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'DELETE': {
      // Soft delete a product by setting its active status to INACTIVE
      try {
        const user = (req as any).user; // User object from the authentication middleware

        if (!user || user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            active: 'INACTIVE',
            updatedBy: user.id, // Use the authenticated user's ID
            updatedAt: new Date(), // Automatically update the timestamp
          },
        });

        return res.status(200).json({ message: 'Product deleted successfully', product: updatedProduct });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default authenticate(handler);