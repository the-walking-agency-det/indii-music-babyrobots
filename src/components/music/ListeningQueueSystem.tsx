import React from 'react';

const ListeningQueueSystem: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Listening Queue</h3>
      <p>This is a placeholder for your listening queue. Drag and reorder your music here.</p>
      <ul className="mt-4 space-y-2">
        <li className="p-2 bg-gray-700 rounded-md">Song A - Artist 1</li>
        <li className="p-2 bg-gray-700 rounded-md">Song B - Artist 2</li>
        <li className="p-2 bg-gray-700 rounded-md">Song C - Artist 3</li>
      </ul>
    </div>
  );
};

export default ListeningQueueSystem;