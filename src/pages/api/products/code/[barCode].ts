import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '@/lib/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { barCode } = req.query;

  if (!barCode || typeof barCode !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing barCode parameter' });
  }

  switch (req.method) {
    case 'GET': {
      // Search for a product by barCode
      try {
        const products = await prisma.product.findMany({
          where: { barCode },
        });


        if (products.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(products);
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