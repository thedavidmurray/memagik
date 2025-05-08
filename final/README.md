# Mimetic Magick Knowledge Graph Explorer

An interactive web application that visualizes the concepts from "Mimetic Magick" as a navigable knowledge graph with game-inspired aesthetics.

## Overview

The Mimetic Magick Knowledge Graph Explorer is an interactive visualization tool that maps the concepts and relationships from "Mimetic Magick" by K. Packwood. This tool allows users to explore the interconnected nature of memetic theory, social dynamics, and magical practices as described in the text.

By representing these concepts as a navigable knowledge graph, users can discover connections between ideas, trace conceptual lineages, and gain a deeper understanding of the material.

## Features

- **Interactive Knowledge Graph**: Explore concepts and their relationships in an intuitive visual format
- **Multiple Views**: Switch between graph view, list view, and about view
- **Advanced Search**: Find concepts quickly with autocomplete suggestions
- **Category Filtering**: Focus on specific types of concepts (memetic, social, magical, etc.)
- **Detailed Information**: View comprehensive details about each concept when selected
- **Related Concepts**: Discover connections between different ideas
- **Navigation History**: Track your exploration path and revisit previous concepts
- **Minimap**: Navigate large graphs with an overview map
- **Export Options**: Save visualizations as images or export data for further analysis
- **Guided Tour**: First-time users can take a guided tour of all features
- **Keyboard Shortcuts**: Power users can navigate efficiently with keyboard commands
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility Features**: Designed with accessibility in mind

## Technical Implementation

This application is built using:

- HTML5 and CSS3 for structure and styling
- JavaScript for interactivity
- Cytoscape.js for graph visualization
- Custom-built components for navigation, history tracking, and export functionality

The visualization uses a game-inspired aesthetic drawing from classic strategy games like Civilization and Command and Conquer, presenting complex conceptual relationships in an intuitive, interactive format.

## Getting Started

1. Open `index.html` in a modern web browser
2. The graph visualization will load automatically
3. Click on any node to view detailed information about that concept
4. Use the search bar to find specific concepts
5. Use the controls in the sidebar to filter and adjust the visualization
6. For a guided introduction, click the "Take a Tour" button

## Keyboard Shortcuts

- `+` / `=`: Zoom in
- `-` / `_`: Zoom out
- `R`: Reset view
- `L`: Toggle labels
- `F`: Toggle fullscreen
- `Ctrl` + `F`: Focus search box
- `Alt` + `←`: Navigate back in history
- `Alt` + `→`: Navigate forward in history
- `Esc`: Close sidebar or exit fullscreen
- `H`: Toggle help panel
- `1`: Switch to graph view
- `2`: Switch to list view
- `3`: Switch to about view

## Browser Compatibility

This application is designed to work in modern browsers including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Project Structure

```
final/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   ├── main.css            # Main stylesheet
│   └── components.css      # Component-specific styles
├── js/                     # JavaScript files
│   ├── graph.js            # Graph visualization core
│   ├── navigation.js       # Navigation controls
│   ├── minimap.js          # Minimap component
│   ├── history-panel.js    # History tracking
│   ├── export-tools.js     # Export functionality
│   ├── guided-tour.js      # Guided tour for new users
│   ├── help-section.js     # Help documentation
│   ├── responsive-design.js # Responsive design helpers
│   ├── main.js             # Main application logic
│   └── lib/                # External libraries
│       └── cytoscape.min.js # Cytoscape.js library
├── assets/                 # Visual assets
└── data/                   # Knowledge graph data
    ├── knowledge_graph.json       # Graph data
    └── visualization_schema.json  # Visualization configuration
```

## License

This project is based on "Mimetic Magick" by K. Packwood and is intended for educational and research purposes.