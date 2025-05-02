import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma'; // Adjust path if needed
import { AuthenticatedHandler, AuthenticatedRequest, Role, UserToken } from '@/utils/types';


const authenticate = (handler: AuthenticatedHandler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if(token === process.env.CUSTOM_API_KEY) {
      req.user = {
        id: 2,
        email: 'custom-api@abarroteslulu.com',
        name: 'Custom API',
        role: Role.USER,
        active: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        password:'',
        phone: '',
      }
      return handler(req, res);
    }

    try {
      const decoded: UserToken = jwt.verify(token, process.env.JWT_SECRET!) as UserToken;
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.active !== 'ACTIVE') {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Attach user to the request object
      req.user = user;

      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

export default authenticate;