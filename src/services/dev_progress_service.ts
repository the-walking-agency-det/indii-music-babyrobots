interface Task {
  name: string;
  completed: boolean;
}

interface Ring {
  name: string;
  status: string;
  tasks: Task[];
}

interface DevStatus {
  rings: Ring[];
  metrics: {
    features_completed: number;
    total_features: number;
  };
}

interface DependencyGraphs {
  graphs: {
    [key: string]: string;
  };
}

export const fetchDevStatus = async (): Promise<DevStatus> => {
  const response = await fetch('/api/dev-progress/status');
  if (!response.ok) {
    throw new Error('Failed to fetch development status');
  }
  return response.json();
};

export const fetchDependencyGraphs = async (): Promise<DependencyGraphs> => {
  const response = await fetch('/api/dev-progress/dependency-graphs');
  if (!response.ok) {
    throw new Error('Failed to fetch dependency graphs');
  }
  return response.json();
};
