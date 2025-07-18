import React from 'react';

const ReleasePlannerKanban: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Release Planner Kanban</h3>
      <p>This is a placeholder for your release planning board. Organize your release tasks here.</p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded-md">
          <h4 className="font-semibold mb-2">To Do</h4>
          <ul className="space-y-2">
            <li className="bg-gray-600 p-2 rounded-md">Task: Record Vocals</li>
            <li className="bg-gray-600 p-2 rounded-md">Task: Mix Track</li>
          </ul>
        </div>
        <div className="bg-gray-700 p-3 rounded-md">
          <h4 className="font-semibold mb-2">In Progress</h4>
          <ul className="space-y-2">
            <li className="bg-gray-600 p-2 rounded-md">Task: Master Track</li>
          </ul>
        </div>
        <div className="bg-gray-700 p-3 rounded-md">
          <h4 className="font-semibold mb-2">Done</h4>
          <ul className="space-y-2">
            <li className="bg-gray-600 p-2 rounded-md">Task: Write Lyrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReleasePlannerKanban;