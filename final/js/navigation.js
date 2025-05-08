/**
 * Mimetic Magick Knowledge Graph Explorer
 * Navigation and Interaction Module
 * 
 * This file implements navigation and interaction features for the knowledge graph,
 * including search, filtering, history tracking, and focus controls.
 */

class GraphNavigation {
  constructor(graphVisualization) {
    this.graph = graphVisualization;
    this.history = [];
    this.currentHistoryIndex = -1;
    this.maxHistorySize = 20;
    
    // DOM elements
    this.searchInput = document.getElementById('search-input');
    this.searchButton = document.getElementById('search-button');
    this.categoryFilter = document.getElementById('category-filter');
    this.zoomIn = document.getElementById('zoom-in');
    this.zoomOut = document.getElementById('zoom-out');
    this.zoomLevel = document.getElementById('zoom-level');
    this.resetView = document.getElementById('reset-view');
    this.toggleLabels = document.getElementById('toggle-labels');
    
    // Sidebar elements
    this.defaultSidebar = document.getElementById('default-sidebar');
    this.conceptDetail = document.getElementById('concept-detail');
    this.conceptTitle = document.getElementById('concept-title');
    this.conceptCategory = document.getElementById('concept-category');
    this.conceptDescription = document.getElementById('concept-description-text');
    this.relatedConceptsList = document.getElementById('related-concepts-list');
    this.conceptConnectionsCount = document.getElementById('concept-connections-count');
    this.conceptCentrality = document.getElementById('concept-centrality');
    
    // Initialize
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for navigation controls
   */
  setupEventListeners() {
    // Search functionality
    if (this.searchButton && this.searchInput) {
      this.searchButton.addEventListener('click', () => this.handleSearch());
      this.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch();
        }
      });
    }
    
    // Category filter
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', () => {
        const selectedCategory = this.categoryFilter.value;
        this.filterByCategory(selectedCategory);
      });
    }
    
    // Zoom controls
    if (this.zoomIn && this.zoomOut && this.zoomLevel) {
      this.zoomIn.addEventListener('click', () => this.zoomInGraph());
      this.zoomOut.addEventListener('click', () => this.zoomOutGraph());
      this.zoomLevel.addEventListener('input', () => {
        const newZoom = parseFloat(this.zoomLevel.value);
        this.setZoomLevel(newZoom);
      });
    }
    
    // Reset view
    if (this.resetView) {
      this.resetView.addEventListener('click', () => this.resetGraphView());
    }
    
    // Toggle labels
    if (this.toggleLabels) {
      this.toggleLabels.addEventListener('click', () => this.toggleGraphLabels());
    }
    
    // Set up node selection callback
    if (this.graph) {
      this.graph.onNodeSelect = (nodeData) => this.handleNodeSelection(nodeData);
    }
  }
  
  /**
   * Handle search functionality
   */
  handleSearch() {
    if (!this.searchInput) return;
    
    const searchTerm = this.searchInput.value.trim();
    if (searchTerm) {
      const results = this.graph.search(searchTerm);
      
      // Add to history
      this.addToHistory({
        type: 'search',
        term: searchTerm,
        results: results.map(node => node.id)
      });
      
      // Update UI to show search results
      this.updateSearchResultsUI(results);
    }
  }
  
  /**
   * Update UI to show search results
   */
  updateSearchResultsUI(results) {
    // Implementation depends on UI design
    console.log(`Found ${results.length} results for search`);
    
    // If we have a dedicated search results panel, we could populate it here
    // For now, we'll just focus on the first result if available
    if (results.length > 0) {
      this.focusOnNode(results[0].id);
    }
  }
  
  /**
   * Filter graph by category
   */
  filterByCategory(category) {
    if (!this.graph) return;
    
    this.graph.filterByCategory(category);
    
    // Add to history
    this.addToHistory({
      type: 'filter',
      category: category
    });
  }
  
  /**
   * Zoom in on the graph
   */
  zoomInGraph() {
    if (!this.graph || !this.zoomLevel) return;
    
    const currentZoom = parseFloat(this.zoomLevel.value);
    const newZoom = Math.min(currentZoom + 0.1, 2.0);
    this.zoomLevel.value = newZoom;
    this.graph.setZoom(newZoom);
  }
  
  /**
   * Zoom out on the graph
   */
  zoomOutGraph() {
    if (!this.graph || !this.zoomLevel) return;
    
    const currentZoom = parseFloat(this.zoomLevel.value);
    const newZoom = Math.max(currentZoom - 0.1, 0.5);
    this.zoomLevel.value = newZoom;
    this.graph.setZoom(newZoom);
  }
  
  /**
   * Set zoom level directly
   */
  setZoomLevel(level) {
    if (!this.graph) return;
    this.graph.setZoom(level);
  }
  
  /**
   * Reset graph view
   */
  resetGraphView() {
    if (!this.graph) return;
    
    this.graph.resetView();
    
    // Reset zoom slider
    if (this.zoomLevel) {
      this.zoomLevel.value = 1.0;
    }
    
    // Add to history
    this.addToHistory({
      type: 'reset'
    });
  }
  
  /**
   * Toggle graph labels
   */
  toggleGraphLabels() {
    if (!this.graph) return;
    
    this.graph.toggleLabels();
    
    // Update button state
    if (this.toggleLabels) {
      this.toggleLabels.classList.toggle('active');
    }
  }
  
  /**
   * Handle node selection
   */
  handleNodeSelection(nodeData) {
    if (!nodeData) {
      // No node selected, show default sidebar
      this.showDefaultSidebar();
      return;
    }
    
    // Show concept details
    this.showConceptDetails(nodeData);
    
    // Add to history
    this.addToHistory({
      type: 'select',
      nodeId: nodeData.id
    });
  }
  
  /**
   * Show default sidebar
   */
  showDefaultSidebar() {
    if (this.defaultSidebar && this.conceptDetail) {
      this.defaultSidebar.classList.add('active');
      this.conceptDetail.classList.remove('active');
    }
  }
  
  /**
   * Show concept details in sidebar
   */
  showConceptDetails(nodeData) {
    if (!this.conceptDetail) return;
    
    // Update concept details
    if (this.conceptTitle) {
      this.conceptTitle.textContent = nodeData.label;
    }
    
    if (this.conceptCategory) {
      this.conceptCategory.textContent = nodeData.category.charAt(0).toUpperCase() + nodeData.category.slice(1);
      
      // Set category color
      this.conceptCategory.style.backgroundColor = nodeData.color;
    }
    
    if (this.conceptDescription) {
      this.conceptDescription.textContent = nodeData.description;
    }
    
    // Update related concepts
    this.updateRelatedConcepts(nodeData.id);
    
    // Update stats
    if (this.conceptConnectionsCount) {
      this.conceptConnectionsCount.textContent = nodeData.connections || 0;
    }
    
    if (this.conceptCentrality) {
      // Calculate or use pre-calculated centrality
      const centrality = nodeData.centrality || Math.round((nodeData.connections || 0) / 10);
      this.conceptCentrality.textContent = centrality;
    }
    
    // Show concept detail panel
    if (this.defaultSidebar && this.conceptDetail) {
      this.defaultSidebar.classList.remove('active');
      this.conceptDetail.classList.add('active');
    }
  }
  
  /**
   * Update related concepts list
   */
  updateRelatedConcepts(nodeId) {
    if (!this.relatedConceptsList || !this.graph) return;
    
    // Clear existing list
    this.relatedConceptsList.innerHTML = '';
    
    // Get related nodes
    const relatedNodes = this.graph.getRelatedNodes(nodeId);
    
    if (relatedNodes.length === 0) {
      const noRelations = document.createElement('li');
      noRelations.textContent = 'No related concepts found';
      noRelations.classList.add('no-relations');
      this.relatedConceptsList.appendChild(noRelations);
      return;
    }
    
    // Add each related node to the list
    relatedNodes.forEach(node => {
      const listItem = document.createElement('li');
      listItem.textContent = node.label;
      listItem.dataset.nodeId = node.id;
      
      // Add click handler to focus on this node
      listItem.addEventListener('click', () => {
        this.focusOnNode(node.id);
      });
      
      this.relatedConceptsList.appendChild(listItem);
    });
  }
  
  /**
   * Focus on a specific node
   */
  focusOnNode(nodeId) {
    if (!this.graph) return;
    
    const success = this.graph.focusNode(nodeId);
    
    if (success) {
      // Add to history
      this.addToHistory({
        type: 'focus',
        nodeId: nodeId
      });
    }
    
    return success;
  }
  
  /**
   * Add an action to navigation history
   */
  addToHistory(action) {
    // If we're not at the end of history, truncate
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    }
    
    // Add timestamp to action
    action.timestamp = new Date().getTime();
    
    // Add to history
    this.history.push(action);
    this.currentHistoryIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentHistoryIndex--;
    }
  }
  
  /**
   * Navigate back in history
   */
  navigateBack() {
    if (this.currentHistoryIndex <= 0) return false;
    
    this.currentHistoryIndex--;
    this.applyHistoryAction(this.history[this.currentHistoryIndex]);
    return true;
  }
  
  /**
   * Navigate forward in history
   */
  navigateForward() {
    if (this.currentHistoryIndex >= this.history.length - 1) return false;
    
    this.currentHistoryIndex++;
    this.applyHistoryAction(this.history[this.currentHistoryIndex]);
    return true;
  }
  
  /**
   * Apply a history action
   */
  applyHistoryAction(action) {
    if (!action) return;
    
    switch (action.type) {
      case 'select':
      case 'focus':
        this.focusOnNode(action.nodeId);
        break;
        
      case 'filter':
        if (this.categoryFilter) {
          this.categoryFilter.value = action.category;
        }
        this.filterByCategory(action.category);
        break;
        
      case 'search':
        if (this.searchInput) {
          this.searchInput.value = action.term;
        }
        this.handleSearch();
        break;
        
      case 'reset':
        this.resetGraphView();
        break;
    }
  }
  
  /**
   * Get current navigation state
   */
  getNavigationState() {
    return {
      currentHistoryIndex: this.currentHistoryIndex,
      historyLength: this.history.length,
      canGoBack: this.currentHistoryIndex > 0,
      canGoForward: this.currentHistoryIndex < this.history.length - 1
    };
  }
}

// Export the class
window.GraphNavigation = GraphNavigation;