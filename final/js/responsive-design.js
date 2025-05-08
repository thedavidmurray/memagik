/**
 * Mimetic Magick Knowledge Graph Explorer
 * Responsive Design Module
 * 
 * This file implements responsive design functionality to ensure the application
 * works well across different screen sizes and devices.
 */

class ResponsiveDesign {
  constructor(options = {}) {
    this.options = Object.assign({
      breakpoints: {
        small: 768,
        medium: 1024,
        large: 1440
      },
      adaptations: {
        small: {
          sidebar: 'collapsed',
          nodeSize: 'reduced',
          labels: 'hidden',
          controls: 'compact'
        },
        medium: {
          sidebar: 'collapsible',
          nodeSize: 'standard',
          labels: 'reduced',
          controls: 'standard'
        },
        large: {
          sidebar: 'expanded',
          nodeSize: 'standard',
          labels: 'visible',
          controls: 'expanded'
        }
      },
      debounceTime: 250
    }, options);
    
    this.currentBreakpoint = null;
    this.graphVisualization = null;
    this.resizeTimer = null;
    
    this.initialize();
  }
  
  /**
   * Initialize responsive design
   */
  initialize() {
    // Set up event listeners
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Initial check
    this.checkBreakpoint();
    
    // Add touch detection
    this.detectTouchDevice();
  }
  
  /**
   * Set the graph visualization instance
   */
  setGraphVisualization(graphVisualization) {
    this.graphVisualization = graphVisualization;
    this.applyGraphAdaptations();
  }
  
  /**
   * Handle window resize event with debounce
   */
  handleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.checkBreakpoint();
    }, this.options.debounceTime);
  }
  
  /**
   * Check current breakpoint and apply adaptations
   */
  checkBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint;
    
    if (width <= this.options.breakpoints.small) {
      newBreakpoint = 'small';
    } else if (width <= this.options.breakpoints.medium) {
      newBreakpoint = 'medium';
    } else if (width <= this.options.breakpoints.large) {
      newBreakpoint = 'large';
    } else {
      newBreakpoint = 'xlarge';
    }
    
    // Only apply changes if breakpoint changed
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      this.applyAdaptations();
    }
  }
  
  /**
   * Apply adaptations based on current breakpoint
   */
  applyAdaptations() {
    // Get adaptations for current breakpoint
    let adaptations;
    
    if (this.currentBreakpoint === 'small') {
      adaptations = this.options.adaptations.small;
    } else if (this.currentBreakpoint === 'medium') {
      adaptations = this.options.adaptations.medium;
    } else {
      adaptations = this.options.adaptations.large;
    }
    
    // Apply sidebar adaptations
    this.applySidebarAdaptations(adaptations.sidebar);
    
    // Apply control adaptations
    this.applyControlAdaptations(adaptations.controls);
    
    // Apply graph adaptations
    this.applyGraphAdaptations(adaptations);
    
    // Log the change
    console.log(`Applied responsive adaptations for ${this.currentBreakpoint} screens`);
  }
  
  /**
   * Apply sidebar adaptations
   */
  applySidebarAdaptations(sidebarMode) {
    const sidebar = document.querySelector('.game-sidebar');
    if (!sidebar) return;
    
    // Remove all state classes
    sidebar.classList.remove('collapsed', 'collapsible', 'expanded');
    
    // Apply new state
    switch (sidebarMode) {
      case 'collapsed':
        sidebar.classList.add('collapsed');
        break;
      case 'collapsible':
        sidebar.classList.add('collapsible');
        break;
      case 'expanded':
        sidebar.classList.add('expanded');
        break;
    }
    
    // For small screens, move sidebar to bottom on mobile
    if (this.currentBreakpoint === 'small') {
      document.querySelector('.game-main').classList.add('mobile-layout');
    } else {
      document.querySelector('.game-main').classList.remove('mobile-layout');
    }
  }
  
  /**
   * Apply control adaptations
   */
  applyControlAdaptations(controlsMode) {
    const controls = document.querySelector('.game-controls');
    if (!controls) return;
    
    // Remove all state classes
    controls.classList.remove('compact', 'standard', 'expanded');
    
    // Apply new state
    controls.classList.add(controlsMode);
    
    // For small screens, stack controls vertically
    if (this.currentBreakpoint === 'small') {
      controls.classList.add('stacked');
      
      // Move search to top
      const searchContainer = controls.querySelector('.search-container');
      if (searchContainer) {
        controls.insertBefore(searchContainer, controls.firstChild);
      }
    } else {
      controls.classList.remove('stacked');
    }
  }
  
  /**
   * Apply graph adaptations
   */
  applyGraphAdaptations(adaptations) {
    if (!this.graphVisualization || !this.graphVisualization.cy) return;
    
    const cy = this.graphVisualization.cy;
    
    // Apply node size adaptations
    if (adaptations.nodeSize === 'reduced') {
      cy.nodes().forEach(node => {
        const originalSize = node.data('size');
        node.style('width', originalSize * 0.7);
        node.style('height', originalSize * 0.7);
      });
    } else {
      cy.nodes().forEach(node => {
        const originalSize = node.data('size');
        node.style('width', originalSize);
        node.style('height', originalSize);
      });
    }
    
    // Apply label adaptations
    if (adaptations.labels === 'hidden') {
      cy.style()
        .selector('node')
        .style({
          'label': ''
        })
        .update();
    } else if (adaptations.labels === 'reduced') {
      cy.style()
        .selector('node')
        .style({
          'label': 'data(label)',
          'font-size': '10px',
          'text-opacity': 0.8
        })
        .update();
    } else {
      cy.style()
        .selector('node')
        .style({
          'label': 'data(label)',
          'font-size': '12px',
          'text-opacity': 1
        })
        .update();
    }
    
    // Adjust edge thickness for small screens
    if (this.currentBreakpoint === 'small') {
      cy.style()
        .selector('edge')
        .style({
          'width': 1
        })
        .update();
    } else {
      cy.style()
        .selector('edge')
        .style({
          'width': 'data(weight)'
        })
        .update();
    }
    
    // Fit the graph to the container
    cy.resize();
    cy.fit();
  }
  
  /**
   * Detect if the device supports touch
   */
  detectTouchDevice() {
    const isTouchDevice = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 ||
                          navigator.msMaxTouchPoints > 0;
    
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
      this.setupTouchInteractions();
    } else {
      document.body.classList.add('no-touch');
    }
  }
  
  /**
   * Set up touch-specific interactions
   */
  setupTouchInteractions() {
    // Add touch-specific CSS
    const touchStyles = document.createElement('style');
    touchStyles.textContent = `
      .touch-device .game-controls button,
      .touch-device .sidebar-content button {
        min-height: 44px;
        min-width: 44px;
      }
      
      .touch-device .zoom-controls input[type="range"]::-webkit-slider-thumb {
        width: 24px;
        height: 24px;
      }
      
      .touch-device #related-concepts-list li {
        padding: 12px 15px;
      }
      
      .touch-device .search-container input {
        height: 44px;
        font-size: 16px; /* Prevents iOS zoom on focus */
      }
      
      .touch-device .search-container button {
        height: 44px;
        width: 44px;
      }
      
      /* Increase spacing for touch targets */
      .touch-device .main-nav a {
        padding: 10px 15px;
      }
      
      /* Add momentum scrolling */
      .touch-device .sidebar-content,
      .touch-device .history-content {
        -webkit-overflow-scrolling: touch;
      }
    `;
    
    document.head.appendChild(touchStyles);
    
    // Add touch-specific event handlers if needed
    if (this.graphVisualization && this.graphVisualization.cy) {
      // Adjust Cytoscape touch handling
      this.graphVisualization.cy.userZoomingEnabled(true);
      this.graphVisualization.cy.userPanningEnabled(true);
      this.graphVisualization.cy.boxSelectionEnabled(false);
    }
  }
  
  /**
   * Get current device type
   */
  getDeviceType() {
    return {
      breakpoint: this.currentBreakpoint,
      isTouch: document.body.classList.contains('touch-device'),
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };
  }
  
  /**
   * Update responsive options
   */
  updateOptions(options) {
    this.options = Object.assign(this.options, options);
    this.checkBreakpoint();
  }
}

// Export the class
window.ResponsiveDesign = ResponsiveDesign;