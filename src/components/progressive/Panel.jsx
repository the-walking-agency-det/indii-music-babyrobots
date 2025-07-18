import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  XMarkIcon, 
  MinusIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon 
} from '@heroicons/react/24/outline';
import { usePanelManager, PANEL_STATES } from './PanelManager';

const Panel = ({ 
  id, 
  type, 
  title,
  children, 
  resizable = true,
  draggable = true,
  closable = true,
  minimizable = true,
  className = '',
  headerClassName = '',
  bodyClassName = ''
}) => {
  const {
    panels,
    activePanel,
    focusPanel,
    closePanel,
    minimizePanel,
    restorePanel,
    updatePanelPosition,
    updatePanelSize
  } = usePanelManager();

  const panel = panels[id];
  const panelRef = useRef();
  const headerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle panel focus
  const handleFocus = useCallback(() => {
    if (activePanel !== id) {
      focusPanel(id);
    }
  }, [activePanel, id, focusPanel]);

  // Handle dragging
  const handleMouseDown = useCallback((e) => {
    if (!draggable || isResizing) return;
    
    e.preventDefault();
    setIsDragging(true);
    handleFocus();
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [draggable, isResizing, handleFocus]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggable) return;
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    // Constrain to viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    newPosition.x = Math.max(0, Math.min(newPosition.x, viewport.width - panel.size.width));
    newPosition.y = Math.max(0, Math.min(newPosition.y, viewport.height - panel.size.height));
    
    updatePanelPosition(id, newPosition);
  }, [isDragging, draggable, dragOffset, id, panel?.size, updatePanelPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle resizing
  const handleResizeStart = useCallback((e, direction) => {
    if (!resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    handleFocus();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panel.size.width;
    const startHeight = panel.size.height;
    
    const handleResizeMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction.includes('right')) {
        newWidth = Math.max(200, startWidth + deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(150, startHeight + deltaY);
      }
      
      updatePanelSize(id, { width: newWidth, height: newHeight });
    };
    
    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [resizable, panel?.size, id, updatePanelSize, handleFocus]);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle close
  const handleClose = useCallback(() => {
    closePanel(id);
  }, [id, closePanel]);

  // Handle minimize/restore
  const handleMinimize = useCallback(() => {
    if (panel.state === PANEL_STATES.MINIMIZED) {
      restorePanel(id);
    } else {
      minimizePanel(id);
    }
  }, [panel?.state, id, minimizePanel, restorePanel]);

  if (!panel) return null;

  const panelVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    minimized: { 
      opacity: 0.8, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const isMinimized = panel.state === PANEL_STATES.MINIMIZED;
  const isActive = activePanel === id;

  return (
    <AnimatePresence>
      {panel.state !== PANEL_STATES.HIDDEN && (
        <motion.div
          ref={panelRef}
          className={clsx(
            'panel',
            `panel--${type}`,
            {
              'panel--active': isActive,
              'panel--dragging': isDragging,
              'panel--resizing': isResizing,
              'panel--fullscreen': isFullscreen,
              'panel--minimized': isMinimized
            },
            className
          )}
          style={{
            position: 'absolute',
            left: isFullscreen ? 0 : panel.position.x,
            top: isFullscreen ? 0 : panel.position.y,
            width: isFullscreen ? '100vw' : panel.size.width,
            height: isFullscreen ? '100vh' : panel.size.height,
            zIndex: panel.zIndex,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          variants={panelVariants}
          initial="hidden"
          animate={isMinimized ? 'minimized' : 'visible'}
          exit="hidden"
          onMouseDown={handleFocus}
        >
          {/* Panel Header */}
          <div
            ref={headerRef}
            className={clsx(
              'panel-header',
              {
                'cursor-grab': draggable && !isDragging,
                'cursor-grabbing': isDragging
              },
              headerClassName
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="panel-header-content">
              <div className="panel-title">
                {title || `Panel ${id}`}
              </div>
              
              <div className="panel-controls">
                {minimizable && (
                  <button
                    className="panel-control-btn"
                    onClick={handleMinimize}
                    title={isMinimized ? 'Restore' : 'Minimize'}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  className="panel-control-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-4 h-4" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  )}
                </button>
                
                {closable && (
                  <button
                    className="panel-control-btn panel-control-btn--close"
                    onClick={handleClose}
                    title="Close"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Panel Body */}
          <div className={clsx('panel-body', bodyClassName)}>
            {children}
          </div>

          {/* Resize Handles */}
          {resizable && !isFullscreen && (
            <>
              <div
                className="resize-handle resize-handle--right"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
              <div
                className="resize-handle resize-handle--bottom"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              />
              <div
                className="resize-handle resize-handle--bottom-right"
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Panel;
