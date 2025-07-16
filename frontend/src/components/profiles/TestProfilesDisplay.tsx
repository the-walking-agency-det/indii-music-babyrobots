import React, { useEffect, useState } from 'react';
import Button from '../button/Button';

interface Profile {
  id: number;
  userId: number;
  // Common fields that might be in any profile type
  createdAt: string;
  updatedAt: string;
  // Artist specific
  artistName?: string;
  bio?: string;
  // Fan specific
  displayName?: string;
  // Service provider specific
  companyName?: string;
  serviceType?: string;
  description?: string;
}

const TestProfilesDisplay: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Fetch from all profile tables
        const responses = await Promise.all([
          fetch('/api/profiles/artists'),
          fetch('/api/profiles/fans'),
          fetch('/api/profiles/service-providers')
        ]);

        const results = await Promise.all(
          responses.map(response => response.json())
        );

        // Combine all profiles
        const allProfiles = results.flat();
        setProfiles(allProfiles);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profiles');
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) return <div>Loading profiles...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Test Profiles Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => (
          <div key={profile.id} className="border p-4 rounded-lg shadow">
            {/* Artist Profile */}
            {profile.artistName && (
              <>
                <h3 className="font-bold">Artist Profile</h3>
                <p>Name: {profile.artistName}</p>
                <p>Bio: {profile.bio}</p>
              </>
            )}
            
            {/* Fan Profile */}
            {profile.displayName && (
              <>
                <h3 className="font-bold">Fan Profile</h3>
                <p>Display Name: {profile.displayName}</p>
                <p>Bio: {profile.bio}</p>
              </>
            )}
            
            {/* Service Provider Profile */}
            {profile.companyName && (
              <>
                <h3 className="font-bold">Service Provider Profile</h3>
                <p>Company: {profile.companyName}</p>
                <p>Service: {profile.serviceType}</p>
                <p>Description: {profile.description}</p>
              </>
            )}
            
            <div className="mt-2 text-sm text-gray-500">
              <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white"
        >
          Refresh Profiles
        </Button>
      </div>
    </div>
  );
};

export default TestProfilesDisplay;
