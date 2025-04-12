import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma'; // Adjust path if needed

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user || user.active !== 'ACTIVE') {
      return res.status(401).json({ error: 'Cannot find user ID' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid user ID or password' });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!, // Ensure JWT_SECRET is set in your .env file
      { expiresIn: '12h' } // Token expires in 12 hours
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;