import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">INDII Music Platform</h1>
      
      <div className="grid gap-4">
        <Link 
          href="/test-profiles" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          View Test Profiles
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
