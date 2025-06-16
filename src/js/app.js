// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js to visualize the grid lattice and the points on the parabola with crisp SVG graphics.

// Function to calculate optimal SVG dimensions based on card type and available space
function calculateSVGDimensions(cardType, containerElement = null) {
    const configs = {
        narrow: {
            paddingAndContent: 80,
            aspectRatio: 1.15,
            maxWidth: 600,
            minWidth: 400,
            maxHeight: 500,
            minHeight: 350
        },
        wide: {
            paddingAndContent: 100,
            aspectRatio: 2.0,
            maxWidth: 800,
            minWidth: 600,
            maxHeight: 400,
            minHeight: 300
        }
    };
    
    const config = configs[cardType] || configs.narrow;
    let svgWidth = config.maxWidth;
    let svgHeight = svgWidth / config.aspectRatio;
    
    return { width: Math.round(svgWidth), height: Math.round(svgHeight) };
}

// Function to create SVG lattice grid
function createSVGLattice(svg, width, height) {
    const leftMargin = 35;
    const bottomMargin = 25;
    const topMargin = 10;
    const effectiveWidth = width - leftMargin;
    const effectiveHeight = height - bottomMargin - topMargin;
    
    const gridGroup = svg.append('g').attr('class', 'grid');
    
    // Vertical grid lines
    const gridSpacingX = effectiveWidth / 20;
    for (let i = 0; i <= 20; i++) {
        const x = leftMargin + (i * gridSpacingX);
        gridGroup.append('line')
            .attr('x1', x).attr('y1', topMargin)
            .attr('x2', x).attr('y2', height - bottomMargin)
            .attr('stroke', '#eee').attr('stroke-width', 0.5);
    }
    
    // Horizontal grid lines
    const gridSpacingY = effectiveHeight / 15;
    for (let i = 0; i <= 15; i++) {
        const y = topMargin + (i * gridSpacingY);
        gridGroup.append('line')
            .attr('x1', leftMargin).attr('y1', y)
            .attr('x2', width).attr('y2', y)
            .attr('stroke', '#eee').attr('stroke-width', 0.5);
    }
}

// Function to create SVG axes with tick marks and labels
function createSVGAxes(svg, width, height) {
    const leftMargin = 35;
    const bottomMargin = 25;
    const topMargin = 10;
    
    const axesGroup = svg.append('g').attr('class', 'axes');
    
    // X and Y axes
    axesGroup.append('line')
        .attr('x1', 0).attr('y1', height - bottomMargin)
        .attr('x2', width).attr('y2', height - bottomMargin)
        .attr('stroke', '#888').attr('stroke-width', 1.5);
        
    axesGroup.append('line')
        .attr('x1', leftMargin).attr('y1', topMargin)
        .attr('x2', leftMargin).attr('y2', height - bottomMargin)
        .attr('stroke', '#888').attr('stroke-width', 1.5);
}

// Function to draw SVG parabola and label intersections
function drawSVGParabola(svg, a, color, width, height) {
    const leftMargin = 35;
    const bottomMargin = 25;
    const topMargin = 10;
    const effectiveWidth = width - leftMargin;
    const effectiveHeight = height - bottomMargin - topMargin;
    
    const points = [];
    const intersections = [];
    
    // Draw the parabola
    const xMin = -50;
    const xMax = 50;
    for (let x = xMin; x <= xMax; x += 0.5) {
        const y = (x * x) / a;
        if (y >= 0 && y <= 100) {
            const px = leftMargin + (x - xMin) * (effectiveWidth / (xMax - xMin));
            const py = topMargin + effectiveHeight - y * (effectiveHeight / 100);
            points.push({ x: px, y: py, origX: x, origY: y });
        }
    }
    
    // Calculate intersections
    for (let x = -50; x <= 50; x++) {
        const y = (x * x) / a;
        if (Number.isInteger(y) && y >= 0 && y <= 100) {
            const px = leftMargin + (x - xMin) * (effectiveWidth / (xMax - xMin));
            const py = topMargin + effectiveHeight - y * (effectiveHeight / 100);
            intersections.push({ x: px, y: py, origX: x, origY: y });
        }
    }
    
    // Draw parabola curve
    if (points.length > 0) {
        const line = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveCardinal);
        
        svg.append('path')
            .datum(points)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2);
    }
    
    // Draw intersection points
    intersections.forEach(pt => {
        svg.append('circle')
            .attr('cx', pt.x)
            .attr('cy', pt.y)
            .attr('r', 3)
            .attr('fill', 'red');
            
        svg.append('text')
            .attr('x', pt.x + 5)
            .attr('y', pt.y - 5)
            .attr('fill', 'black')
            .attr('font-size', '8px')
            .text(`(${pt.origX}, ${pt.origY})`);
    });
    
    return { points, intersections };
}

// Function to create a card for each function
function displayFunctionCards(aValues, cardType = 'narrow', container = null) {
    const parent = container || document.getElementById('functionCards');
    const colors = ['blue', 'green', 'red', 'purple', 'orange'];
    
    if (!parent) {
        console.error('Parent container not found!');
        return;
    }
    
    aValues.forEach((a, idx) => {
        const card = document.createElement('div');
        card.className = `function-card ${cardType}`;
        
        const dimensions = calculateSVGDimensions(cardType, card);
        const svgWidth = dimensions.width;
        const svgHeight = dimensions.height;
        
        const svg = d3.select(card)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .style('background-color', '#fafafa')
            .style('border', '1px solid #ddd');
        
        // Draw elements
        createSVGLattice(svg, svgWidth, svgHeight);
        createSVGAxes(svg, svgWidth, svgHeight);
        const result = drawSVGParabola(svg, a, colors[idx % colors.length], svgWidth, svgHeight);
        
        // Add formula
        const formula = document.createElement('div');
        formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b>`;
        formula.style.textAlign = 'center';
        formula.style.marginTop = '5px';
        card.appendChild(formula);
        
        // Add intersection count
        const count = document.createElement('div');
        count.innerHTML = `${result.intersections.length} intersections`;
        count.style.textAlign = 'center';
        count.style.fontSize = '12px';
        count.style.color = '#666';
        card.appendChild(count);
        
        parent.appendChild(card);
    });
}

// Main function to initialize the application
function init() {
    console.log('Init function called');
    
    const functionCards = document.getElementById('functionCards');
    if (!functionCards) {
        console.error('functionCards element not found!');
        return;
    }
    
    functionCards.innerHTML = '';
    
    // Create narrow cards section
    const narrowHeader = document.createElement('h2');
    narrowHeader.textContent = 'Parabolas y = x²/a';
    functionCards.appendChild(narrowHeader);
    
    const narrowContainer = document.createElement('div');
    narrowContainer.id = 'narrowCards';
    narrowContainer.style.display = 'grid';
    narrowContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
    narrowContainer.style.gap = '20px';
    functionCards.appendChild(narrowContainer);
    
    // Test values
    const narrowValues = [1, 4, 9, 16, 25, 36, 49, 64];
    
    displayFunctionCards(narrowValues, 'narrow', narrowContainer);
    console.log('Finished rendering cards');
}

window.addEventListener('DOMContentLoaded', () => {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Test if D3.js is loaded
    if (typeof d3 === 'undefined') {
        console.error('D3.js is not loaded!');
        document.getElementById('functionCards').innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: D3.js library failed to load. Please refresh the page.</p>';
        return;
    }
    
    console.log('D3.js loaded, starting initialization...');
    init();
});