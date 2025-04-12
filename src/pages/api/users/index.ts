import { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '@/lib/middleware'; // Adjust path if needed
import { AuthenticatedRequest } from '@/utils/types';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const user = req.user; // User object from middleware

  if (req.method === 'POST') {
    // Ensure only authenticated users with the correct roles can access this endpoint
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role creation permissions
    if (role === 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only SUPER_ADMIN can create ADMIN users' });
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Creating SUPER_ADMIN users is not allowed' });
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role,
          active: 'ACTIVE', // Default status is ACTIVE
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    // Ensure only ADMIN and SUPER_ADMIN can access this endpoint
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    try {
      // Fetch paginated users
      const users = await prisma.user.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalUsers = await prisma.user.count();

      return res.status(200).json({
        data: users,
        meta: {
          total: totalUsers,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalUsers / pageSize),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default authenticate(handler);