/**
 * Mimetic Magick Knowledge Graph Explorer
 * Help Section Module
 * 
 * This file implements a comprehensive help section that provides documentation
 * about the application features, keyboard shortcuts, and background information.
 */

class HelpSection {
  constructor(options = {}) {
    this.options = Object.assign({
      containerId: 'help-container',
      showShortcutsTable: true,
      showAboutSection: true,
      showTutorialLink: true
    }, options);
    
    this.isVisible = false;
    this.container = null;
    this.currentSection = 'overview';
    
    this.initialize();
  }
  
  /**
   * Initialize the help section
   */
  initialize() {
    this.createHelpButton();
    this.createHelpContainer();
  }
  
  /**
   * Create help button in the UI
   */
  createHelpButton() {
    const navList = document.querySelector('.main-nav ul');
    if (!navList) return;
    
    // Check if the button already exists
    if (document.getElementById('view-help')) return;
    
    // Create help button
    const helpListItem = document.createElement('li');
    const helpLink = document.createElement('a');
    helpLink.href = '#';
    helpLink.id = 'view-help';
    helpLink.textContent = 'Help';
    
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleVisibility();
    });
    
    helpListItem.appendChild(helpLink);
    navList.appendChild(helpListItem);
  }
  
  /**
   * Create the help container
   */
  createHelpContainer() {
    // Check if container already exists
    let container = document.getElementById(this.options.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      container.className = 'help-container';
      
      // Apply styles
      Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: '1000',
        display: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });
      
      // Create help content
      const helpContent = document.createElement('div');
      helpContent.className = 'help-content';
      
      Object.assign(helpContent.style, {
        width: '80%',
        maxWidth: '900px',
        maxHeight: '80vh',
        backgroundColor: 'rgba(26, 42, 58, 0.95)',
        border: '1px solid #4a6b8a',
        borderRadius: '5px',
        boxShadow: '0 5px 25px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      });
      
      // Create help header
      const helpHeader = document.createElement('div');
      helpHeader.className = 'help-header';
      
      Object.assign(helpHeader.style, {
        padding: '15px 20px',
        borderBottom: '1px solid #4a6b8a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(42, 62, 82, 0.9)'
      });
      
      helpHeader.innerHTML = `
        <h2 style="margin: 0; color: #f1c40f; font-size: 1.5rem;">Help & Documentation</h2>
        <button class="close-help" style="background: none; border: none; color: #e0e7ff; cursor: pointer; font-size: 1.2rem;">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Create help body with navigation
      const helpBody = document.createElement('div');
      helpBody.className = 'help-body';
      
      Object.assign(helpBody.style, {
        display: 'flex',
        height: 'calc(80vh - 120px)'
      });
      
      // Create navigation sidebar
      const helpNav = document.createElement('div');
      helpNav.className = 'help-nav';
      
      Object.assign(helpNav.style, {
        width: '200px',
        borderRight: '1px solid #4a6b8a',
        backgroundColor: 'rgba(26, 42, 58, 0.7)',
        padding: '15px 0',
        overflowY: 'auto'
      });
      
      helpNav.innerHTML = `
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li class="help-nav-item active" data-section="overview" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid #f1c40f; background-color: rgba(255, 255, 255, 0.1);">
            <i class="fas fa-home" style="margin-right: 8px;"></i> Overview
          </li>
          <li class="help-nav-item" data-section="navigation" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-compass" style="margin-right: 8px;"></i> Navigation
          </li>
          <li class="help-nav-item" data-section="search" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-search" style="margin-right: 8px;"></i> Search & Filter
          </li>
          <li class="help-nav-item" data-section="visualization" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-project-diagram" style="margin-right: 8px;"></i> Visualization
          </li>
          <li class="help-nav-item" data-section="shortcuts" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-keyboard" style="margin-right: 8px;"></i> Keyboard Shortcuts
          </li>
          <li class="help-nav-item" data-section="export" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-download" style="margin-right: 8px;"></i> Export Options
          </li>
          <li class="help-nav-item" data-section="about" style="padding: 10px 15px; cursor: pointer; border-left: 3px solid transparent;">
            <i class="fas fa-info-circle" style="margin-right: 8px;"></i> About
          </li>
        </ul>
      `;
      
      // Create content area
      const helpContent2 = document.createElement('div');
      helpContent2.className = 'help-content-area';
      
      Object.assign(helpContent2.style, {
        flex: '1',
        padding: '20px',
        overflowY: 'auto',
        color: '#e0e7ff'
      });
      
      // Add sections
      helpContent2.innerHTML = this.generateHelpContent();
      
      // Assemble the help panel
      helpBody.appendChild(helpNav);
      helpBody.appendChild(helpContent2);
      
      helpContent.appendChild(helpHeader);
      helpContent.appendChild(helpBody);
      
      container.appendChild(helpContent);
      
      // Add to the document
      document.body.appendChild(container);
      
      // Set up event listeners
      this.setupEventListeners(container);
    }
    
    this.container = container;
  }
  
  /**
   * Generate help content for all sections
   */
  generateHelpContent() {
    return `
      <div class="help-section active" id="help-overview">
        <h3>Welcome to the Mimetic Magick Knowledge Graph Explorer</h3>
        <p>This interactive tool allows you to explore the concepts and relationships from "Mimetic Magick" as a navigable knowledge graph. The visualization presents ideas as interconnected nodes that you can explore to understand how different concepts relate to each other.</p>
        
        <h4>Getting Started</h4>
        <p>To begin exploring:</p>
        <ul>
          <li>Click on any node in the graph to view detailed information about that concept</li>
          <li>Use the search bar to find specific concepts</li>
          <li>Filter by category to focus on specific types of concepts</li>
          <li>Zoom and pan to navigate through the knowledge graph</li>
        </ul>
        
        <p>For a guided introduction to all features, click the "Take a Tour" button in the bottom right corner.</p>
      </div>
      
      <div class="help-section" id="help-navigation">
        <h3>Navigating the Knowledge Graph</h3>
        
        <h4>Basic Navigation</h4>
        <ul>
          <li><strong>Pan:</strong> Click and drag on the background</li>
          <li><strong>Zoom:</strong> Use the mouse wheel or pinch gestures on touch devices</li>
          <li><strong>Select:</strong> Click on a node to view its details</li>
          <li><strong>Expand:</strong> When a node is selected, its connections are highlighted</li>
        </ul>
        
        <h4>Navigation Controls</h4>
        <p>The control panel provides several navigation options:</p>
        <ul>
          <li><strong>Zoom Controls:</strong> Use the + and - buttons to zoom in and out</li>
          <li><strong>Reset View:</strong> Return to the default view showing all nodes</li>
          <li><strong>Toggle Labels:</strong> Show or hide node labels</li>
          <li><strong>Fullscreen:</strong> Toggle fullscreen mode for a more immersive experience</li>
        </ul>
        
        <h4>Navigation History</h4>
        <p>Your exploration path is automatically tracked. Click the history button <i class="fas fa-history"></i> to view your navigation history and revisit previous concepts.</p>
        
        <h4>Minimap</h4>
        <p>The minimap in the bottom-left corner provides an overview of the entire graph. Click anywhere on the minimap to quickly navigate to that area.</p>
      </div>
      
      <div class="help-section" id="help-search">
        <h3>Search and Filter</h3>
        
        <h4>Search</h4>
        <p>Use the search bar to find specific concepts:</p>
        <ol>
          <li>Enter a search term in the search box</li>
          <li>Press Enter or click the search icon</li>
          <li>Matching nodes will be highlighted in the graph</li>
          <li>Click on any highlighted node to view its details</li>
        </ol>
        <p>The search looks for matches in both concept names and descriptions.</p>
        
        <h4>Category Filters</h4>
        <p>Filter the graph by concept categories:</p>
        <ul>
          <li><strong>Memetic:</strong> Concepts related to memes and memetic theory</li>
          <li><strong>Social:</strong> Concepts related to social structures and interactions</li>
          <li><strong>Magical:</strong> Concepts related to magical practices and theory</li>
          <li><strong>Consciousness:</strong> Concepts related to consciousness and awareness</li>
          <li><strong>General:</strong> General concepts that span multiple categories</li>
        </ul>
        <p>Select a category from the dropdown menu to show only nodes of that category.</p>
      </div>
      
      <div class="help-section" id="help-visualization">
        <h3>Visualization Features</h3>
        
        <h4>Node Representation</h4>
        <p>Nodes in the graph represent concepts from Mimetic Magick:</p>
        <ul>
          <li><strong>Color:</strong> Indicates the category of the concept</li>
          <li><strong>Size:</strong> Represents the importance or number of connections</li>
          <li><strong>Label:</strong> Shows the name of the concept</li>
        </ul>
        
        <h4>Edge Representation</h4>
        <p>Edges (lines) between nodes represent relationships:</p>
        <ul>
          <li><strong>Thickness:</strong> Indicates the strength of the relationship</li>
          <li><strong>Style:</strong> Different line styles represent different types of relationships</li>
        </ul>
        
        <h4>Layouts</h4>
        <p>You can change how the graph is arranged using different layout algorithms:</p>
        <ul>
          <li><strong>Force-directed:</strong> Nodes arrange themselves based on their connections</li>
          <li><strong>Hierarchical:</strong> Nodes are arranged in a top-down hierarchy</li>
          <li><strong>Radial:</strong> Nodes are arranged in concentric circles around a central node</li>
        </ul>
        <p>To change the layout, use the layout dropdown in the control panel.</p>
      </div>
      
      <div class="help-section" id="help-shortcuts">
        <h3>Keyboard Shortcuts</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: rgba(42, 62, 82, 0.9);">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #4a6b8a;">Shortcut</th>
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #4a6b8a;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>+</kbd> / <kbd>=</kbd></td>
              <td style="padding: 10px;">Zoom in</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>-</kbd> / <kbd>_</kbd></td>
              <td style="padding: 10px;">Zoom out</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>R</kbd></td>
              <td style="padding: 10px;">Reset view</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>L</kbd></td>
              <td style="padding: 10px;">Toggle labels</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>F</kbd></td>
              <td style="padding: 10px;">Toggle fullscreen</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
              <td style="padding: 10px;">Focus search box</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>Alt</kbd> + <kbd>←</kbd></td>
              <td style="padding: 10px;">Navigate back in history</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>Alt</kbd> + <kbd>→</kbd></td>
              <td style="padding: 10px;">Navigate forward in history</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>Esc</kbd></td>
              <td style="padding: 10px;">Close sidebar or exit fullscreen</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(74, 107, 138, 0.3);">
              <td style="padding: 10px;"><kbd>H</kbd></td>
              <td style="padding: 10px;">Toggle this help panel</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="help-section" id="help-export">
        <h3>Export Options</h3>
        
        <h4>Exporting Images</h4>
        <p>You can export the current graph view as an image:</p>
        <ol>
          <li>Click the export button <i class="fas fa-download"></i> in the control panel</li>
          <li>Select "Export Image" tab</li>
          <li>Choose your preferred format (PNG or JPG)</li>
          <li>Adjust quality settings as needed</li>
          <li>Click "Export" to download the image</li>
        </ol>
        
        <h4>Exporting Data</h4>
        <p>You can also export the graph data for use in other applications:</p>
        <ol>
          <li>Click the export button <i class="fas fa-download"></i> in the control panel</li>
          <li>Select "Export Data" tab</li>
          <li>Choose your preferred format (JSON or CSV)</li>
          <li>Select whether to include metadata</li>
          <li>Choose whether to export the entire graph or just selected nodes</li>
          <li>Click "Export" to download the data file</li>
        </ol>
      </div>
      
      <div class="help-section" id="help-about">
        <h3>About Mimetic Magick Knowledge Graph Explorer</h3>
        
        <h4>Source Material</h4>
        <p>This visualization is based on "Mimetic Magick" by K. Packwood, which explores the intersection of memetics, social dynamics, and magical practices. The knowledge graph represents the key concepts and their relationships as presented in the text.</p>
        
        <h4>Visualization Approach</h4>
        <p>The visualization uses a game-inspired aesthetic drawing from classic strategy games like Civilization and Command and Conquer, presenting complex conceptual relationships in an intuitive, interactive format.</p>
        
        <h4>Technical Implementation</h4>
        <p>This application is built using:</p>
        <ul>
          <li>HTML5 and CSS3 for structure and styling</li>
          <li>JavaScript for interactivity</li>
          <li>Cytoscape.js for graph visualization</li>
          <li>Custom-built components for navigation, history tracking, and export functionality</li>
        </ul>
        
        <h4>Accessibility</h4>
        <p>This application includes several accessibility features:</p>
        <ul>
          <li>Keyboard navigation</li>
          <li>Color schemes designed to be distinguishable for color-blind users</li>
          <li>Responsive design for different screen sizes</li>
          <li>Touch-optimized controls for mobile devices</li>
        </ul>
      </div>
    `;
  }
  
  /**
   * Set up event listeners for the help panel
   */
  setupEventListeners(container) {
    // Close button
    const closeButton = container.querySelector('.close-help');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide();
      });
    }
    
    // Navigation items
    const navItems = container.querySelectorAll('.help-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Update active nav item
        navItems.forEach(navItem => {
          navItem.classList.remove('active');
          navItem.style.borderLeft = '3px solid transparent';
          navItem.style.backgroundColor = 'transparent';
        });
        
        item.classList.add('active');
        item.style.borderLeft = '3px solid #f1c40f';
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        
        // Show corresponding section
        const sectionId = item.dataset.section;
        this.showSection(sectionId);
      });
    });
    
    // Click outside to close
    container.addEventListener('click', (event) => {
      if (event.target === container) {
        this.hide();
      }
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (event) => {
      if (event.key === 'h' || event.key === 'H') {
        this.toggleVisibility();
      }
      
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }
  
  /**
   * Show a specific help section
   */
  showSection(sectionId) {
    if (!this.container) return;
    
    // Hide all sections
    const sections = this.container.querySelectorAll('.help-section');
    sections.forEach(section => {
      section.classList.remove('active');
      section.style.display = 'none';
    });
    
    // Show the requested section
    const section = this.container.querySelector(`#help-${sectionId}`);
    if (section) {
      section.classList.add('active');
      section.style.display = 'block';
      this.currentSection = sectionId;
    }
  }
  
  /**
   * Show the help panel
   */
  show() {
    if (!this.container || this.isVisible) return;
    
    this.container.style.display = 'flex';
    setTimeout(() => {
      this.container.style.opacity = '1';
    }, 10);
    
    this.isVisible = true;
    
    // Show the current section
    this.showSection(this.currentSection);
  }
  
  /**
   * Hide the help panel
   */
  hide() {
    if (!this.container || !this.isVisible) return;
    
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 300);
    
    this.isVisible = false;
  }
  
  /**
   * Toggle the visibility of the help panel
   */
  toggleVisibility() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

// Export the class
window.HelpSection = HelpSection;