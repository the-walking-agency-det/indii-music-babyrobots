import React, { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { usePanelManager, PANEL_TYPES } from './PanelManager';

const ContextualTrigger = ({
  children,
  panelConfig,
  trigger = 'click',
  className = '',
  disabled = false,
  delay = 0,
  onTrigger,
  ...props
}) => {
  const { openPanel } = usePanelManager();
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const triggerRef = useRef();
  const timeoutRef = useRef();

  const handleTrigger = useCallback((event) => {
    if (disabled) return;

    const triggerElement = triggerRef.current;
    const enhancedPanelConfig = {
      ...panelConfig,
      triggerElement,
      metadata: {
        ...panelConfig.metadata,
        triggeredBy: trigger,
        triggerTimestamp: Date.now()
      }
    };

    const executeOpen = () => {
      openPanel(enhancedPanelConfig);
      setIsActive(true);
      
      if (onTrigger) {
        onTrigger(enhancedPanelConfig);
      }
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(executeOpen, delay);
    } else {
      executeOpen();
    }
  }, [disabled, panelConfig, trigger, delay, openPanel, onTrigger]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (trigger === 'hover') {
      handleTrigger();
    }
  }, [trigger, handleTrigger]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleClick = useCallback((event) => {
    if (trigger === 'click') {
      handleTrigger(event);
    }
  }, [trigger, handleTrigger]);

  const handleDoubleClick = useCallback((event) => {
    if (trigger === 'doubleClick') {
      handleTrigger(event);
    }
  }, [trigger, handleTrigger]);

  const handleContextMenu = useCallback((event) => {
    if (trigger === 'rightClick') {
      event.preventDefault();
      handleTrigger(event);
    }
  }, [trigger, handleTrigger]);

  const handleKeyDown = useCallback((event) => {
    if (trigger === 'keydown' && event.key === 'Enter') {
      handleTrigger(event);
    }
  }, [trigger, handleTrigger]);

  return (
    <div
      ref={triggerRef}
      className={clsx(
        'contextual-trigger',
        {
          'contextual-trigger--active': isActive,
          'contextual-trigger--hovered': isHovered,
          'contextual-trigger--disabled': disabled
        },
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      tabIndex={trigger === 'keydown' ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Pre-configured trigger components for common use cases
export const FileDropTrigger = ({ onFileDrop, children, ...props }) => {
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0 && onFileDrop) {
      onFileDrop(files);
    }
  }, [onFileDrop]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div
      className="file-drop-trigger"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      {...props}
    >
      {children}
    </div>
  );
};

export const TrackInspectorTrigger = ({ track, children, ...props }) => {
  const panelConfig = {
    type: PANEL_TYPES.SECONDARY,
    component: 'TrackProperties',
    context: { track },
    size: { width: 350, height: 500 },
    metadata: {
      title: `Track Properties - ${track.title}`,
      category: 'inspector'
    }
  };

  return (
    <ContextualTrigger panelConfig={panelConfig} {...props}>
      {children}
    </ContextualTrigger>
  );
};

export const FileInspectorTrigger = ({ file, children, ...props }) => {
  const panelConfig = {
    type: PANEL_TYPES.SECONDARY,
    component: 'FileInspector',
    context: { file },
    size: { width: 400, height: 450 },
    metadata: {
      title: `File Inspector - ${file.name}`,
      category: 'inspector'
    }
  };

  return (
    <ContextualTrigger panelConfig={panelConfig} {...props}>
      {children}
    </ContextualTrigger>
  );
};

export const AgentSummonTrigger = ({ agent, context, children, ...props }) => {
  const panelConfig = {
    type: PANEL_TYPES.AGENT,
    component: 'AgentChat',
    context: { agent, ...context },
    size: { width: 450, height: 600 },
    metadata: {
      title: `${agent.name} - AI Assistant`,
      category: 'agent'
    }
  };

  return (
    <ContextualTrigger panelConfig={panelConfig} {...props}>
      {children}
    </ContextualTrigger>
  );
};

export const MasteringAgentTrigger = ({ track, children, ...props }) => {
  const panelConfig = {
    type: PANEL_TYPES.AGENT,
    component: 'MasteringAgent',
    context: { track },
    size: { width: 500, height: 650 },
    metadata: {
      title: 'Mastering Agent',
      category: 'agent'
    }
  };

  return (
    <ContextualTrigger panelConfig={panelConfig} {...props}>
      {children}
    </ContextualTrigger>
  );
};

export const ArtAgentTrigger = ({ trackMetadata, children, ...props }) => {
  const panelConfig = {
    type: PANEL_TYPES.AGENT,
    component: 'ArtAgent',
    context: { trackMetadata },
    size: { width: 550, height: 700 },
    metadata: {
      title: 'Art Agent',
      category: 'agent'
    }
  };

  return (
    <ContextualTrigger panelConfig={panelConfig} {...props}>
      {children}
    </ContextualTrigger>
  );
};

// Higher-order component for adding contextual triggers to existing components
export const withContextualTrigger = (Component, defaultPanelConfig) => {
  return React.forwardRef((props, ref) => {
    const { triggerProps, panelConfig, ...componentProps } = props;
    
    const finalPanelConfig = {
      ...defaultPanelConfig,
      ...panelConfig
    };

    return (
      <ContextualTrigger 
        panelConfig={finalPanelConfig} 
        {...triggerProps}
      >
        <Component ref={ref} {...componentProps} />
      </ContextualTrigger>
    );
  });
};

// Hook for creating contextual triggers programmatically
export const useContextualTrigger = (panelConfig, options = {}) => {
  const { openPanel } = usePanelManager();
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback((additionalContext = {}) => {
    if (options.disabled) return;

    const enhancedPanelConfig = {
      ...panelConfig,
      context: {
        ...panelConfig.context,
        ...additionalContext
      },
      metadata: {
        ...panelConfig.metadata,
        triggeredBy: 'programmatic',
        triggerTimestamp: Date.now()
      }
    };

    openPanel(enhancedPanelConfig);
    setIsActive(true);

    if (options.onTrigger) {
      options.onTrigger(enhancedPanelConfig);
    }
  }, [panelConfig, options, openPanel]);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    trigger,
    reset,
    isActive
  };
};

export default ContextualTrigger;
