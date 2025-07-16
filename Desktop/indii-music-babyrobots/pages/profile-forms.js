import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfileFormsPage() {
  const [activeTab, setActiveTab] = useState('artist');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch users for testing
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/test-user');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const apiPath = activeTab === 'serviceProvider' ? 'service-provider' : activeTab;
      const response = await fetch(`/api/profile/${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${activeTab} profile created successfully!`);
        setFormData({});
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const FormField = ({ label, name, type = 'text', required = false, as = 'input' }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-purple-200 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          required={required}
          rows="3"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          required={required}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      )}
    </div>
  );

  const UserSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-purple-200 mb-2">
        Select User <span className="text-red-400">*</span>
      </label>
      <select
        name="userId"
        value={formData.userId || ''}
        onChange={handleInputChange}
        required
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select a user...</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.username} ({user.email}) - {user.profile_type}
          </option>
        ))}
      </select>
    </div>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'artist':
        return (
          <>
            <FormField label="Stage Name" name="stageName" required />
            <FormField label="Bio" name="bio" as="textarea" />
            <FormField label="Website" name="website" type="url" />
            <FormField label="Social Links (JSON)" name="socialLinks" as="textarea" />
          </>
        );
      case 'fan':
        return (
          <>
            <FormField label="Display Name" name="displayName" required />
            <FormField label="Music Preferences (JSON)" name="musicPreferences" as="textarea" />
            <FormField label="Listening History (JSON)" name="listeningHistory" as="textarea" />
          </>
        );
      case 'licensor':
        return (
          <>
            <FormField label="Company Name" name="companyName" required />
            <FormField label="Contact Person" name="contactPerson" />
            <FormField label="Industry" name="industry" />
            <FormField label="Budget Range" name="budgetRange" />
            <FormField label="Licensing Needs" name="licensingNeeds" as="textarea" />
          </>
        );
      case 'serviceProvider':
        return (
          <>
            <FormField label="Company Name" name="companyName" required />
            <FormField label="Service Type" name="serviceType" required />
            <FormField label="Description" name="description" as="textarea" />
            <FormField label="Website" name="website" type="url" />
            <FormField label="Contact Email" name="contactEmail" type="email" />
            <FormField label="Phone" name="phone" type="tel" />
            <FormField label="Pricing Info" name="pricingInfo" as="textarea" />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎵 Profile Forms</h1>
          <p className="text-purple-200">Create and manage user profiles</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: 'artist', label: '🎸 Artist', emoji: '🎸' },
            { key: 'fan', label: '🎧 Fan', emoji: '🎧' },
            { key: 'licensor', label: '🎬 Licensor', emoji: '🎬' },
            { key: 'serviceProvider', label: '🔧 Service Provider', emoji: '🔧' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setFormData({});
                setMessage('');
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            {activeTab === 'artist' && '🎸 Artist Profile'}
            {activeTab === 'fan' && '🎧 Fan Profile'}
            {activeTab === 'licensor' && '🎬 Licensor Profile'}
            {activeTab === 'serviceProvider' && '🔧 Service Provider Profile'}
          </h2>

          <form onSubmit={handleSubmit}>
            <UserSelector />
            {renderForm()}
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Creating...' : `Create ${activeTab} Profile`}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profiles')}
                className="bg-transparent border-2 border-purple-400 text-purple-200 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View All Profiles
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
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