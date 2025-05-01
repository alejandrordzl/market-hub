import { NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import authenticate from '@/lib/middleware';
import { AuthenticatedRequest } from '@/utils/types';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing sale ID' });
  }

  switch (req.method) {
    case 'POST': {
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const saleProduct = await prisma.saleProduct.create({
          data: {
            saleId: id,
            productId,
            quantity,
          },
          include: {
            product: true,
          },
        });

        const sale = await prisma.sale.update({
          where: { id },
          data: {
            total: {
              increment: quantity * saleProduct.product.price,
            },
          },
        });

        return res.status(201).json({ saleProduct, sale });
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