import { NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import authenticate from '@/lib/middleware';
import { AuthenticatedRequest } from '@/utils/types';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    switch (req.method) {
        case 'GET': {
            const { startDate, endDate, sellerId, status = 'CONCLUDED', page = '1', limit = '10' } = req.query;

            try {
                const pageNumber = parseInt(page as string, 10);
                const pageSize = parseInt(limit as string, 10);
                const skip = (pageNumber - 1) * pageSize;
                const where = {
                    status,                    
                    ...(startDate && { saleDate: { gte: new Date(startDate as string) } }),
                    ...(endDate && { saleDate: { lte: new Date(endDate as string) } }),
                    ...(sellerId && { sellerId: parseInt(sellerId as string, 10) }),
                } as unknown as undefined;
                const sales = await prisma.sale.findMany({
                    where,
                    include: { seller: true, saleProducts: true },
                    skip,
                    take: pageSize,
                });

                const totalSales = await prisma.sale.count({ where });

                return res.status(200).json({
                    sales,
                    pagination: {
                        total: totalSales,
                        page: pageNumber,
                        limit: pageSize,
                        totalPages: Math.ceil(totalSales / pageSize),
                    },
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }

        case 'POST': {
            try {
                const newSale = await prisma.sale.create({
                    data: {
                        sellerId: user.id,
                        status: 'PENDING',
                        total: 0,
                        amountReceived: 0,
                        paymentMethod: 'CASH',
                        change: 0,
                    },
                });

                return res.status(201).json(newSale);
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