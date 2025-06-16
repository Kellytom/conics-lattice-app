// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js to visualize the grid lattice and the points on the parabola with crisp SVG graphics.

// TODO: Parabolas are currently outside the view range and need to be corrected
// The current scaling and coordinate system needs adjustment to properly display the parabolas within the visible viewport

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
            maxWidth: 1200,
            minWidth: 800,
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
    const effectiveWidth = width - leftMargin;
    const effectiveHeight = height - bottomMargin - topMargin;
    
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

    // Axis labels
    axesGroup.append('text')
        .attr('x', width - 15)
        .attr('y', height - bottomMargin - 5)
        .attr('fill', '#222')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('x');
        
    axesGroup.append('text')
        .attr('x', leftMargin + 3)
        .attr('y', topMargin + 10)
        .attr('fill', '#222')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('y');

    // X-axis ticks and labels
    const xTickSpacing = effectiveWidth / 12;
    for (let i = 1; i < 12; i++) {
        const x = leftMargin + (i * xTickSpacing);
        
        // Tick mark
        axesGroup.append('line')
            .attr('x1', x)
            .attr('y1', height - bottomMargin - 2)
            .attr('x2', x)
            .attr('y2', height - bottomMargin + 2)
            .attr('stroke', '#888')
            .attr('stroke-width', 1);
        
        // Label
        const xValue = Math.round(-50 + (i * 100 / 12));
        axesGroup.append('text')
            .attr('x', x)
            .attr('y', height - bottomMargin + 15)
            .attr('fill', '#222')
            .attr('font-size', '8px')
            .attr('text-anchor', 'middle')
            .text(xValue);
    }
    
    // Y-axis ticks and labels
    const yTickSpacing = effectiveHeight / 8;
    for (let i = 1; i < 8; i++) {
        const y = topMargin + effectiveHeight - (i * yTickSpacing);
        
        // Tick mark
        axesGroup.append('line')
            .attr('x1', leftMargin - 2)
            .attr('y1', y)
            .attr('x2', leftMargin + 2)
            .attr('y2', y)
            .attr('stroke', '#888')
            .attr('stroke-width', 1);
        
        // Label
        const yValue = Math.round(i * 100 / 8);
        axesGroup.append('text')
            .attr('x', leftMargin - 8)
            .attr('y', y + 3)
            .attr('fill', '#222')
            .attr('font-size', '8px')
            .attr('text-anchor', 'end')
            .text(yValue);
    }
}

// SVG-based lattice intersection calculation with mathematical optimization
function calculateParabolaLatticeIntersections(a, width, height) {
    const points = [];
    const intersections = [];
    
    const leftMargin = 35;
    const bottomMargin = 25;
    const topMargin = 10;
    const effectiveWidth = width - leftMargin;
    const effectiveHeight = height - bottomMargin - topMargin;
    
    // Draw the parabola with full range
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
    
    // Mathematical formula for lattice intersections
    // For y = x²/a to have integer solutions, we need x² ≡ 0 (mod a)
    function getSquareFreePart(n) {
        let result = 1;
        for (let i = 2; i * i <= n; i++) {
            let count = 0;
            while (n % i === 0) {
                n /= i;
                count++;
            }
            if (count % 2 === 1) {
                result *= i;
            }
        }
        if (n > 1) result *= n;
        return result;
    }
    
    const step = Math.sqrt(a / getSquareFreePart(a));
    const maxK = Math.floor(100 / step);
    
    for (let k = -maxK; k <= maxK; k++) {
        const x = k * step;
        const y = (x * x) / a;
        if (Number.isInteger(x) && Number.isInteger(y) && y >= 0 && y <= 100) {
            const px = leftMargin + (x - xMin) * (effectiveWidth / (xMax - xMin));
            const py = topMargin + effectiveHeight - y * (effectiveHeight / 100);
            intersections.push({ x: px, y: py, origX: x, origY: y });
        }
    }
    return { points, intersections, xMin, xMax };
}

// Function to draw SVG parabola and label intersections
function drawSVGParabola(svg, a, color, width, height) {
    const { points, intersections } = calculateParabolaLatticeIntersections(a, width, height);
    if (points.length === 0) return { points: [], intersections: [] };
    
    // Create parabola path
    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCardinal);
    
    const parabolaGroup = svg.append('g').attr('class', 'parabola');
    
    // Draw parabola curve
    parabolaGroup.append('path')
        .datum(points)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round');
    
    // Draw intersection points and labels
    const intersectionGroup = svg.append('g').attr('class', 'intersections');
    
    intersections.forEach(pt => {
        // Draw red dot
        intersectionGroup.append('circle')
            .attr('cx', pt.x)
            .attr('cy', pt.y)
            .attr('r', 2.5)
            .attr('fill', 'red')
            .attr('stroke', 'darkred')
            .attr('stroke-width', 0.5);
        
        // Position labels: negative x values on left, positive on right
        const isNegative = pt.origX < 0;
        const labelX = isNegative ? pt.x - 4 : pt.x + 4;
        const textAnchor = isNegative ? 'end' : 'start';
        
        intersectionGroup.append('text')
            .attr('x', labelX)
            .attr('y', pt.y - 4)
            .attr('fill', 'black')
            .attr('font-size', '8px')
            .attr('font-family', 'Arial, sans-serif')
            .attr('text-anchor', textAnchor)
            .text(`(${Math.round(pt.origX)}, ${Math.round(pt.origY)})`);
    });
    
    return { points, intersections };
}

// Function to create a card for each function
function displayFunctionCards(aValues, cardType = 'narrow', container = null) {
    const parent = container || document.getElementById('functionCards');
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'brown', 'pink', 'gray', 'olive', 'navy'];
    
    if (!parent) {
        console.error('Parent container not found!');
        return;
    }
    
    aValues.forEach((a, idx) => {
        // Create card
        const card = document.createElement('div');
        card.className = `function-card ${cardType}`;
        
        if (cardType === 'narrow') {
            card.style.cssText = 'border: 1px solid #ddd; margin: 10px; padding: 10px; background: white; border-radius: 8px;';
        } else {
            card.style.cssText = 'border: 1px solid #ddd; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; width: 100%;';
        }
        
        const dimensions = calculateSVGDimensions(cardType, card);
        const svgWidth = dimensions.width;
        const svgHeight = dimensions.height;
        
        const svg = d3.select(card)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .style('width', '100%')
            .style('height', 'auto')
            .style('background-color', '#fafafa')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px');
        
        // Draw elements
        let intersections = [];
        try {
            createSVGLattice(svg, svgWidth, svgHeight);
            createSVGAxes(svg, svgWidth, svgHeight);
            const result = drawSVGParabola(svg, a, colors[idx % colors.length], svgWidth, svgHeight);
            intersections = result.intersections || [];
        } catch (error) {
            console.error('Error creating SVG elements:', error);
        }
        
        // Add formula and info
        const formula = document.createElement('div');
        formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:10px;">√a = ${Math.sqrt(a) % 1 === 0 ? Math.sqrt(a) : Math.sqrt(a).toFixed(2)}</span>`;
        formula.style.textAlign = 'center';
        formula.style.marginTop = '5px';
        formula.style.fontSize = '12px';
        card.appendChild(formula);
        
        // Add intersection count
        const count = document.createElement('div');
        count.innerHTML = `<span style="color:#666;font-size:10px;">${intersections.length} intersections</span>`;
        count.style.textAlign = 'center';
        count.style.marginTop = '2px';
        card.appendChild(count);
        
        // Add intersection table for narrow cards
        if (cardType === 'narrow' && intersections.length > 0) {
            const tableContainer = document.createElement('div');
            tableContainer.style.cssText = 'max-height: 100px; overflow-y: auto; margin-top: 10px; font-size: 8px;';
            
            let tableHtml = '<table style="width: 100%; border-collapse: collapse;"><tr><th style="border: 1px solid #ddd; padding: 2px;">x</th><th style="border: 1px solid #ddd; padding: 2px;">y</th></tr>';
            intersections.slice(0, 20).forEach(pt => {
                tableHtml += `<tr><td style="border: 1px solid #ddd; padding: 2px; text-align: center;">${pt.origX}</td><td style="border: 1px solid #ddd; padding: 2px; text-align: center;">${pt.origY}</td></tr>`;
            });
            if (intersections.length > 20) {
                tableHtml += '<tr><td colspan="2" style="text-align: center; font-style: italic;">...</td></tr>';
            }
            tableHtml += '</table>';
            tableContainer.innerHTML = tableHtml;
            card.appendChild(tableContainer);
        }
        
        // Add horizontal intersection table for wide cards
        if (cardType === 'wide' && intersections.length > 0) {
            const tableContainer = document.createElement('div');
            tableContainer.style.cssText = 'margin-top: 15px; font-size: 10px;';
            
            let tableHtml = '<b>Lattice Intersections:</b><br><table style="width: 100%; border-collapse: collapse; margin-top: 5px;">';
            tableHtml += '<tr><th style="border: 1px solid #ddd; padding: 4px;">x</th>';
            intersections.slice(0, 15).forEach(pt => {
                tableHtml += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${pt.origX}</td>`;
            });
            if (intersections.length > 15) tableHtml += '<td style="text-align: center;">...</td>';
            tableHtml += '</tr><tr><th style="border: 1px solid #ddd; padding: 4px;">y</th>';
            intersections.slice(0, 15).forEach(pt => {
                tableHtml += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${pt.origY}</td>`;
            });
            if (intersections.length > 15) tableHtml += '<td style="text-align: center;">...</td>';
            tableHtml += `</tr></table><div style="text-align:center; margin-top:5px; color:#666;">Total: ${intersections.length} intersections</div>`;
            tableContainer.innerHTML = tableHtml;
            card.appendChild(tableContainer);
        }
        
        parent.appendChild(card);
    });
}

// Main function to initialize the application
function init() {
    const functionCards = document.getElementById('functionCards');
    if (!functionCards) {
        console.error('functionCards element not found!');
        return;
    }
    
    functionCards.innerHTML = '';
    
    // Narrow cards section
    const narrowHeader = document.createElement('h2');
    narrowHeader.textContent = 'Narrow Cards (2x2 Grid) - Perfect Squares 1² to 25²';
    functionCards.appendChild(narrowHeader);
    
    const narrowContainer = document.createElement('div');
    narrowContainer.id = 'narrowCards';
    narrowContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 40px;';
    functionCards.appendChild(narrowContainer);
    
    // Wide cards section
    const wideHeader = document.createElement('h2');
    wideHeader.textContent = 'Wide Cards (Full Width) - Perfect Squares 32² to 56²';
    wideHeader.style.marginTop = '40px';
    functionCards.appendChild(wideHeader);
    
    const wideContainer = document.createElement('div');
    wideContainer.id = 'wideCards';
    wideContainer.style.cssText = 'display: block;';
    functionCards.appendChild(wideContainer);
    
    // Values
    const narrowValues = [
        1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 
        121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 
        441, 484, 529, 576, 625
    ];
    const wideValues = [
        1024, 1089, 1156, 1225, 1296, 1369, 1444, 1521, 1600, 1681,
        1764, 1849, 1936, 2025, 2116, 2209, 2304, 2401, 2500, 2601,
        2704, 2809, 2916, 3025, 3136
    ];
    
    // Render cards
    displayFunctionCards(narrowValues, 'narrow', narrowContainer);
    displayFunctionCards(wideValues, 'wide', wideContainer);
}

document.addEventListener('DOMContentLoaded', () => {
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