import React from 'react';
import TestProfilesDisplay from '../components/profiles/TestProfilesDisplay';

const TestProfilesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Database Profiles</h1>
      <TestProfilesDisplay />
    </div>
  );
};

export default TestProfilesPage;
