import React from 'react';

const MusicMoodboard: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Music Moodboard</h3>
      <p>This is a placeholder for your music moodboard. Save and react to music here.</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded-md text-center">
          <p>Mood: Energetic</p>
          <p>Songs: 3</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-md text-center">
          <p>Mood: Relaxing</p>
          <p>Songs: 5</p>
        </div>
      </div>
    </div>
  );
};

export default MusicMoodboard;