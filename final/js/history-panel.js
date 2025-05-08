/**
 * Mimetic Magick Knowledge Graph Explorer
 * History Panel Module
 * 
 * This file implements a history panel that tracks the user's navigation
 * through the knowledge graph, allowing them to revisit previous nodes.
 */

class HistoryPanel {
  constructor(graphNavigation, options = {}) {
    this.navigation = graphNavigation;
    this.options = Object.assign({
      container: 'history-panel',
      maxVisibleItems: 10,
      showTimestamps: true,
      showIcons: true,
      animationDuration: 300
    }, options);
    
    this.historyItems = [];
    this.container = null;
    this.isVisible = false;
    
    this.initialize();
  }
  
  /**
   * Initialize the history panel
   */
  initialize() {
    this.createHistoryPanel();
    this.setupEventListeners();
  }
  
  /**
   * Create the history panel container
   */
  createHistoryPanel() {
    // Check if container already exists
    let container = document.getElementById(this.options.container);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.container;
      container.className = 'history-panel';
      
      // Apply styles
      Object.assign(container.style, {
        position: 'absolute',
        top: '70px',
        right: '20px',
        width: '250px',
        maxHeight: '400px',
        backgroundColor: 'rgba(26, 42, 58, 0.95)',
        border: '1px solid #4a6b8a',
        borderRadius: '5px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        zIndex: '80',
        overflow: 'hidden',
        display: 'none',
        flexDirection: 'column'
      });
      
      // Create header
      const header = document.createElement('div');
      header.className = 'history-header';
      
      Object.assign(header.style, {
        padding: '10px 15px',
        borderBottom: '1px solid #4a6b8a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(42, 62, 82, 0.9)'
      });
      
      header.innerHTML = `
        <h3 style="margin: 0; font-size: 1rem; color: #e0e7ff;">Navigation History</h3>
        <button class="history-close" style="background: none; border: none; color: #e0e7ff; cursor: pointer; font-size: 1rem;">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Create content area
      const content = document.createElement('div');
      content.className = 'history-content';
      
      Object.assign(content.style, {
        overflowY: 'auto',
        maxHeight: '350px',
        padding: '10px 0'
      });
      
      // Create history list
      const historyList = document.createElement('ul');
      historyList.className = 'history-list';
      
      Object.assign(historyList.style, {
        listStyle: 'none',
        margin: '0',
        padding: '0'
      });
      
      content.appendChild(historyList);
      
      // Create navigation controls
      const controls = document.createElement('div');
      controls.className = 'history-controls';
      
      Object.assign(controls.style, {
        padding: '10px 15px',
        borderTop: '1px solid #4a6b8a',
        display: 'flex',
        justifyContent: 'space-between'
      });
      
      controls.innerHTML = `
        <button class="history-back" style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; color: #e0e7ff; padding: 5px 10px; border-radius: 3px; cursor: pointer;" disabled>
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <button class="history-forward" style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; color: #e0e7ff; padding: 5px 10px; border-radius: 3px; cursor: pointer;" disabled>
          Forward <i class="fas fa-arrow-right"></i>
        </button>
      `;
      
      // Assemble the panel
      container.appendChild(header);
      container.appendChild(content);
      container.appendChild(controls);
      
      // Add to the document
      document.body.appendChild(container);
      
      // Add toggle button to the controls bar
      const controlsBar = document.querySelector('.game-controls');
      if (controlsBar) {
        const historyButton = document.createElement('button');
        historyButton.id = 'history-toggle';
        historyButton.innerHTML = '<i class="fas fa-history"></i>';
        historyButton.title = 'Navigation History';
        
        historyButton.addEventListener('click', () => {
          this.toggleVisibility();
        });
        
        const viewControls = controlsBar.querySelector('.view-controls');
        if (viewControls) {
          viewControls.insertBefore(historyButton, viewControls.firstChild);
        } else {
          controlsBar.appendChild(historyButton);
        }
      }
    }
    
    this.container = container;
    this.historyList = container.querySelector('.history-list');
    this.backButton = container.querySelector('.history-back');
    this.forwardButton = container.querySelector('.history-forward');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close button
    const closeButton = this.container.querySelector('.history-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide();
      });
    }
    
    // Back button
    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
        if (this.navigation) {
          this.navigation.navigateBack();
          this.updateButtonStates();
        }
      });
    }
    
    // Forward button
    if (this.forwardButton) {
      this.forwardButton.addEventListener('click', () => {
        if (this.navigation) {
          this.navigation.navigateForward();
          this.updateButtonStates();
        }
      });
    }
    
    // Listen for history changes
    if (this.navigation) {
      // Override the addToHistory method to capture history changes
      const originalAddToHistory = this.navigation.addToHistory;
      this.navigation.addToHistory = (action) => {
        originalAddToHistory.call(this.navigation, action);
        this.updateHistory();
      };
      
      // Initial update
      this.updateHistory();
    }
    
    // Click outside to close
    document.addEventListener('click', (event) => {
      if (this.isVisible && 
          !this.container.contains(event.target) && 
          event.target.id !== 'history-toggle') {
        this.hide();
      }
    });
  }
  
  /**
   * Update the history list
   */
  updateHistory() {
    if (!this.historyList || !this.navigation) return;
    
    // Clear the list
    this.historyList.innerHTML = '';
    
    // Get history items
    const history = this.navigation.history;
    const currentIndex = this.navigation.currentHistoryIndex;
    
    if (history.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'history-empty';
      emptyItem.textContent = 'No navigation history yet';
      
      Object.assign(emptyItem.style, {
        padding: '10px 15px',
        color: '#e0e7ff',
        opacity: '0.7',
        textAlign: 'center',
        fontStyle: 'italic'
      });
      
      this.historyList.appendChild(emptyItem);
      return;
    }
    
    // Add history items
    history.forEach((item, index) => {
      const historyItem = document.createElement('li');
      historyItem.className = 'history-item';
      if (index === currentIndex) {
        historyItem.classList.add('current');
      }
      
      Object.assign(historyItem.style, {
        padding: '8px 15px',
        borderLeft: index === currentIndex ? '3px solid #f1c40f' : '3px solid transparent',
        backgroundColor: index === currentIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s'
      });
      
      // Create item content based on action type
      let icon = '';
      let label = '';
      
      switch (item.type) {
        case 'select':
        case 'focus':
          icon = '<i class="fas fa-crosshairs"></i>';
          label = `Selected "${this.getNodeLabel(item.nodeId)}"`;
          break;
          
        case 'search':
          icon = '<i class="fas fa-search"></i>';
          label = `Searched for "${item.term}"`;
          break;
          
        case 'filter':
          icon = '<i class="fas fa-filter"></i>';
          label = `Filtered by ${item.category}`;
          break;
          
        case 'reset':
          icon = '<i class="fas fa-undo"></i>';
          label = 'Reset view';
          break;
          
        default:
          icon = '<i class="fas fa-arrow-right"></i>';
          label = 'Navigation action';
      }
      
      // Create timestamp
      let timestamp = '';
      if (this.options.showTimestamps && item.timestamp) {
        const date = new Date(item.timestamp);
        timestamp = `<span class="history-time" style="font-size: 0.8rem; opacity: 0.7;">${date.toLocaleTimeString()}</span>`;
      }
      
      historyItem.innerHTML = `
        <div class="history-item-content" style="display: flex; align-items: center;">
          ${this.options.showIcons ? `<span class="history-icon" style="margin-right: 10px;">${icon}</span>` : ''}
          <span class="history-label">${label}</span>
        </div>
        ${timestamp}
      `;
      
      // Add click handler
      historyItem.addEventListener('click', () => {
        if (index !== currentIndex) {
          // Navigate to this history item
          if (index < currentIndex) {
            // Need to go back
            for (let i = 0; i < currentIndex - index; i++) {
              this.navigation.navigateBack();
            }
          } else {
            // Need to go forward
            for (let i = 0; i < index - currentIndex; i++) {
              this.navigation.navigateForward();
            }
          }
          
          this.updateButtonStates();
          this.updateHistory();
        }
      });
      
      // Add hover effect
      historyItem.addEventListener('mouseenter', () => {
        if (index !== currentIndex) {
          historyItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      historyItem.addEventListener('mouseleave', () => {
        if (index !== currentIndex) {
          historyItem.style.backgroundColor = 'transparent';
        }
      });
      
      this.historyList.appendChild(historyItem);
    });
    
    // Update button states
    this.updateButtonStates();
  }
  
  /**
   * Get node label by ID
   */
  getNodeLabel(nodeId) {
    if (!this.navigation || !this.navigation.graph || !this.navigation.graph.cy) {
      return nodeId;
    }
    
    const node = this.navigation.graph.cy.getElementById(nodeId);
    if (node.length > 0) {
      return node.data('label');
    }
    
    return nodeId;
  }
  
  /**
   * Update back/forward button states
   */
  updateButtonStates() {
    if (!this.navigation || !this.backButton || !this.forwardButton) return;
    
    const navState = this.navigation.getNavigationState();
    
    this.backButton.disabled = !navState.canGoBack;
    this.forwardButton.disabled = !navState.canGoForward;
    
    // Update styles
    this.backButton.style.opacity = navState.canGoBack ? '1' : '0.5';
    this.forwardButton.style.opacity = navState.canGoForward ? '1' : '0.5';
  }
  
  /**
   * Show the history panel
   */
  show() {
    if (this.isVisible) return;
    
    this.container.style.display = 'flex';
    setTimeout(() => {
      this.container.style.opacity = '1';
    }, 10);
    
    this.isVisible = true;
    this.updateHistory();
  }
  
  /**
   * Hide the history panel
   */
  hide() {
    if (!this.isVisible) return;
    
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
    }, this.options.animationDuration);
    
    this.isVisible = false;
  }
  
  /**
   * Toggle the visibility of the history panel
   */
  toggleVisibility() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Clear the history
   */
  clearHistory() {
    if (this.navigation) {
      this.navigation.history = [];
      this.navigation.currentHistoryIndex = -1;
      this.updateHistory();
    }
  }
}

// Export the class
window.HistoryPanel = HistoryPanel;