import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '../../../lib/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = (req as any).user; // User object from middleware

  switch (req.method) {
    case 'GET': {
      // Get products by pagination
      const { page = 1, limit = 10 } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
        return res.status(400).json({ error: 'Invalid pagination parameters' });
      }

      try {
        const products = await prisma.product.findMany({
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
          where: { active: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        });

        const totalProducts = await prisma.product.count({
          where: { active: 'ACTIVE' },
        });

        return res.status(200).json({
          data: products,
          meta: {
            total: totalProducts,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalProducts / pageSize),
          },
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'POST': {
      // Create a new product
      const { name, barCode, price } = req.body;

      if (!name || !barCode || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const newProduct = await prisma.product.create({
          data: {
            name,
            barCode,
            price,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return res.status(201).json(newProduct);
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