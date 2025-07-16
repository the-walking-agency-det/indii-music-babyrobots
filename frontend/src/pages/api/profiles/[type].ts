import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    let profiles;

    switch (type) {
      case 'artists':
        profiles = await prisma.artistProfile.findMany({
          include: {
            user: {
              select: {
                email: true,
                username: true
              }
            }
          }
        });
        break;

      case 'fans':
        profiles = await prisma.fanProfile.findMany({
          include: {
            user: {
              select: {
                email: true,
                username: true
              }
            }
          }
        });
        break;

      case 'service-providers':
        profiles = await prisma.serviceProviderProfile.findMany({
          include: {
            user: {
              select: {
                email: true,
                username: true
              }
            }
          }
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid profile type' });
    }

    res.status(200).json(profiles);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profiles' });
  } finally {
    await prisma.$disconnect();
  }
}
