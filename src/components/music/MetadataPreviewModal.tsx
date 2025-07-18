import React from 'react';

const MetadataPreviewModal: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Metadata Preview Modal</h3>
      <p>This is a placeholder for a modal that shows track metadata on hover/focus.</p>
      <div className="mt-4">
        <p><strong>Track Title:</strong> Example Song</p>
        <p><strong>Artist:</strong> Example Artist</p>
        <p><strong>Genre:</strong> Pop</p>
        <p><strong>Length:</strong> 3:30</p>
        <p><strong>ISRC:</strong> US-XXXXX-YY-ZZZZZ</p>
      </div>
    </div>
  );
};

export default MetadataPreviewModal;