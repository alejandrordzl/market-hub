import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '@/lib/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { barCode, page = 1, limit = 10 } = req.query;

  if (!barCode || typeof barCode !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing barCode parameter' });
  }

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  switch (req.method) {
    case 'GET': {
      // Search for a product by barCode with pagination
      try {
        const products = await prisma.product.findMany({
          where: { barCode },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        });

        const totalProducts = await prisma.product.count({
          where: { barCode },
        });

        if (products.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }

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

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default authenticate(handler);