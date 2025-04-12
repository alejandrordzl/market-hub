import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma'; // Adjust path if needed

const authenticate = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.active !== 'ACTIVE') {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Attach user to the request object
      (req as any).user = user;

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export default authenticate;