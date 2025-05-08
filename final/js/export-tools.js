/**
 * Mimetic Magick Knowledge Graph Explorer
 * Export Tools Module
 * 
 * This file implements functionality for exporting graph visualizations
 * as images or data files, allowing users to save and share their findings.
 */

class ExportTools {
  constructor(graphVisualization, options = {}) {
    this.graph = graphVisualization;
    this.options = Object.assign({
      imageFormats: ['png', 'jpg'],
      dataFormats: ['json', 'csv'],
      defaultImageFormat: 'png',
      defaultDataFormat: 'json',
      imageQuality: 1.0,
      includeStyles: true,
      includeMetadata: true,
      filenamePrefix: 'mimetic-magick-graph',
      showNotifications: true
    }, options);
    
    this.initialize();
  }
  
  /**
   * Initialize the export tools
   */
  initialize() {
    this.createExportButton();
  }
  
  /**
   * Create export button in the UI
   */
  createExportButton() {
    const controlsBar = document.querySelector('.game-controls');
    if (!controlsBar) return;
    
    const viewControls = controlsBar.querySelector('.view-controls');
    if (!viewControls) return;
    
    // Create export button
    const exportButton = document.createElement('button');
    exportButton.id = 'export-button';
    exportButton.innerHTML = '<i class="fas fa-download"></i>';
    exportButton.title = 'Export Graph';
    
    // Add click handler
    exportButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showExportDialog();
    });
    
    // Add to view controls
    viewControls.appendChild(exportButton);
  }
  
  /**
   * Show export dialog
   */
  showExportDialog() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
    
    // Create modal dialog
    const dialog = document.createElement('div');
    dialog.className = 'export-dialog';
    
    Object.assign(dialog.style, {
      width: '400px',
      backgroundColor: 'rgba(26, 42, 58, 0.95)',
      border: '1px solid #4a6b8a',
      borderRadius: '5px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
      padding: '0'
    });
    
    // Create dialog header
    const header = document.createElement('div');
    header.className = 'export-dialog-header';
    
    Object.assign(header.style, {
      padding: '15px',
      borderBottom: '1px solid #4a6b8a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(42, 62, 82, 0.9)'
    });
    
    header.innerHTML = `
      <h3 style="margin: 0; color: #e0e7ff; font-size: 1.2rem;">Export Graph</h3>
      <button class="close-dialog" style="background: none; border: none; color: #e0e7ff; cursor: pointer; font-size: 1.2rem;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Create dialog content
    const content = document.createElement('div');
    content.className = 'export-dialog-content';
    
    Object.assign(content.style, {
      padding: '20px'
    });
    
    content.innerHTML = `
      <div class="export-tabs" style="display: flex; margin-bottom: 20px; border-bottom: 1px solid #4a6b8a;">
        <button class="export-tab active" data-tab="image" style="flex: 1; padding: 10px; background: none; border: none; color: #e0e7ff; cursor: pointer; border-bottom: 2px solid #f1c40f;">
          Export Image
        </button>
        <button class="export-tab" data-tab="data" style="flex: 1; padding: 10px; background: none; border: none; color: #e0e7ff; cursor: pointer; opacity: 0.7;">
          Export Data
        </button>
      </div>
      
      <div class="export-tab-content" id="image-export-tab" style="display: block;">
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #e0e7ff;">Image Format</label>
          <select id="image-format" style="width: 100%; padding: 8px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; border-radius: 3px; color: #e0e7ff;">
            <option value="png">PNG Image (.png)</option>
            <option value="jpg">JPEG Image (.jpg)</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #e0e7ff;">Image Quality</label>
          <input type="range" id="image-quality" min="1" max="3" step="1" value="2" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #e0e7ff; opacity: 0.7;">
            <span>Standard</span>
            <span>High</span>
            <span>Ultra</span>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: #e0e7ff;">
            <input type="checkbox" id="include-background" checked style="margin-right: 8px;">
            Include Background
          </label>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: #e0e7ff;">
            <input type="checkbox" id="export-selection-only" style="margin-right: 8px;">
            Export Selected Area Only
          </label>
        </div>
      </div>
      
      <div class="export-tab-content" id="data-export-tab" style="display: none;">
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #e0e7ff;">Data Format</label>
          <select id="data-format" style="width: 100%; padding: 8px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; border-radius: 3px; color: #e0e7ff;">
            <option value="json">JSON (.json)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: #e0e7ff;">
            <input type="checkbox" id="include-metadata" checked style="margin-right: 8px;">
            Include Metadata
          </label>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; color: #e0e7ff;">
            <input type="checkbox" id="export-data-selection-only" style="margin-right: 8px;">
            Export Selected Nodes Only
          </label>
        </div>
      </div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; color: #e0e7ff;">Filename</label>
        <input type="text" id="export-filename" value="${this.options.filenamePrefix}" style="width: 100%; padding: 8px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; border-radius: 3px; color: #e0e7ff;">
      </div>
    `;
    
    // Create dialog footer
    const footer = document.createElement('div');
    footer.className = 'export-dialog-footer';
    
    Object.assign(footer.style, {
      padding: '15px',
      borderTop: '1px solid #4a6b8a',
      display: 'flex',
      justifyContent: 'flex-end'
    });
    
    footer.innerHTML = `
      <button class="cancel-export" style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #4a6b8a; color: #e0e7ff; padding: 8px 15px; border-radius: 3px; cursor: pointer; margin-right: 10px;">
        Cancel
      </button>
      <button class="confirm-export" style="background-color: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer;">
        Export
      </button>
    `;
    
    // Assemble the dialog
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    
    // Add to the document
    document.body.appendChild(overlay);
    
    // Set up event listeners
    this.setupDialogEventListeners(overlay, dialog);
  }
  
  /**
   * Set up event listeners for the export dialog
   */
  setupDialogEventListeners(overlay, dialog) {
    // Close button
    const closeButton = dialog.querySelector('.close-dialog');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        overlay.remove();
      });
    }
    
    // Cancel button
    const cancelButton = dialog.querySelector('.cancel-export');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        overlay.remove();
      });
    }
    
    // Tab switching
    const tabs = dialog.querySelectorAll('.export-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.borderBottom = 'none';
          t.style.opacity = '0.7';
        });
        tab.classList.add('active');
        tab.style.borderBottom = '2px solid #f1c40f';
        tab.style.opacity = '1';
        
        // Show corresponding content
        const tabId = tab.dataset.tab;
        const tabContents = dialog.querySelectorAll('.export-tab-content');
        tabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        const activeContent = dialog.querySelector(`#${tabId}-export-tab`);
        if (activeContent) {
          activeContent.style.display = 'block';
        }
      });
    });
    
    // Export button
    const exportButton = dialog.querySelector('.confirm-export');
    if (exportButton) {
      exportButton.addEventListener('click', () => {
        const activeTab = dialog.querySelector('.export-tab.active');
        if (activeTab && activeTab.dataset.tab === 'image') {
          this.exportImage(dialog);
        } else {
          this.exportData(dialog);
        }
        overlay.remove();
      });
    }
    
    // Click outside to close
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });
  }
  
  /**
   * Export graph as an image
   */
  exportImage(dialog) {
    if (!this.graph || !this.graph.cy) {
      this.showNotification('Error: Graph visualization not available', 'error');
      return;
    }
    
    // Get export options from dialog
    const format = dialog.querySelector('#image-format').value || this.options.defaultImageFormat;
    const qualityLevel = parseInt(dialog.querySelector('#image-quality').value) || 2;
    const includeBackground = dialog.querySelector('#include-background').checked;
    const selectionOnly = dialog.querySelector('#export-selection-only').checked;
    const filename = dialog.querySelector('#export-filename').value || this.options.filenamePrefix;
    
    // Calculate scale based on quality level
    let scale = 1.0;
    switch (qualityLevel) {
      case 1: scale = 1.0; break;
      case 2: scale = 2.0; break;
      case 3: scale = 3.0; break;
    }
    
    // Prepare export options
    const exportOptions = {
      output: 'blob',
      bg: includeBackground ? this.graph.cy.style().selector('core').style('background-color') : 'transparent',
      scale: scale,
      full: !selectionOnly
    };
    
    // If selection only, focus on selected elements
    if (selectionOnly && this.graph.selectedNode) {
      const neighborhood = this.graph.selectedNode.neighborhood();
      const elements = this.graph.selectedNode.union(neighborhood);
      exportOptions.elements = elements;
    }
    
    try {
      // Generate image
      const imageBlob = format === 'jpg' ? 
        this.graph.cy.jpg(exportOptions) : 
        this.graph.cy.png(exportOptions);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(imageBlob);
      downloadLink.download = `${filename}.${format}`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      this.showNotification(`Graph exported as ${format.toUpperCase()} image`, 'success');
    } catch (error) {
      console.error('Error exporting image:', error);
      this.showNotification('Error exporting image', 'error');
    }
  }
  
  /**
   * Export graph data
   */
  exportData(dialog) {
    if (!this.graph || !this.graph.cy) {
      this.showNotification('Error: Graph data not available', 'error');
      return;
    }
    
    // Get export options from dialog
    const format = dialog.querySelector('#data-format').value || this.options.defaultDataFormat;
    const includeMetadata = dialog.querySelector('#include-metadata').checked;
    const selectionOnly = dialog.querySelector('#export-data-selection-only').checked;
    const filename = dialog.querySelector('#export-filename').value || this.options.filenamePrefix;
    
    try {
      let exportData;
      
      // Get elements to export
      let elements = this.graph.cy.elements();
      if (selectionOnly && this.graph.selectedNode) {
        const neighborhood = this.graph.selectedNode.neighborhood();
        elements = this.graph.selectedNode.union(neighborhood);
      }
      
      if (format === 'json') {
        // Export as JSON
        exportData = this.exportAsJson(elements, includeMetadata);
        this.downloadFile(exportData, `${filename}.json`, 'application/json');
      } else if (format === 'csv') {
        // Export as CSV
        exportData = this.exportAsCsv(elements, includeMetadata);
        this.downloadFile(exportData, `${filename}.csv`, 'text/csv');
      }
      
      this.showNotification(`Graph data exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showNotification('Error exporting data', 'error');
    }
  }
  
  /**
   * Export graph data as JSON
   */
  exportAsJson(elements, includeMetadata) {
    const nodes = [];
    const links = [];
    
    // Export nodes
    elements.nodes().forEach(node => {
      const nodeData = {
        id: node.id(),
        label: node.data('label'),
        category: node.data('category'),
        description: node.data('description')
      };
      
      if (includeMetadata) {
        nodeData.visualAttributes = {
          size: node.data('size'),
          color: node.data('color'),
          connections: node.data('connections'),
          x: node.position('x'),
          y: node.position('y')
        };
      }
      
      nodes.push(nodeData);
    });
    
    // Export edges
    elements.edges().forEach((edge, index) => {
      const edgeData = {
        source: edge.source().id(),
        target: edge.target().id(),
        label: edge.data('label') || ''
      };
      
      if (includeMetadata) {
        edgeData.id = edge.id();
        edgeData.weight = edge.data('weight') || 1;
        edgeData.color = edge.data('color') || '#999999';
        edgeData.strength = edge.data('strength') || 1;
      }
      
      links.push(edgeData);
    });
    
    // Create export object
    const exportObject = {
      nodes: nodes,
      links: links
    };
    
    if (includeMetadata) {
      exportObject.metadata = {
        exportDate: new Date().toISOString(),
        nodeCount: nodes.length,
        linkCount: links.length,
        source: 'Mimetic Magick Knowledge Graph Explorer'
      };
    }
    
    return JSON.stringify(exportObject, null, 2);
  }
  
  /**
   * Export graph data as CSV
   */
  exportAsCsv(elements, includeMetadata) {
    // Create CSV for nodes
    let nodesCsv = 'id,label,category,description';
    if (includeMetadata) {
      nodesCsv += ',size,color,connections,x,y';
    }
    nodesCsv += '\n';
    
    elements.nodes().forEach(node => {
      // Escape fields that might contain commas
      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      
      nodesCsv += `${node.id()},${escapeCsv(node.data('label'))},${node.data('category')},${escapeCsv(node.data('description'))}`;
      
      if (includeMetadata) {
        nodesCsv += `,${node.data('size')},${node.data('color')},${node.data('connections')},${node.position('x')},${node.position('y')}`;
      }
      
      nodesCsv += '\n';
    });
    
    // Create CSV for edges
    let edgesCsv = 'source,target,label';
    if (includeMetadata) {
      edgesCsv += ',id,weight,color,strength';
    }
    edgesCsv += '\n';
    
    elements.edges().forEach(edge => {
      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      
      edgesCsv += `${edge.source().id()},${edge.target().id()},${escapeCsv(edge.data('label') || '')}`;
      
      if (includeMetadata) {
        edgesCsv += `,${edge.id()},${edge.data('weight') || 1},${edge.data('color') || '#999999'},${edge.data('strength') || 1}`;
      }
      
      edgesCsv += '\n';
    });
    
    // Combine into a single CSV with sections
    return `# NODES\n${nodesCsv}\n# EDGES\n${edgesCsv}`;
  }
  
  /**
   * Download a file
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Show a notification
   */
  showNotification(message, type = 'info') {
    if (!this.options.showNotifications) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `export-notification ${type}`;
    
    // Set styles based on type
    let backgroundColor, iconClass;
    switch (type) {
      case 'success':
        backgroundColor = 'rgba(46, 204, 113, 0.9)';
        iconClass = 'fa-check-circle';
        break;
      case 'error':
        backgroundColor = 'rgba(231, 76, 60, 0.9)';
        iconClass = 'fa-exclamation-circle';
        break;
      case 'warning':
        backgroundColor = 'rgba(241, 196, 15, 0.9)';
        iconClass = 'fa-exclamation-triangle';
        break;
      default:
        backgroundColor = 'rgba(52, 152, 219, 0.9)';
        iconClass = 'fa-info-circle';
    }
    
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: backgroundColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      maxWidth: '300px',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });
    
    notification.innerHTML = `
      <i class="fas ${iconClass}" style="margin-right: 10px;"></i>
      <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Export the class
window.ExportTools = ExportTools;