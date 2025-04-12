import { NextApiResponse } from 'next';
import prisma from '@/utils/prisma'; // Adjust path if needed
import authenticate from '@/lib/middleware';
import { AuthenticatedRequest } from '@/utils/types';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const user = req.user; // User object from middleware
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing user ID' });
  }

  const userId = Number(id); // Convert the string `id` to a number

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'DELETE') {
    // Fetch the user to be "deleted"
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Authorization rules for soft deletion
    if (userToDelete.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Deleting SUPER_ADMIN users is not allowed' });
    }

    if (user.role === 'ADMIN' && userToDelete.role !== 'USER') {
      return res.status(403).json({ error: 'Admins can only delete users with the USER role' });
    }

    try {
      // Soft delete the user by setting their status to INACTIVE
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          active: 'INACTIVE',
        },
      });

      return res.status(200).json({ message: 'User status updated to INACTIVE', user: updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { name, email, phone, role, active } = req.body;

    // Fetch the user to be updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Authorization rules for updating
    if (userToUpdate.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Updating SUPER_ADMIN users is not allowed' });
    }

    if (user.role === 'ADMIN' && userToUpdate.role !== 'USER') {
      return res.status(403).json({ error: 'Admins can only update users with the USER role' });
    }

    try {
      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(role && { role }),
          ...(active && { active }),
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default authenticate(handler);