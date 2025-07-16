import React from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';

interface Profile {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  // Profile-specific fields
  artistName?: string;
  displayName?: string;
  companyName?: string;
  serviceType?: string;
  description?: string;
  bio?: string;
}

interface Props {
  profiles: {
    artists: Profile[];
    fans: Profile[];
    serviceProviders: Profile[];
  };
}

export const getServerSideProps: GetServerSideProps = async () => {
  const prisma = new PrismaClient();

  try {
    const [artists, fans, serviceProviders] = await Promise.all([
      prisma.artistProfile.findMany({
        include: {
          user: {
            select: {
              email: true,
              username: true
            }
          }
        }
      }),
      prisma.fanProfile.findMany({
        include: {
          user: {
            select: {
              email: true,
              username: true
            }
          }
        }
      }),
      prisma.serviceProviderProfile.findMany({
        include: {
          user: {
            select: {
              email: true,
              username: true
            }
          }
        }
      })
    ]);

    return {
      props: {
        profiles: {
          artists: artists.map((artist) => ({
            ...artist,
            createdAt: artist.createdAt.toISOString(),
            updatedAt: artist.updatedAt.toISOString(),
          })),
          fans: fans.map((fan) => ({
            ...fan,
            createdAt: fan.createdAt.toISOString(),
            updatedAt: fan.updatedAt.toISOString(),
          })),
          serviceProviders: serviceProviders.map((provider) => ({
            ...provider,
            createdAt: provider.createdAt.toISOString(),
            updatedAt: provider.updatedAt.toISOString(),
          }))
        }
      }
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return {
      props: {
        profiles: {
          artists: [],
          fans: [],
          serviceProviders: []
        }
      }
    };
  } finally {
    await prisma.$disconnect();
  }
};

const TestProfilesPage: React.FC<Props> = ({ profiles }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Database Profiles</h1>
      
      {/* Artists Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Artist Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.artists.map((profile) => (
            <div key={profile.id} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">Artist Profile</h3>
              <p>Name: {profile.artistName}</p>
              <p>Bio: {profile.bio}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fans Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Fan Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.fans.map((profile) => (
            <div key={profile.id} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">Fan Profile</h3>
              <p>Display Name: {profile.displayName}</p>
              <p>Bio: {profile.bio}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Providers Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Service Provider Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.serviceProviders.map((profile) => (
            <div key={profile.id} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">Service Provider Profile</h3>
              <p>Company: {profile.companyName}</p>
              <p>Service: {profile.serviceType}</p>
              <p>Description: {profile.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TestProfilesPage;
