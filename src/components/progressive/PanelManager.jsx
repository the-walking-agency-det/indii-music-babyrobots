import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';

// Panel Context
const PanelContext = createContext();

// Panel types
export const PANEL_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OVERLAY: 'overlay',
  AGENT: 'agent',
  TOOL: 'tool'
};

// Panel states
export const PANEL_STATES = {
  OPEN: 'open',
  MINIMIZED: 'minimized',
  HIDDEN: 'hidden'
};

// Initial state
const initialState = {
  panels: {},
  activePanel: null,
  context: {},
  zIndexCounter: 1000
};

// Panel reducer
const panelReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_PANEL': {
      const { panelConfig } = action.payload;
      const panelId = panelConfig.id || nanoid();
      
      // Calculate optimal position if not provided
      const position = panelConfig.position || calculateOptimalPosition(state, panelConfig);
      
      const newPanel = {
        id: panelId,
        type: panelConfig.type || PANEL_TYPES.PRIMARY,
        component: panelConfig.component,
        position,
        size: panelConfig.size || { width: 400, height: 300 },
        zIndex: state.zIndexCounter + 1,
        state: PANEL_STATES.OPEN,
        context: panelConfig.context || {},
        parentId: panelConfig.parentId || null,
        metadata: panelConfig.metadata || {}
      };

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: newPanel
        },
        activePanel: panelId,
        zIndexCounter: state.zIndexCounter + 1
      };
    }

    case 'CLOSE_PANEL': {
      const { panelId } = action.payload;
      const { [panelId]: removedPanel, ...remainingPanels } = state.panels;
      
      // Close any child panels
      const childPanels = Object.keys(remainingPanels).filter(
        id => remainingPanels[id].parentId === panelId
      );
      
      childPanels.forEach(childId => {
        delete remainingPanels[childId];
      });

      return {
        ...state,
        panels: remainingPanels,
        activePanel: state.activePanel === panelId ? null : state.activePanel
      };
    }

    case 'FOCUS_PANEL': {
      const { panelId } = action.payload;
      const panel = state.panels[panelId];
      
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            zIndex: state.zIndexCounter + 1
          }
        },
        activePanel: panelId,
        zIndexCounter: state.zIndexCounter + 1
      };
    }

    case 'MINIMIZE_PANEL': {
      const { panelId } = action.payload;
      const panel = state.panels[panelId];
      
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            state: PANEL_STATES.MINIMIZED
          }
        }
      };
    }

    case 'RESTORE_PANEL': {
      const { panelId } = action.payload;
      const panel = state.panels[panelId];
      
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            state: PANEL_STATES.OPEN,
            zIndex: state.zIndexCounter + 1
          }
        },
        activePanel: panelId,
        zIndexCounter: state.zIndexCounter + 1
      };
    }

    case 'UPDATE_PANEL_POSITION': {
      const { panelId, position } = action.payload;
      const panel = state.panels[panelId];
      
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            position
          }
        }
      };
    }

    case 'UPDATE_PANEL_SIZE': {
      const { panelId, size } = action.payload;
      const panel = state.panels[panelId];
      
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            size
          }
        }
      };
    }

    case 'UPDATE_CONTEXT': {
      const { context } = action.payload;
      return {
        ...state,
        context: {
          ...state.context,
          ...context
        }
      };
    }

    default:
      return state;
  }
};

// Utility function to calculate optimal panel position
const calculateOptimalPosition = (state, panelConfig) => {
  const existingPanels = Object.values(state.panels);
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Default position
  let position = { x: 100, y: 100 };

  // For agent panels, position near the trigger if available
  if (panelConfig.type === PANEL_TYPES.AGENT && panelConfig.triggerElement) {
    const triggerRect = panelConfig.triggerElement.getBoundingClientRect();
    position = {
      x: triggerRect.right + 20,
      y: triggerRect.top
    };
  }

  // For child panels, position relative to parent
  if (panelConfig.parentId) {
    const parent = state.panels[panelConfig.parentId];
    if (parent) {
      position = {
        x: parent.position.x + 50,
        y: parent.position.y + 50
      };
    }
  }

  // Ensure panel fits within viewport
  const panelSize = panelConfig.size || { width: 400, height: 300 };
  if (position.x + panelSize.width > viewport.width) {
    position.x = viewport.width - panelSize.width - 20;
  }
  if (position.y + panelSize.height > viewport.height) {
    position.y = viewport.height - panelSize.height - 20;
  }

  // Avoid overlapping with existing panels
  let attempts = 0;
  while (attempts < 10) {
    const overlapping = existingPanels.some(panel => {
      return (
        position.x < panel.position.x + panel.size.width &&
        position.x + panelSize.width > panel.position.x &&
        position.y < panel.position.y + panel.size.height &&
        position.y + panelSize.height > panel.position.y
      );
    });

    if (!overlapping) break;

    // Offset position to avoid overlap
    position.x += 30;
    position.y += 30;
    attempts++;
  }

  return position;
};

// Panel Manager Component
export const PanelManager = ({ children }) => {
  const [state, dispatch] = useReducer(panelReducer, initialState);

  const openPanel = useCallback((panelConfig) => {
    dispatch({ type: 'OPEN_PANEL', payload: { panelConfig } });
  }, []);

  const closePanel = useCallback((panelId) => {
    dispatch({ type: 'CLOSE_PANEL', payload: { panelId } });
  }, []);

  const focusPanel = useCallback((panelId) => {
    dispatch({ type: 'FOCUS_PANEL', payload: { panelId } });
  }, []);

  const minimizePanel = useCallback((panelId) => {
    dispatch({ type: 'MINIMIZE_PANEL', payload: { panelId } });
  }, []);

  const restorePanel = useCallback((panelId) => {
    dispatch({ type: 'RESTORE_PANEL', payload: { panelId } });
  }, []);

  const updatePanelPosition = useCallback((panelId, position) => {
    dispatch({ type: 'UPDATE_PANEL_POSITION', payload: { panelId, position } });
  }, []);

  const updatePanelSize = useCallback((panelId, size) => {
    dispatch({ type: 'UPDATE_PANEL_SIZE', payload: { panelId, size } });
  }, []);

  const updateContext = useCallback((context) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: { context } });
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && state.activePanel) {
        closePanel(state.activePanel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activePanel, closePanel]);

  const contextValue = {
    panels: state.panels,
    activePanel: state.activePanel,
    context: state.context,
    openPanel,
    closePanel,
    focusPanel,
    minimizePanel,
    restorePanel,
    updatePanelPosition,
    updatePanelSize,
    updateContext
  };

  return (
    <PanelContext.Provider value={contextValue}>
      {children}
    </PanelContext.Provider>
  );
};

// Hook to use panel context
export const usePanelManager = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanelManager must be used within a PanelManager');
  }
  return context;
};

// Hook for contextual UI logic
export const useContextualUI = () => {
  const { context, updateContext } = usePanelManager();
  
  const setContext = useCallback((newContext) => {
    updateContext(newContext);
  }, [updateContext]);

  const clearContext = useCallback(() => {
    updateContext({});
  }, [updateContext]);

  return {
    context,
    setContext,
    clearContext
  };
};

export default PanelManager;
