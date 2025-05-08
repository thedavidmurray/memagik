/**
 * Mimetic Magick Knowledge Graph Explorer
 * Graph Visualization Module
 * 
 * This file implements the core visualization functionality using Cytoscape.js
 * to create an interactive, game-inspired knowledge graph visualization.
 */

class GraphVisualization {
  constructor(containerId) {
    this.containerId = containerId;
    this.cy = null;
    this.data = null;
    this.schema = null;
    this.selectedNode = null;
    this.filters = {
      category: 'all',
      searchTerm: ''
    };
    this.options = {
      showLabels: true,
      zoomLevel: 1.0
    };
    
    // Event callbacks
    this.onNodeSelect = null;
    this.onNodeHover = null;
  }
  
  /**
   * Initialize the graph visualization
   */
  async initialize() {
    try {
      // Load data and schema
      await this.loadData();
      
      // Initialize Cytoscape instance
      this.initializeCytoscape();
      
      // Apply initial layout
      this.applyLayout();
      
      // Set up event listeners
      this.setupEventListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing graph visualization:', error);
      return false;
    }
  }
  
  /**
   * Load knowledge graph data and visualization schema
   */
  async loadData() {
    try {
      // Load knowledge graph data
      const dataResponse = await fetch('./data/knowledge_graph.json');
      if (!dataResponse.ok) {
        throw new Error('Failed to load knowledge graph data');
      }
      this.data = await dataResponse.json();
      
      // Load visualization schema
      const schemaResponse = await fetch('./data/visualization_schema.json');
      if (!schemaResponse.ok) {
        throw new Error('Failed to load visualization schema');
      }
      this.schema = await schemaResponse.json();
      
      console.log(`Loaded ${this.data.nodes.length} nodes and ${this.data.links ? this.data.links.length : 0} links`);
      
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
  
  /**
   * Initialize Cytoscape instance with configuration
   */
  initializeCytoscape() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container element with ID "${this.containerId}" not found`);
    }
    
    // Transform data to Cytoscape format
    const elements = this.transformDataToCytoscapeFormat();
    
    // Create Cytoscape instance
    this.cy = cytoscape({
      container: container,
      elements: elements,
      style: this.createCytoscapeStyle(),
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      wheelSensitivity: 0.3,
      minZoom: 0.2,
      maxZoom: 3.0
    });
    
    // Initial viewport positioning
    this.cy.zoom(1.0);
    this.cy.center();
  }
  
  /**
   * Transform knowledge graph data to Cytoscape format
   */
  transformDataToCytoscapeFormat() {
    const elements = [];
    
    // Add nodes
    if (this.data.nodes) {
      this.data.nodes.forEach(node => {
        elements.push({
          data: {
            id: node.id,
            label: node.label,
            category: node.category,
            description: node.description,
            size: node.visualAttributes?.size || 1.0,
            color: node.visualAttributes?.color || this.getCategoryColor(node.category),
            connections: node.visualAttributes?.connections || 0
          },
          position: {
            x: node.visualAttributes?.x || Math.random() * 1000,
            y: node.visualAttributes?.y || Math.random() * 1000
          }
        });
      });
    }
    
    // Add edges
    if (this.data.links) {
      this.data.links.forEach((link, index) => {
        elements.push({
          data: {
            id: `edge-${index}`,
            source: link.source,
            target: link.target,
            weight: link.weight || 1,
            label: link.label || '',
            color: link.color || '#999999',
            strength: link.strength || 1
          }
        });
      });
    }
    
    return elements;
  }
  
  /**
   * Create Cytoscape style based on visualization schema
   */
  createCytoscapeStyle() {
    return [
      // Node styling
      {
        selector: 'node',
        style: {
          'shape': 'hexagon',
          'width': 'data(size)',
          'height': 'data(size)',
          'background-color': 'data(color)',
          'border-width': 2,
          'border-color': '#ffffff',
          'border-opacity': 0.5,
          'label': this.options.showLabels ? 'data(label)' : '',
          'color': '#ffffff',
          'text-outline-width': 2,
          'text-outline-color': '#000000',
          'text-outline-opacity': 0.5,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '12px',
          'text-wrap': 'wrap',
          'text-max-width': '80px'
        }
      },
      // Edge styling
      {
        selector: 'edge',
        style: {
          'width': 'data(weight)',
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.7,
          'label': this.options.showLabels ? 'data(label)' : '',
          'font-size': '10px',
          'text-rotation': 'autorotate',
          'color': '#ffffff',
          'text-outline-width': 2,
          'text-outline-color': '#000000',
          'text-outline-opacity': 0.5
        }
      },
      // Highlighted node
      {
        selector: 'node.highlighted',
        style: {
          'border-width': 4,
          'border-color': '#f1c40f',
          'border-opacity': 1,
          'background-color': 'data(color)',
          'text-outline-color': '#f1c40f',
          'shadow-blur': 10,
          'shadow-color': '#f1c40f',
          'shadow-opacity': 0.8,
          'shadow-offset-x': 0,
          'shadow-offset-y': 0
        }
      },
      // Highlighted edge
      {
        selector: 'edge.highlighted',
        style: {
          'width': 'data(weight)',
          'line-color': '#f1c40f',
          'target-arrow-color': '#f1c40f',
          'opacity': 1,
          'z-index': 999
        }
      },
      // Faded elements (when a node is selected)
      {
        selector: '.faded',
        style: {
          'opacity': 0.25
        }
      },
      // Hover state
      {
        selector: 'node.hover',
        style: {
          'border-color': '#e67e22',
          'border-width': 3,
          'border-opacity': 1
        }
      }
    ];
  }
  
  /**
   * Get color for a category based on schema or default
   */
  getCategoryColor(category) {
    if (this.schema && this.schema.nodeRepresentation && this.schema.nodeRepresentation.categories) {
      const categoryConfig = this.schema.nodeRepresentation.categories[category];
      if (categoryConfig && categoryConfig.color) {
        return categoryConfig.color;
      }
    }
    
    // Default colors if schema doesn't define them
    const defaultColors = {
      'memetic': '#3498db',
      'social': '#e74c3c',
      'magical': '#9b59b6',
      'consciousness': '#2ecc71',
      'general': '#f39c12'
    };
    
    return defaultColors[category] || '#95a5a6';
  }
  
  /**
   * Apply layout to the graph
   */
  applyLayout(layoutName = 'cose') {
    const layoutOptions = {
      name: layoutName,
      animate: true,
      animationDuration: 1000,
      fit: true,
      padding: 30
    };
    
    // Add specific options based on layout type
    if (layoutName === 'cose') {
      Object.assign(layoutOptions, {
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      });
    } else if (layoutName === 'concentric') {
      Object.assign(layoutOptions, {
        minNodeSpacing: 50,
        concentric: node => node.data('connections'),
        levelWidth: () => 1
      });
    }
    
    const layout = this.cy.layout(layoutOptions);
    layout.run();
  }
  
  /**
   * Set up event listeners for graph interactions
   */
  setupEventListeners() {
    // Node selection
    this.cy.on('tap', 'node', event => {
      const node = event.target;
      this.selectNode(node);
    });
    
    // Background click to deselect
    this.cy.on('tap', event => {
      if (event.target === this.cy) {
        this.deselectAll();
      }
    });
    
    // Hover effects
    this.cy.on('mouseover', 'node', event => {
      const node = event.target;
      node.addClass('hover');
      
      if (this.onNodeHover) {
        this.onNodeHover(node.data(), true);
      }
    });
    
    this.cy.on('mouseout', 'node', event => {
      const node = event.target;
      node.removeClass('hover');
      
      if (this.onNodeHover) {
        this.onNodeHover(node.data(), false);
      }
    });
  }
  
  /**
   * Select a node and highlight its connections
   */
  selectNode(node) {
    // Deselect previous selection
    this.deselectAll();
    
    // Mark the node as selected
    this.selectedNode = node;
    node.addClass('highlighted');
    
    // Highlight connected edges and nodes
    const connectedEdges = node.connectedEdges();
    connectedEdges.addClass('highlighted');
    
    const connectedNodes = connectedEdges.connectedNodes().difference(node);
    
    // Fade all other elements
    this.cy.elements().difference(node.union(connectedEdges).union(connectedNodes)).addClass('faded');
    
    // Trigger callback if defined
    if (this.onNodeSelect) {
      this.onNodeSelect(node.data());
    }
  }
  
  /**
   * Deselect all nodes and reset highlighting
   */
  deselectAll() {
    this.cy.elements().removeClass('highlighted faded');
    this.selectedNode = null;
    
    // Trigger callback with null to indicate deselection
    if (this.onNodeSelect) {
      this.onNodeSelect(null);
    }
  }
  
  /**
   * Focus on a specific node by ID
   */
  focusNode(nodeId) {
    const node = this.cy.getElementById(nodeId);
    if (node.length > 0) {
      this.selectNode(node);
      this.cy.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 500
      });
      return true;
    }
    return false;
  }
  
  /**
   * Search for nodes by term
   */
  search(term) {
    if (!term) {
      this.deselectAll();
      return [];
    }
    
    const searchTerm = term.toLowerCase();
    const matchingNodes = this.cy.nodes().filter(node => {
      const data = node.data();
      return data.label.toLowerCase().includes(searchTerm) || 
             data.description.toLowerCase().includes(searchTerm);
    });
    
    if (matchingNodes.length > 0) {
      // Highlight all matching nodes
      this.deselectAll();
      matchingNodes.addClass('highlighted');
      
      // Center the view on the matching nodes
      this.cy.animate({
        fit: { eles: matchingNodes, padding: 50 },
        duration: 500
      });
    }
    
    return matchingNodes.map(node => node.data());
  }
  
  /**
   * Filter nodes by category
   */
  filterByCategory(category) {
    this.filters.category = category;
    this.applyFilters();
  }
  
  /**
   * Apply all current filters
   */
  applyFilters() {
    // Reset visibility
    this.cy.elements().removeClass('filtered');
    
    // Apply category filter
    if (this.filters.category !== 'all') {
      const nodesToHide = this.cy.nodes().filter(node => node.data('category') !== this.filters.category);
      nodesToHide.addClass('filtered');
      nodesToHide.connectedEdges().addClass('filtered');
    }
    
    // Apply search filter if needed
    if (this.filters.searchTerm) {
      // Implementation similar to search method
    }
    
    // Update style to hide filtered elements
    this.cy.style().selector('.filtered').style({
      'display': 'none'
    }).update();
  }
  
  /**
   * Set zoom level
   */
  setZoom(level) {
    this.options.zoomLevel = level;
    this.cy.zoom(level);
  }
  
  /**
   * Toggle node labels
   */
  toggleLabels() {
    this.options.showLabels = !this.options.showLabels;
    
    if (this.options.showLabels) {
      this.cy.style().selector('node').style({
        'label': 'data(label)'
      }).update();
      
      this.cy.style().selector('edge').style({
        'label': 'data(label)'
      }).update();
    } else {
      this.cy.style().selector('node').style({
        'label': ''
      }).update();
      
      this.cy.style().selector('edge').style({
        'label': ''
      }).update();
    }
  }
  
  /**
   * Reset the view to show all nodes
   */
  resetView() {
    this.deselectAll();
    this.cy.animate({
      fit: { padding: 50 },
      duration: 500
    });
  }
  
  /**
   * Get statistics about the graph
   */
  getGraphStatistics() {
    return {
      nodeCount: this.cy.nodes().length,
      edgeCount: this.cy.edges().length,
      categories: this.getCategories()
    };
  }
  
  /**
   * Get unique categories and their counts
   */
  getCategories() {
    const categories = {};
    this.cy.nodes().forEach(node => {
      const category = node.data('category');
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });
    return categories;
  }
  
  /**
   * Get related nodes for a given node
   */
  getRelatedNodes(nodeId) {
    const node = this.cy.getElementById(nodeId);
    if (node.length === 0) return [];
    
    const connectedNodes = node.neighborhood().nodes();
    return connectedNodes.map(n => n.data());
  }
  
  /**
   * Export the current graph view as an image
   */
  exportImage(format = 'png') {
    return this.cy.png({ full: true, scale: 2, output: 'blob' });
  }
}

// Export the class
window.GraphVisualization = GraphVisualization;