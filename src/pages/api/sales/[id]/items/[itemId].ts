import { NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import authenticate from '@/lib/middleware';
import { AuthenticatedRequest } from '@/utils/types';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id, itemId } = req.query;

  if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing IDs' });
  }

  switch (req.method) {
    case 'DELETE': {
      try {
        const saleItem = await prisma.saleProduct.findUnique({
          where: { id: itemId },
          include: { product: true, sale: true },
        });

        if (!saleItem) {
          return res.status(404).json({ error: 'Sale item not found' });
        }

        await prisma.saleProduct.delete({
          where: { id: itemId },
        });

        const sale = await prisma.sale.update({
          where: { id },
          data: {
            total: {
              decrement: saleItem.quantity * saleItem.product.price,
            },
          },
        });

        return res.status(200).json({ message: 'Item removed successfully', sale });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    case 'PUT': {
      const { quantity } = req.body;

      if (quantity === undefined || !quantity) {
        return res.status(400).json({ error: 'Quantity value is not defined' });
      }

      try {
        const saleProduct = await prisma.saleProduct.findUnique({
          where: { id: itemId },
          include: { product: true },
        });

        if (!saleProduct) {
          return res.status(404).json({ error: 'Sale item not found' });
        }

        const updatedProductSaleItem = await prisma.saleProduct.update({
          where: { id: itemId },
          data: {
            ...(quantity && { quantity }),

          },
        });

        // Update total of sale based on all saleProduct items
        // const sale = await prisma.sale.findUnique({
        //   where: { id },
        //   include: { saleProducts: true },
        // });

        

      


        return res.status(200).json({ updatedProductSaleItem });
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