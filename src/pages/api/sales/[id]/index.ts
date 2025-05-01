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
    case 'GET': {
      try {
        const sale = await prisma.sale.findUnique({
          where: { id },
          include: {
            saleProducts: true,
            seller: true,
          },
        });

        if (!sale) {
          return res.status(404).json({ error: 'Sale not found' });
        }

        return res.status(200).json(sale);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    case 'PUT': {
      const { paymentMethod, amountReceived, change } = req.body;

      if (!paymentMethod || amountReceived === undefined || change === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const updatedSale = await prisma.sale.update({
          where: { id },
          data: {
            paymentMethod,
            amountReceived,
            change,
            status: 'CONCLUDED',
          },
        });

        return res.status(200).json(updatedSale);
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