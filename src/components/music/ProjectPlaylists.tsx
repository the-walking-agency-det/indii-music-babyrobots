import React from 'react';

const ProjectPlaylists: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Project Playlists</h3>
      <p>This is a placeholder for project-specific playlists. Select multiple tracks and add notes.</p>
      <ul className="mt-4 space-y-2">
        <li className="p-2 bg-gray-700 rounded-md">Project Alpha - Playlist (5 tracks)</li>
        <li className="p-2 bg-gray-700 rounded-md">Project Beta - Soundtrack (8 tracks)</li>
      </ul>
    </div>
  );
};

export default ProjectPlaylists;