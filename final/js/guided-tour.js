/**
 * Mimetic Magick Knowledge Graph Explorer
 * Guided Tour Module
 * 
 * This file implements a step-by-step guided tour for first-time users,
 * introducing them to the key features of the knowledge graph explorer.
 */

class GuidedTour {
  constructor(options = {}) {
    this.options = Object.assign({
      steps: [
        {
          element: '.graph-container',
          title: 'Knowledge Graph',
          content: 'This is the main visualization area where you can explore the concepts from Mimetic Magick. Click and drag to move around, scroll to zoom in and out.',
          position: 'right'
        },
        {
          element: '.game-sidebar',
          title: 'Information Panel',
          content: 'This panel shows detailed information about selected concepts. Click on any node in the graph to view its details here.',
          position: 'left'
        },
        {
          element: '.search-container',
          title: 'Search',
          content: 'Search for specific concepts by name or description. Press Enter or click the search icon to find matching nodes.',
          position: 'top'
        },
        {
          element: '#category-filter',
          title: 'Category Filter',
          content: 'Filter the graph to show only concepts from specific categories like Memetic, Social, or Magical.',
          position: 'right'
        },
        {
          element: '.zoom-controls',
          title: 'Zoom Controls',
          content: 'Adjust the zoom level to see more or fewer details. You can also use the mouse wheel or pinch gestures.',
          position: 'right'
        },
        {
          element: '#minimap-container',
          title: 'Minimap',
          content: 'This small map shows your current position in the overall graph. Click anywhere on it to navigate quickly.',
          position: 'right'
        },
        {
          element: '#related-concepts-list',
          title: 'Related Concepts',
          content: 'When you select a concept, this list shows other concepts that are directly connected to it. Click on any item to navigate to that concept.',
          position: 'left'
        },
        {
          element: '#history-panel',
          title: 'Navigation History',
          content: 'Your exploration history is tracked here. Use the back and forward buttons to revisit previous concepts.',
          position: 'bottom'
        }
      ],
      showOverlay: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      buttonClass: 'tour-button',
      highlightClass: 'tour-highlight',
      tooltipClass: 'tour-tooltip',
      storageKey: 'mimetic-magick-tour-completed',
      autoStart: true,
      showSkip: true
    }, options);
    
    this.currentStep = 0;
    this.isActive = false;
    this.overlay = null;
    this.tooltip = null;
    this.highlightElement = null;
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the guided tour
   */
  initialize() {
    // Create necessary DOM elements
    this.createStyles();
    
    // Check if tour has been completed before
    if (this.options.autoStart && !this.hasCompletedTour()) {
      // Add a slight delay to ensure the page is fully loaded
      setTimeout(() => this.start(), 1500);
    }
    
    // Add tour button to the UI
    this.createTourButton();
  }
  
  /**
   * Create CSS styles for the tour
   */
  createStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .tour-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${this.options.overlayColor};
        z-index: 9998;
        pointer-events: none;
      }
      
      .tour-highlight {
        position: relative;
        z-index: 9999;
        box-shadow: 0 0 0 4px #f1c40f;
        border-radius: 4px;
        pointer-events: auto;
      }
      
      .tour-tooltip {
        position: absolute;
        max-width: 300px;
        background-color: rgba(26, 42, 58, 0.95);
        color: #e0e7ff;
        border: 1px solid #4a6b8a;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        pointer-events: auto;
      }
      
      .tour-tooltip-title {
        font-size: 1.1rem;
        color: #f1c40f;
        margin-bottom: 10px;
        border-bottom: 1px solid #4a6b8a;
        padding-bottom: 5px;
      }
      
      .tour-tooltip-content {
        margin-bottom: 15px;
        line-height: 1.5;
      }
      
      .tour-tooltip-buttons {
        display: flex;
        justify-content: space-between;
      }
      
      .tour-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 3px;
        cursor: pointer;
        font-family: var(--font-main);
        font-size: 0.9rem;
        transition: background-color 0.2s;
      }
      
      .tour-button:hover {
        background-color: #2980b9;
      }
      
      .tour-button.secondary {
        background-color: rgba(255, 255, 255, 0.1);
        color: #e0e7ff;
        border: 1px solid #4a6b8a;
      }
      
      .tour-button.secondary:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .tour-start-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 8px 15px;
      }
      
      .tour-start-button i {
        margin-right: 8px;
      }
      
      @media (max-width: 768px) {
        .tour-tooltip {
          max-width: 250px;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  /**
   * Create a button to start the tour
   */
  createTourButton() {
    const button = document.createElement('button');
    button.className = `${this.options.buttonClass} tour-start-button`;
    button.innerHTML = '<i class="fas fa-question-circle"></i> Take a Tour';
    button.title = 'Start the guided tour';
    
    button.addEventListener('click', () => {
      this.start();
    });
    
    document.body.appendChild(button);
  }
  
  /**
   * Start the guided tour
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    
    // Create overlay
    if (this.options.showOverlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'tour-overlay';
      document.body.appendChild(this.overlay);
    }
    
    // Show the first step
    this.showStep(this.currentStep);
  }
  
  /**
   * Show a specific step of the tour
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.options.steps.length) {
      this.end();
      return;
    }
    
    const step = this.options.steps[stepIndex];
    const element = document.querySelector(step.element);
    
    if (!element) {
      console.warn(`Tour element not found: ${step.element}`);
      this.nextStep();
      return;
    }
    
    // Highlight the element
    element.classList.add(this.options.highlightClass);
    this.highlightElement = element;
    
    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = this.options.tooltipClass;
    
    // Add content to tooltip
    this.tooltip.innerHTML = `
      <div class="tour-tooltip-title">${step.title}</div>
      <div class="tour-tooltip-content">${step.content}</div>
      <div class="tour-tooltip-buttons">
        ${this.options.showSkip && stepIndex === 0 ? 
          `<button class="tour-button secondary" data-action="skip">Skip Tour</button>` : 
          `<button class="tour-button secondary" data-action="back" ${stepIndex === 0 ? 'disabled' : ''}>Back</button>`
        }
        <button class="tour-button" data-action="next">
          ${stepIndex === this.options.steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    `;
    
    // Add event listeners to buttons
    const skipButton = this.tooltip.querySelector('[data-action="skip"]');
    if (skipButton) {
      skipButton.addEventListener('click', () => this.end());
    }
    
    const backButton = this.tooltip.querySelector('[data-action="back"]');
    if (backButton) {
      backButton.addEventListener('click', () => this.previousStep());
    }
    
    const nextButton = this.tooltip.querySelector('[data-action="next"]');
    if (nextButton) {
      nextButton.addEventListener('click', () => this.nextStep());
    }
    
    // Add tooltip to the document
    document.body.appendChild(this.tooltip);
    
    // Position the tooltip
    this.positionTooltip(element, step.position);
    
    // Scroll element into view if needed
    this.scrollIntoView(element);
  }
  
  /**
   * Position the tooltip relative to the target element
   */
  positionTooltip(element, position) {
    if (!this.tooltip || !element) return;
    
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = elementRect.top - tooltipRect.height - 10;
        left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = elementRect.bottom + 10;
        left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
        left = elementRect.left - tooltipRect.width - 10;
        break;
      case 'right':
      default:
        top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
        left = elementRect.right + 10;
        break;
    }
    
    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }
    
    // Apply position
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }
  
  /**
   * Scroll element into view if needed
   */
  scrollIntoView(element) {
    if (!element) return;
    
    const elementRect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Check if element is outside viewport
    if (elementRect.top < 0 || 
        elementRect.bottom > viewportHeight || 
        elementRect.left < 0 || 
        elementRect.right > viewportWidth) {
      
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }
  
  /**
   * Move to the next step
   */
  nextStep() {
    this.cleanupCurrentStep();
    this.currentStep++;
    
    if (this.currentStep >= this.options.steps.length) {
      this.end();
    } else {
      this.showStep(this.currentStep);
    }
  }
  
  /**
   * Move to the previous step
   */
  previousStep() {
    this.cleanupCurrentStep();
    this.currentStep--;
    
    if (this.currentStep < 0) {
      this.currentStep = 0;
    }
    
    this.showStep(this.currentStep);
  }
  
  /**
   * Clean up the current step
   */
  cleanupCurrentStep() {
    // Remove highlight from element
    if (this.highlightElement) {
      this.highlightElement.classList.remove(this.options.highlightClass);
      this.highlightElement = null;
    }
    
    // Remove tooltip
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }
  
  /**
   * End the tour
   */
  end() {
    this.cleanupCurrentStep();
    
    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    this.isActive = false;
    
    // Mark tour as completed
    this.markTourAsCompleted();
  }
  
  /**
   * Check if the user has completed the tour before
   */
  hasCompletedTour() {
    try {
      return localStorage.getItem(this.options.storageKey) === 'true';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Mark the tour as completed
   */
  markTourAsCompleted() {
    try {
      localStorage.setItem(this.options.storageKey, 'true');
    } catch (e) {
      console.warn('Could not save tour completion status to localStorage');
    }
  }
  
  /**
   * Reset the tour completion status
   */
  resetTourStatus() {
    try {
      localStorage.removeItem(this.options.storageKey);
    } catch (e) {
      console.warn('Could not reset tour completion status in localStorage');
    }
  }
}

// Export the class
window.GuidedTour = GuidedTour;