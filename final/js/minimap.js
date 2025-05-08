/**
 * Mimetic Magick Knowledge Graph Explorer
 * Minimap Module
 * 
 * This file implements a minimap for easier navigation of large knowledge graphs,
 * providing users with an overview of the entire graph and their current viewport.
 */

class GraphMinimap {
  constructor(graphVisualization, options = {}) {
    this.graph = graphVisualization;
    this.options = Object.assign({
      container: 'minimap-container',
      width: 150,
      height: 150,
      position: 'bottom-left',
      margin: 10,
      backgroundColor: 'rgba(26, 42, 58, 0.7)',
      borderColor: '#4a6b8a',
      viewportColor: 'rgba(241, 196, 15, 0.3)',
      viewportBorderColor: '#f1c40f'
    }, options);
    
    this.canvas = null;
    this.ctx = null;
    this.isVisible = true;
    this.isDragging = false;
    this.lastUpdateTime = 0;
    this.updateInterval = 500; // ms between updates
    
    this.initialize();
  }
  
  /**
   * Initialize the minimap
   */
  initialize() {
    this.createMinimapContainer();
    this.createCanvas();
    this.setupEventListeners();
    this.render();
  }
  
  /**
   * Create the minimap container
   */
  createMinimapContainer() {
    // Check if container already exists
    let container = document.getElementById(this.options.container);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.container;
      container.className = 'graph-minimap';
      
      // Apply styles
      Object.assign(container.style, {
        position: 'absolute',
        width: `${this.options.width}px`,
        height: `${this.options.height}px`,
        backgroundColor: this.options.backgroundColor,
        border: `1px solid ${this.options.borderColor}`,
        borderRadius: '3px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
        zIndex: '50',
        overflow: 'hidden'
      });
      
      // Position the minimap
      this.positionMinimap(container);
      
      // Add toggle button
      const toggleButton = document.createElement('button');
      toggleButton.className = 'minimap-toggle';
      toggleButton.innerHTML = '<i class="fas fa-compress"></i>';
      toggleButton.title = 'Toggle Minimap';
      
      Object.assign(toggleButton.style, {
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '16px',
        height: '16px',
        padding: '0',
        fontSize: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        border: 'none',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '2'
      });
      
      toggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleVisibility();
      });
      
      container.appendChild(toggleButton);
      
      // Add to the graph container
      const graphContainer = document.getElementById(this.graph.containerId);
      if (graphContainer) {
        graphContainer.appendChild(container);
      }
    }
    
    this.container = container;
  }
  
  /**
   * Position the minimap based on the specified position option
   */
  positionMinimap(container) {
    const margin = this.options.margin;
    
    switch (this.options.position) {
      case 'top-left':
        Object.assign(container.style, {
          top: `${margin}px`,
          left: `${margin}px`
        });
        break;
      case 'top-right':
        Object.assign(container.style, {
          top: `${margin}px`,
          right: `${margin}px`
        });
        break;
      case 'bottom-right':
        Object.assign(container.style, {
          bottom: `${margin}px`,
          right: `${margin}px`
        });
        break;
      case 'bottom-left':
      default:
        Object.assign(container.style, {
          bottom: `${margin}px`,
          left: `${margin}px`
        });
        break;
    }
  }
  
  /**
   * Create the canvas for rendering the minimap
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    
    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%'
    });
    
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }
  
  /**
   * Set up event listeners for minimap interactions
   */
  setupEventListeners() {
    // Click on minimap to navigate
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.handleMinimapNavigation(e);
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.handleMinimapNavigation(e);
      }
    });
    
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // Update minimap when graph changes
    if (this.graph && this.graph.cy) {
      this.graph.cy.on('viewport', () => {
        const now = Date.now();
        if (now - this.lastUpdateTime > this.updateInterval) {
          this.render();
          this.lastUpdateTime = now;
        }
      });
      
      this.graph.cy.on('render', () => {
        const now = Date.now();
        if (now - this.lastUpdateTime > this.updateInterval) {
          this.render();
          this.lastUpdateTime = now;
        }
      });
    }
  }
  
  /**
   * Handle navigation when clicking or dragging on the minimap
   */
  handleMinimapNavigation(event) {
    if (!this.graph || !this.graph.cy) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert minimap coordinates to graph coordinates
    const graphBounds = this.graph.cy.extent();
    const graphWidth = graphBounds.x2 - graphBounds.x1;
    const graphHeight = graphBounds.y2 - graphBounds.y1;
    
    const graphX = graphBounds.x1 + (x / this.options.width) * graphWidth;
    const graphY = graphBounds.y1 + (y / this.options.height) * graphHeight;
    
    // Center the graph view on this point
    this.graph.cy.center({
      x: graphX,
      y: graphY
    });
  }
  
  /**
   * Render the minimap
   */
  render() {
    if (!this.ctx || !this.graph || !this.graph.cy || !this.isVisible) return;
    
    const ctx = this.ctx;
    const cy = this.graph.cy;
    const width = this.options.width;
    const height = this.options.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get graph bounds
    const graphBounds = cy.extent();
    const graphWidth = graphBounds.x2 - graphBounds.x1;
    const graphHeight = graphBounds.y2 - graphBounds.y1;
    
    // Scale factor to fit the entire graph in the minimap
    const scaleX = width / graphWidth;
    const scaleY = height / graphHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the graph in the minimap
    const offsetX = (width - graphWidth * scale) / 2;
    const offsetY = (height - graphHeight * scale) / 2;
    
    // Draw nodes
    cy.nodes().forEach(node => {
      const pos = node.position();
      const color = node.data('color');
      const size = Math.max(2, node.data('size') * scale / 10);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        offsetX + (pos.x - graphBounds.x1) * scale,
        offsetY + (pos.y - graphBounds.y1) * scale,
        size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    
    cy.edges().forEach(edge => {
      const sourcePos = edge.source().position();
      const targetPos = edge.target().position();
      
      ctx.beginPath();
      ctx.moveTo(
        offsetX + (sourcePos.x - graphBounds.x1) * scale,
        offsetY + (sourcePos.y - graphBounds.y1) * scale
      );
      ctx.lineTo(
        offsetX + (targetPos.x - graphBounds.x1) * scale,
        offsetY + (targetPos.y - graphBounds.y1) * scale
      );
      ctx.stroke();
    });
    
    // Draw viewport rectangle
    const pan = cy.pan();
    const zoom = cy.zoom();
    
    const viewportWidth = cy.width() / zoom;
    const viewportHeight = cy.height() / zoom;
    
    const viewX = offsetX + (-pan.x / zoom - graphBounds.x1) * scale;
    const viewY = offsetY + (-pan.y / zoom - graphBounds.y1) * scale;
    const viewW = viewportWidth * scale;
    const viewH = viewportHeight * scale;
    
    ctx.strokeStyle = this.options.viewportBorderColor;
    ctx.fillStyle = this.options.viewportColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(viewX, viewY, viewW, viewH);
    ctx.fill();
    ctx.stroke();
  }
  
  /**
   * Toggle minimap visibility
   */
  toggleVisibility() {
    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      this.canvas.style.display = 'block';
      this.render();
    } else {
      this.canvas.style.display = 'none';
    }
    
    // Update toggle button
    const toggleButton = this.container.querySelector('.minimap-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = this.isVisible ? 
        '<i class="fas fa-compress"></i>' : 
        '<i class="fas fa-expand"></i>';
    }
  }
  
  /**
   * Show the minimap
   */
  show() {
    if (!this.isVisible) {
      this.toggleVisibility();
    }
  }
  
  /**
   * Hide the minimap
   */
  hide() {
    if (this.isVisible) {
      this.toggleVisibility();
    }
  }
  
  /**
   * Update minimap options
   */
  updateOptions(options) {
    this.options = Object.assign(this.options, options);
    
    // Update container dimensions
    Object.assign(this.container.style, {
      width: `${this.options.width}px`,
      height: `${this.options.height}px`,
      backgroundColor: this.options.backgroundColor,
      border: `1px solid ${this.options.borderColor}`
    });
    
    // Update canvas dimensions
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    
    // Reposition minimap
    this.positionMinimap(this.container);
    
    // Re-render
    this.render();
  }
}

// Export the class
window.GraphMinimap = GraphMinimap;