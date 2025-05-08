/**
 * Mimetic Magick Knowledge Graph Explorer
 * Main Application Module
 * 
 * This file serves as the entry point for the application and coordinates
 * between the UI controls and graph visualization components.
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Mimetic Magick Knowledge Graph Explorer initializing...');
  
  // Application state
  const appState = {
    dataLoaded: false,
    currentView: 'graph',
    selectedNode: null,
    zoomLevel: 1.0,
    showLabels: true,
    categoryFilter: 'all',
    layoutType: 'cose'
  };
  
  // DOM elements
  const graphContainer = document.getElementById('graph-container');
  const loadingOverlay = document.querySelector('.loading-overlay');
  const viewGraphBtn = document.getElementById('view-graph');
  const viewListBtn = document.getElementById('view-list');
  const viewAboutBtn = document.getElementById('view-about');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');
  const toggleControlsBtn = document.getElementById('toggle-controls');
  
  // Component instances
  let graphVisualization = null;
  let graphNavigation = null;
  let graphMinimap = null;
  let historyPanel = null;
  let exportTools = null;
  let guidedTour = null;
  let helpSection = null;
  let responsiveDesign = null;
  
  /**
   * Initialize the application
   */
  async function initializeApp() {
    try {
      // Show loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
      }
      
      // Create graph visualization instance
      graphVisualization = new GraphVisualization('graph-container');
      
      // Initialize the graph
      const success = await graphVisualization.initialize();
      
      if (success) {
        console.log('Graph visualization initialized successfully');
        appState.dataLoaded = true;
        
        // Initialize navigation
        graphNavigation = new GraphNavigation(graphVisualization);
        
        // Initialize additional components
        initializeComponents();
        
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.display = 'none';
        }
        
        // Set up additional event listeners
        setupEventListeners();
        
        // Apply initial state
        applyInitialState();
      } else {
        throw new Error('Failed to initialize graph visualization');
      }
    } catch (error) {
      console.error('Error initializing application:', error);
      
      // Show error message
      if (graphContainer) {
        graphContainer.innerHTML = `
          <div class="error-message">
            <h3>Error Initializing Knowledge Graph</h3>
            <p>${error.message}</p>
          </div>
        `;
      }
      
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    }
  }
  
  /**
   * Initialize additional components
   */
  function initializeComponents() {
    // Initialize minimap
    graphMinimap = new GraphMinimap(graphVisualization, {
      position: 'bottom-left',
      width: 150,
      height: 150
    });
    
    // Initialize history panel
    historyPanel = new HistoryPanel(graphNavigation);
    
    // Initialize export tools
    exportTools = new ExportTools(graphVisualization);
    
    // Initialize help section
    helpSection = new HelpSection();
    
    // Initialize responsive design
    responsiveDesign = new ResponsiveDesign();
    responsiveDesign.setGraphVisualization(graphVisualization);
    
    // Initialize guided tour (after a short delay to ensure all components are ready)
    setTimeout(() => {
      guidedTour = new GuidedTour();
    }, 1000);
  }
  
  /**
   * Set up event listeners for application-wide events
   */
  function setupEventListeners() {
    // Window resize handler
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    // View switching
    if (viewGraphBtn) {
      viewGraphBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('graph');
      });
    }
    
    if (viewListBtn) {
      viewListBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('list');
      });
    }
    
    if (viewAboutBtn) {
      viewAboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('about');
      });
    }
    
    // Fullscreen toggle
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', toggleFullscreen);
    }
    
    // Controls toggle
    if (toggleControlsBtn) {
      toggleControlsBtn.addEventListener('click', toggleControls);
    }
    
    // Layout selector
    const layoutSelector = document.createElement('select');
    layoutSelector.id = 'layout-selector';
    layoutSelector.className = 'layout-selector';
    layoutSelector.innerHTML = `
      <option value="cose">Force-directed Layout</option>
      <option value="concentric">Radial Layout</option>
      <option value="breadthfirst">Hierarchical Layout</option>
      <option value="grid">Grid Layout</option>
    `;
    
    layoutSelector.addEventListener('change', (e) => {
      const layoutType = e.target.value;
      appState.layoutType = layoutType;
      graphVisualization.applyLayout(layoutType);
    });
    
    // Add layout selector to control panel
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
      const layoutGroup = document.createElement('div');
      layoutGroup.className = 'control-group';
      layoutGroup.innerHTML = `<label for="layout-selector">Layout Type:</label>`;
      layoutGroup.appendChild(layoutSelector);
      
      controlPanel.appendChild(layoutGroup);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add autocomplete to search
    setupSearchAutocomplete();
  }
  
  /**
   * Set up autocomplete for search input
   */
  function setupSearchAutocomplete() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput || !graphVisualization || !graphVisualization.cy) return;
    
    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-container';
    autocompleteContainer.style.display = 'none';
    autocompleteContainer.style.position = 'absolute';
    autocompleteContainer.style.zIndex = '100';
    autocompleteContainer.style.backgroundColor = 'rgba(26, 42, 58, 0.95)';
    autocompleteContainer.style.border = '1px solid #4a6b8a';
    autocompleteContainer.style.borderRadius = '0 0 3px 3px';
    autocompleteContainer.style.maxHeight = '200px';
    autocompleteContainer.style.overflowY = 'auto';
    autocompleteContainer.style.width = '100%';
    
    // Insert after search input
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.insertBefore(autocompleteContainer, searchInput.nextSibling);
    
    // Add input event listener
    searchInput.addEventListener('input', debounce(() => {
      const term = searchInput.value.trim().toLowerCase();
      if (term.length < 2) {
        autocompleteContainer.style.display = 'none';
        return;
      }
      
      // Find matching nodes
      const matches = graphVisualization.cy.nodes().filter(node => {
        const data = node.data();
        return data.label.toLowerCase().includes(term) || 
               (data.description && data.description.toLowerCase().includes(term));
      });
      
      if (matches.length === 0) {
        autocompleteContainer.style.display = 'none';
        return;
      }
      
      // Sort matches by relevance (exact matches first, then by label length)
      matches.sort((a, b) => {
        const aLabel = a.data('label').toLowerCase();
        const bLabel = b.data('label').toLowerCase();
        
        // Exact matches first
        const aExact = aLabel === term;
        const bExact = bLabel === term;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Starts with term
        const aStarts = aLabel.startsWith(term);
        const bStarts = bLabel.startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Shorter labels first
        return aLabel.length - bLabel.length;
      });
      
      // Limit to top 10 matches
      const topMatches = matches.slice(0, 10);
      
      // Create suggestion items
      autocompleteContainer.innerHTML = '';
      topMatches.forEach(node => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.style.padding = '8px 10px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid rgba(74, 107, 138, 0.3)';
        
        const nodeData = node.data();
        const categoryColor = nodeData.color || '#999';
        
        item.innerHTML = `
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${categoryColor}; border-radius: 50%; margin-right: 8px;"></span>
            <span>${nodeData.label}</span>
          </div>
        `;
        
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
          searchInput.value = nodeData.label;
          autocompleteContainer.style.display = 'none';
          graphNavigation.focusOnNode(nodeData.id);
        });
        
        autocompleteContainer.appendChild(item);
      });
      
      autocompleteContainer.style.display = 'block';
    }, 200));
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target !== searchInput && !autocompleteContainer.contains(e.target)) {
        autocompleteContainer.style.display = 'none';
      }
    });
    
    // Hide autocomplete when pressing Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        autocompleteContainer.style.display = 'none';
      }
    });
  }
  
  /**
   * Apply initial application state
   */
  function applyInitialState() {
    // Set initial view
    switchView(appState.currentView);
    
    // Apply any URL parameters
    applyUrlParameters();
  }
  
  /**
   * Handle window resize
   */
  function handleWindowResize() {
    if (graphVisualization && graphVisualization.cy) {
      // Resize the graph to fit the container
      graphVisualization.cy.resize();
      graphVisualization.cy.fit();
    }
  }
  
  /**
   * Switch between different views (graph, list, about)
   */
  function switchView(viewName) {
    // Update state
    appState.currentView = viewName;
    
    // Update navigation
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.id === `view-${viewName}`) {
        link.classList.add('active');
      }
    });
    
    // Update view
    if (viewName === 'graph') {
      if (graphContainer) {
        graphContainer.style.display = 'block';
        
        // Ensure graph is properly sized
        if (graphVisualization && graphVisualization.cy) {
          setTimeout(() => {
            graphVisualization.cy.resize();
            graphVisualization.cy.fit();
          }, 100);
        }
      }
    } else if (viewName === 'list') {
      // Show list view
      if (graphContainer) {
        graphContainer.innerHTML = '';
        graphContainer.style.display = 'block';
        
        // Create list view
        createListView(graphContainer);
      }
    } else if (viewName === 'about') {
      // Show about view
      if (graphContainer) {
        graphContainer.innerHTML = '';
        graphContainer.style.display = 'block';
        
        // Create about view
        createAboutView(graphContainer);
      }
    }
    
    // Update URL
    updateUrlParameters({ view: viewName });
  }
  
  /**
   * Create list view of all concepts
   */
  function createListView(container) {
    if (!graphVisualization || !graphVisualization.cy) return;
    
    const nodes = graphVisualization.cy.nodes();
    
    // Create list container
    const listContainer = document.createElement('div');
    listContainer.className = 'list-view-container';
    listContainer.style.padding = '20px';
    listContainer.style.height = '100%';
    listContainer.style.overflowY = 'auto';
    
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'list-filter-controls';
    filterControls.style.marginBottom = '20px';
    filterControls.style.display = 'flex';
    filterControls.style.alignItems = 'center';
    filterControls.style.gap = '15px';
    
    // Create search input
    const searchInput = document.createElement('div');
    searchInput.className = 'list-search';
    searchInput.style.flex = '1';
    searchInput.innerHTML = `
      <input type="text" id="list-search-input" placeholder="Filter concepts..." style="
        width: 100%;
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid #4a6b8a;
        border-radius: 3px;
        color: #e0e7ff;
      ">
    `;
    
    // Create category filter
    const categoryFilter = document.createElement('div');
    categoryFilter.className = 'list-category-filter';
    categoryFilter.innerHTML = `
      <select id="list-category-filter" style="
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid #4a6b8a;
        border-radius: 3px;
        color: #e0e7ff;
      ">
        <option value="all">All Categories</option>
        <option value="memetic">Memetic</option>
        <option value="social">Social</option>
        <option value="magical">Magical</option>
        <option value="consciousness">Consciousness</option>
        <option value="general">General</option>
      </select>
    `;
    
    // Create sort control
    const sortControl = document.createElement('div');
    sortControl.className = 'list-sort-control';
    sortControl.innerHTML = `
      <select id="list-sort" style="
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid #4a6b8a;
        border-radius: 3px;
        color: #e0e7ff;
      ">
        <option value="alphabetical">Sort: A-Z</option>
        <option value="connections">Sort: Most Connected</option>
        <option value="category">Sort: By Category</option>
      </select>
    `;
    
    filterControls.appendChild(searchInput);
    filterControls.appendChild(categoryFilter);
    filterControls.appendChild(sortControl);
    
    // Create list
    const list = document.createElement('div');
    list.className = 'concept-list';
    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    list.style.gap = '15px';
    
    // Add all nodes to the list
    nodes.forEach(node => {
      const nodeData = node.data();
      
      const card = document.createElement('div');
      card.className = 'concept-card';
      card.dataset.id = nodeData.id;
      card.dataset.category = nodeData.category;
      card.dataset.connections = nodeData.connections || 0;
      
      card.style.backgroundColor = 'rgba(26, 42, 58, 0.7)';
      card.style.border = '1px solid #4a6b8a';
      card.style.borderLeft = `4px solid ${nodeData.color}`;
      card.style.borderRadius = '3px';
      card.style.padding = '15px';
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.2s, box-shadow 0.2s';
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin: 0; color: #e0e7ff; font-size: 1.1rem;">${nodeData.label}</h3>
          <span style="
            background-color: ${nodeData.color};
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            text-transform: uppercase;
          ">${nodeData.category}</span>
        </div>
        <p style="margin: 0 0 10px 0; color: #e0e7ff; opacity: 0.8; font-size: 0.9rem; line-height: 1.4;">
          ${nodeData.description ? (nodeData.description.length > 120 ? nodeData.description.substring(0, 120) + '...' : nodeData.description) : 'No description available.'}
        </p>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #e0e7ff; opacity: 0.7;">
          <span>Connections: ${nodeData.connections || 0}</span>
          <span>Click to view details</span>
        </div>
      `;
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-3px)';
        card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      });
      
      // Add click handler
      card.addEventListener('click', () => {
        // Switch to graph view and focus on this node
        switchView('graph');
        graphNavigation.focusOnNode(nodeData.id);
      });
      
      list.appendChild(card);
    });
    
    // Add filter functionality
    listContainer.appendChild(filterControls);
    listContainer.appendChild(list);
    container.appendChild(listContainer);
    
    // Set up filter and sort functionality
    const listSearchInput = document.getElementById('list-search-input');
    const listCategoryFilter = document.getElementById('list-category-filter');
    const listSort = document.getElementById('list-sort');
    
    function filterAndSortList() {
      const searchTerm = listSearchInput.value.toLowerCase();
      const category = listCategoryFilter.value;
      const sortBy = listSort.value;
      
      const cards = document.querySelectorAll('.concept-card');
      
      // Filter cards
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const cardCategory = card.dataset.category;
        
        const matchesSearch = searchTerm === '' || 
                             title.includes(searchTerm) || 
                             description.includes(searchTerm);
                             
        const matchesCategory = category === 'all' || cardCategory === category;
        
        if (matchesSearch && matchesCategory) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
      
      // Sort visible cards
      const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
      
      visibleCards.sort((a, b) => {
        if (sortBy === 'alphabetical') {
          return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
        } else if (sortBy === 'connections') {
          return parseInt(b.dataset.connections) - parseInt(a.dataset.connections);
        } else if (sortBy === 'category') {
          return a.dataset.category.localeCompare(b.dataset.category);
        }
      });
      
      // Reorder cards
      visibleCards.forEach(card => {
        list.appendChild(card);
      });
    }
    
    // Add event listeners
    listSearchInput.addEventListener('input', filterAndSortList);
    listCategoryFilter.addEventListener('change', filterAndSortList);
    listSort.addEventListener('change', filterAndSortList);
  }
  
  /**
   * Create about view with information about the project
   */
  function createAboutView(container) {
    const aboutContainer = document.createElement('div');
    aboutContainer.className = 'about-view-container';
    aboutContainer.style.padding = '20px';
    aboutContainer.style.maxWidth = '800px';
    aboutContainer.style.margin = '0 auto';
    aboutContainer.style.height = '100%';
    aboutContainer.style.overflowY = 'auto';
    
    aboutContainer.innerHTML = `
      <h2 style="color: #f1c40f; margin-bottom: 20px; text-align: center;">About Mimetic Magick Knowledge Graph Explorer</h2>
      
      <div style="background-color: rgba(26, 42, 58, 0.7); border: 1px solid #4a6b8a; border-radius: 5px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #3498db; margin-top: 0;">Project Overview</h3>
        <p>The Mimetic Magick Knowledge Graph Explorer is an interactive visualization tool that maps the concepts and relationships from "Mimetic Magick" by K. Packwood. This tool allows users to explore the interconnected nature of memetic theory, social dynamics, and magical practices as described in the text.</p>
        
        <p>By representing these concepts as a navigable knowledge graph, users can discover connections between ideas, trace conceptual lineages, and gain a deeper understanding of the material.</p>
      </div>
      
      <div style="background-color: rgba(26, 42, 58, 0.7); border: 1px solid #4a6b8a; border-radius: 5px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #3498db; margin-top: 0;">Source Material</h3>
        <p>"Mimetic Magick" explores how memes—units of cultural information that spread from person to person—can be deliberately created and propagated to effect change in the social matrix. The text examines the intersection of memetic theory, social dynamics, magical practices, and consciousness studies.</p>
        
        <p>Key themes in the work include:</p>
        <ul>
          <li>The nature and function of memes in social systems</li>
          <li>How memetic structures form and propagate</li>
          <li>The relationship between language, consciousness, and social reality</li>
          <li>Practical applications of memetic theory to create change</li>
        </ul>
      </div>
      
      <div style="background-color: rgba(26, 42, 58, 0.7); border: 1px solid #4a6b8a; border-radius: 5px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #3498db; margin-top: 0;">Visualization Approach</h3>
        <p>This knowledge graph visualization uses a game-inspired aesthetic drawing from classic strategy games like Civilization and Command and Conquer. This design choice reflects the strategic nature of memetic operations as described in the text, where concepts can be seen as interconnected "technologies" that build upon each other.</p>
        
        <p>The visualization represents:</p>
        <ul>
          <li><strong>Nodes:</strong> Key concepts from the text</li>
          <li><strong>Edges:</strong> Relationships and connections between concepts</li>
          <li><strong>Categories:</strong> Different domains of knowledge (memetic, social, magical, etc.)</li>
          <li><strong>Node Size:</strong> Relative importance or connectedness of concepts</li>
        </ul>
      </div>
      
      <div style="background-color: rgba(26, 42, 58, 0.7); border: 1px solid #4a6b8a; border-radius: 5px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #3498db; margin-top: 0;">How to Use This Tool</h3>
        <p>To get the most out of the Mimetic Magick Knowledge Graph Explorer:</p>
        <ol>
          <li>Use the graph view to explore connections visually</li>
          <li>Use the list view to browse all concepts alphabetically</li>
          <li>Click on nodes to see detailed information about each concept</li>
          <li>Use the search function to find specific concepts</li>
          <li>Filter by category to focus on specific domains</li>
          <li>Export visualizations or data for further study</li>
        </ol>
        
        <p>For a guided introduction to all features, click the "Take a Tour" button in the bottom right corner.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-bottom: 30px;">
        <button id="start-tour-btn" style="
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 1rem;
        ">Take a Guided Tour</button>
        
        <button id="view-help-btn" style="
          background-color: rgba(255, 255, 255, 0.1);
          color: #e0e7ff;
          border: 1px solid #4a6b8a;
          padding: 10px 20px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 1rem;
          margin-left: 15px;
        ">View Help Documentation</button>
      </div>
    `;
    
    container.appendChild(aboutContainer);
    
    // Add event listeners for buttons
    const startTourBtn = document.getElementById('start-tour-btn');
    if (startTourBtn) {
      startTourBtn.addEventListener('click', () => {
        switchView('graph');
        setTimeout(() => {
          if (guidedTour) {
            guidedTour.resetTourStatus();
            guidedTour.start();
          }
        }, 500);
      });
    }
    
    const viewHelpBtn = document.getElementById('view-help-btn');
    if (viewHelpBtn) {
      viewHelpBtn.addEventListener('click', () => {
        if (helpSection) {
          helpSection.show();
        }
      });
    }
  }
  
  /**
   * Toggle fullscreen mode
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      if (fullscreenToggle) {
        fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        if (fullscreenToggle) {
          fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
      }
    }
  }
  
  /**
   * Toggle controls panel
   */
  function toggleControls() {
    const sidebar = document.querySelector('.game-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }
  
  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
      return;
    }
    
    // Escape key to close sidebar or exit fullscreen
    if (event.key === 'Escape') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        if (fullscreenToggle) {
          fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
      } else {
        const sidebar = document.querySelector('.game-sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
          sidebar.classList.add('collapsed');
        }
      }
    }
    
    // Ctrl + F to focus search
    if ((event.key === 'f' || event.key === 'F') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // + and - keys for zoom
    if (event.key === '+' || event.key === '=') {
      if (graphNavigation) {
        graphNavigation.zoomInGraph();
      }
    }
    
    if (event.key === '-' || event.key === '_') {
      if (graphNavigation) {
        graphNavigation.zoomOutGraph();
      }
    }
    
    // Left and right arrows for history navigation
    if (event.altKey && event.key === 'ArrowLeft') {
      if (graphNavigation) {
        graphNavigation.navigateBack();
      }
    }
    
    if (event.altKey && event.key === 'ArrowRight') {
      if (graphNavigation) {
        graphNavigation.navigateForward();
      }
    }
    
    // R key to reset view
    if (event.key === 'r' || event.key === 'R') {
      if (graphNavigation) {
        graphNavigation.resetGraphView();
      }
    }
    
    // L key to toggle labels
    if (event.key === 'l' || event.key === 'L') {
      if (graphNavigation) {
        graphNavigation.toggleGraphLabels();
      }
    }
    
    // F key to toggle fullscreen
    if ((event.key === 'f' || event.key === 'F') && !event.ctrlKey && !event.metaKey) {
      toggleFullscreen();
    }
    
    // H key to toggle help
    if (event.key === 'h' || event.key === 'H') {
      if (helpSection) {
        helpSection.toggleVisibility();
      }
    }
    
    // Number keys 1-3 for view switching
    if (event.key === '1') {
      switchView('graph');
    } else if (event.key === '2') {
      switchView('list');
    } else if (event.key === '3') {
      switchView('about');
    }
  }
  
  /**
   * Apply URL parameters to the application state
   */
  function applyUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for view parameter
    const viewParam = urlParams.get('view');
    if (viewParam && ['graph', 'list', 'about'].includes(viewParam)) {
      switchView(viewParam);
    }
    
    // Check for node parameter
    const nodeParam = urlParams.get('node');
    if (nodeParam && graphNavigation) {
      // Focus on the specified node
      setTimeout(() => {
        graphNavigation.focusOnNode(nodeParam);
      }, 500);
    }
    
    // Check for category parameter
    const categoryParam = urlParams.get('category');
    if (categoryParam && graphNavigation) {
      // Apply category filter
      setTimeout(() => {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
          categoryFilter.value = categoryParam;
        }
        graphNavigation.filterByCategory(categoryParam);
      }, 500);
    }
    
    // Check for search parameter
    const searchParam = urlParams.get('search');
    if (searchParam && graphNavigation) {
      // Apply search
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.value = searchParam;
        }
        graphNavigation.handleSearch();
      }, 500);
    }
    
    // Check for layout parameter
    const layoutParam = urlParams.get('layout');
    if (layoutParam && graphVisualization) {
      // Apply layout
      setTimeout(() => {
        const layoutSelector = document.getElementById('layout-selector');
        if (layoutSelector) {
          layoutSelector.value = layoutParam;
        }
        graphVisualization.applyLayout(layoutParam);
      }, 500);
    }
  }
  
  /**
   * Update URL parameters without reloading the page
   */
  function updateUrlParameters(params) {
    const url = new URL(window.location);
    
    // Update or add each parameter
    Object.keys(params).forEach(key => {
      if (params[key] === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    // Update the URL without reloading the page
    window.history.pushState({}, '', url);
  }
  
  /**
   * Debounce function to limit how often a function is called
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Start the application
  initializeApp();
});