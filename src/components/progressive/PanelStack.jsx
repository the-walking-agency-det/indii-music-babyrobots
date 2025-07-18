import React from 'react';
import { clsx } from 'clsx';
import Panel from './Panel';
import { usePanelManager, PANEL_STATES } from './PanelManager';

const PanelStack = ({ className = '' }) => {
  const { panels } = usePanelManager();

  // Get panels sorted by z-index
  const sortedPanels = Object.values(panels)
    .filter(panel => panel.state !== PANEL_STATES.HIDDEN)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={clsx('panel-stack', className)}>
      {sortedPanels.map(panel => (
        <Panel
          key={panel.id}
          id={panel.id}
          type={panel.type}
          title={panel.metadata?.title}
        >
          {/* Dynamic component rendering based on panel.component */}
          {panel.component && <PanelContent panel={panel} />}
        </Panel>
      ))}
    </div>
  );
};

// Dynamic component renderer
const PanelContent = ({ panel }) => {
  // This would be enhanced to dynamically load components
  // For now, we'll render based on the component type
  switch (panel.component) {
    case 'MasteringAgent':
      return <MasteringAgentPanel context={panel.context} />;
    case 'ArtAgent':
      return <ArtAgentPanel context={panel.context} />;
    case 'FileInspector':
      return <FileInspectorPanel context={panel.context} />;
    case 'TrackProperties':
      return <TrackPropertiesPanel context={panel.context} />;
    case 'AgentChat':
      return <AgentChatPanel context={panel.context} />;
    default:
      return <DefaultPanelContent panel={panel} />;
  }
};

// Default panel content
const DefaultPanelContent = ({ panel }) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">
      {panel.metadata?.title || 'Panel'}
    </h3>
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Panel ID: {panel.id}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Type: {panel.type}
      </div>
      {panel.context && Object.keys(panel.context).length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium mb-2">Context:</div>
          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
            {JSON.stringify(panel.context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  </div>
);

// Example panel components
const MasteringAgentPanel = ({ context }) => (
  <div className="p-4 h-full">
    <h3 className="text-lg font-semibold mb-4">Mastering Agent</h3>
    <div className="space-y-4">
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Track Analysis</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyzing audio levels and frequency balance...
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Peak Level:</span>
          <span className="font-mono">-3.2 dB</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>RMS Level:</span>
          <span className="font-mono">-12.8 dB</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Dynamic Range:</span>
          <span className="font-mono">9.6 dB</span>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Suggestions</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Increase compression ratio to 3:1</li>
          <li>• Boost high frequencies by 2dB</li>
          <li>• Apply gentle limiting at -1dB</li>
        </ul>
      </div>
    </div>
  </div>
);

const ArtAgentPanel = ({ context }) => (
  <div className="p-4 h-full">
    <h3 className="text-lg font-semibold mb-4">Art Agent</h3>
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Artwork Generation</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Creating artwork based on track metadata...
        </p>
      </div>
      
      {context?.trackMetadata && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Genre:</span>
            <span>{context.trackMetadata.genre}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Mood:</span>
            <span>{context.trackMetadata.mood}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Style:</span>
            <span>{context.trackMetadata.style}</span>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Concepts</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center text-sm">
            Concept 1
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center text-sm">
            Concept 2
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center text-sm">
            Concept 3
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center text-sm">
            Concept 4
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FileInspectorPanel = ({ context }) => (
  <div className="p-4 h-full">
    <h3 className="text-lg font-semibold mb-4">File Inspector</h3>
    <div className="space-y-4">
      {context?.file && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">File Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-mono">{context.file.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-mono">{context.file.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-mono">{context.file.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Modified:</span>
              <span className="font-mono">{context.file.modified}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2">Actions</h4>
        <div className="space-y-2">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600">
            Open in Editor
          </button>
          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600">
            Show in Finder
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TrackPropertiesPanel = ({ context }) => (
  <div className="p-4 h-full">
    <h3 className="text-lg font-semibold mb-4">Track Properties</h3>
    <div className="space-y-4">
      {context?.track && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue={context.track.title}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Artist</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue={context.track.artist}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Genre</label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option>Electronic</option>
              <option>Rock</option>
              <option>Pop</option>
              <option>Hip-Hop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">BPM</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue={context.track.bpm}
            />
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t">
        <button className="w-full bg-green-500 text-white py-2 px-4 rounded text-sm hover:bg-green-600">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

const AgentChatPanel = ({ context }) => (
  <div className="p-4 h-full flex flex-col">
    <h3 className="text-lg font-semibold mb-4">
      {context?.agent?.name || 'AI Agent'}
    </h3>
    
    <div className="flex-1 border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800">
      <div className="space-y-2">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
          <div className="text-sm font-medium">Agent</div>
          <div className="text-sm">How can I help you today?</div>
        </div>
        
        {context?.messages?.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              message.sender === 'user'
                ? 'bg-green-100 dark:bg-green-900/30 ml-4'
                : 'bg-blue-100 dark:bg-blue-900/30 mr-4'
            }`}
          >
            <div className="text-sm font-medium">
              {message.sender === 'user' ? 'You' : 'Agent'}
            </div>
            <div className="text-sm">{message.text}</div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="flex space-x-2">
      <input
        type="text"
        className="flex-1 px-3 py-2 border rounded-md"
        placeholder="Type a message..."
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
        Send
      </button>
    </div>
  </div>
);

export default PanelStack;
