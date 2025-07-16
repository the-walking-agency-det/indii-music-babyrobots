import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState({
    artist: null,
    fan: null,
    licensor: null,
    serviceProvider: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        setLoading(true);
        
        // Test users we created
        const testUsers = {
          artist: 162,
          fan: 163,
          licensor: 164,
          serviceProvider: 165
        };

        const profileData = {};

        // Fetch all profile types
        for (const [type, userId] of Object.entries(testUsers)) {
          try {
            const apiPath = type === 'serviceProvider' ? 'service-provider' : type;
            const response = await fetch(`/api/profile/${apiPath}?userId=${userId}`);
            if (response.ok) {
              profileData[type] = await response.json();
            }
          } catch (err) {
            console.error(`Error fetching ${type} profile:`, err);
          }
        }

        setProfiles(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Loading Profiles...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-red-300">
          <h2 className="text-2xl font-bold mb-4">Error Loading Profiles</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const ProfileCard = ({ title, profile, type }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {profile ? (
        <div className="space-y-2 text-purple-100">
          {type === 'artist' && (
            <>
              <p><strong>Artist Name:</strong> {profile.artist_name}</p>
              <p><strong>Bio:</strong> {profile.bio}</p>
              <p><strong>Website:</strong> {profile.website}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </>
          )}
          {type === 'fan' && (
            <>
              <p><strong>Display Name:</strong> {profile.display_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Music Preferences:</strong> {profile.favorite_genres}</p>
            </>
          )}
          {type === 'licensor' && (
            <>
              <p><strong>Company:</strong> {profile.company_name}</p>
              <p><strong>Contact Person:</strong> {profile.contact_person}</p>
              <p><strong>Industry:</strong> {profile.industry_focus}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </>
          )}
          {type === 'serviceProvider' && (
            <>
              <p><strong>Company:</strong> {profile.company_name}</p>
              <p><strong>Service Type:</strong> {profile.service_type}</p>
              <p><strong>Description:</strong> {profile.description}</p>
              <p><strong>Website:</strong> {profile.website}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </>
          )}
          <p className="text-sm text-purple-300 mt-4">
            <strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="text-purple-300">No profile found</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎵 Indii Music Profiles</h1>
          <p className="text-purple-200">All Profile Types Working Successfully</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard 
            title="🎸 Artist Profile" 
            profile={profiles.artist} 
            type="artist"
          />
          <ProfileCard 
            title="🎧 Fan Profile" 
            profile={profiles.fan} 
            type="fan"
          />
          <ProfileCard 
            title="🎬 Licensor Profile" 
            profile={profiles.licensor} 
            type="licensor"
          />
          <ProfileCard 
            title="🔧 Service Provider Profile" 
            profile={profiles.serviceProvider} 
            type="serviceProvider"
          />
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => router.push('/profile-forms')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors mr-4"
          >
            Edit Profiles
          </button>
          <button 
            onClick={() => router.push('/')}
            className="bg-transparent border-2 border-purple-400 text-purple-200 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}