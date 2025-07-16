import React, { useState, useEffect } from 'react';
import { fetchDevStatus, fetchDependencyGraphs } from '../../services/dev_progress_service';
import { Card, Progress } from '../ui';
import { Mermaid } from 'mdx-mermaid/Mermaid';

interface Task {
  name: string;
  completed: boolean;
  criteria: string[];
}

interface Ring {
  name: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  tasks: Task[];
}

const DevStatusWidget: React.FC = () => {
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDevStatus = async () => {
      try {
        const status = await fetchDevStatus();
        setRings(status.rings);
      } catch (error) {
        console.error('Failed to load development status:', error);
        // Fallback to initial data
        setRings([
      {
        name: "Core Functionality Assessment",
        status: "in-progress",
        tasks: [
          { 
            name: "Map existing functionality",
            completed: true,
            criteria: ["Documentation complete", "Team review done"]
          },
          { 
            name: "Create dependency graph",
            completed: true,
            criteria: ["Visual documentation", "Validation scripts"]
          },
          { 
            name: "Document API endpoints",
            completed: false,
            criteria: ["OpenAPI/Swagger docs", "Endpoint validation"]
          }
        ]
      }
      // Add other rings here
    ]);
      }
    };
    loadDevStatus();
  }, []);

  const getStatusColor = (status: Ring['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const graphOptions = [
    { id: 'backend', name: 'Backend Dependencies' },
    { id: 'frontend', name: 'Frontend Components' },
    { id: 'database', name: 'Database Schema' }
  ];

  return (
    <Card className="uk-card-body uk-theme-zinc dark">
      <h3 className="uk-card-title uk-text-white">Development Status</h3>
      
      <div className="uk-margin-medium-top">
        <div className="uk-grid-small uk-child-width-1-3@m" uk-grid>
          <div>
            <Card className="uk-card-small uk-card-body">
              <h4 className="uk-text-white">Progress Overview</h4>
              <div className="uk-margin-small-top">
                {rings.map((ring, idx) => (
                  <div key={idx} className="uk-margin-small-bottom">
                    <div className="uk-flex uk-flex-middle uk-flex-between">
                      <span className="uk-text-small uk-text-muted">{ring.name}</span>
                      <span className={`uk-badge ${getStatusColor(ring.status)}`}>
                        {ring.status.replace('-', ' ')}
                      </span>
                    </div>
                    <Progress 
                      value={
                        (ring.tasks.filter(t => t.completed).length / ring.tasks.length) * 100
                      } 
                      variant="primary"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="uk-card-small uk-card-body">
              <h4 className="uk-text-white">System Architecture</h4>
              <div className="uk-margin-small-top">
                <select 
                  className="uk-select uk-form-small"
                  onChange={(e) => setSelectedGraph(e.target.value)}
                  value={selectedGraph || ''}
                >
                  <option value="">Select a view...</option>
                  {graphOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>

                {selectedGraph && (
                  <div className="uk-margin-small-top">
                    <Mermaid
                      chart={`
                        graph TD
                          A[Component A] --> B[Component B]
                          B --> C[Component C]
                      `}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="uk-card-small uk-card-body">
              <h4 className="uk-text-white">Recent Updates</h4>
              <div className="uk-margin-small-top">
                <ul className="uk-list uk-list-divider">
                  <li className="uk-text-small">
                    <span className="uk-text-success">✓</span> Mapped existing functionality
                  </li>
                  <li className="uk-text-small">
                    <span className="uk-text-success">✓</span> Created dependency graphs
                  </li>
                  <li className="uk-text-small">
                    <span className="uk-text-warning">→</span> API documentation in progress
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DevStatusWidget;
