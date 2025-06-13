// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js to visualize the grid lattice and the points on the parabola with crisp SVG graphics.

window.addEventListener('DOMContentLoaded', () => {
    // Add delay to ensure D3.js is fully loaded and DOM is ready
    setTimeout(() => {
        // Test if D3.js is loaded
        try {
            console.log('D3 version:', d3.version);
            if (!d3) {
                throw new Error('D3.js is not available');
            }
        } catch (error) {
            console.error('D3.js is not loaded!', error);
            document.getElementById('functionCards').innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error: D3.js library failed to load. Please refresh the page.</p>';
            return;
        }
        
        console.log('Starting application initialization...');
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Initialize the application
        try {
            init();
        } catch (error) {
            console.error('Error initializing application:', error);
            document.getElementById('functionCards').innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error initializing application. Check console for details.</p>';
        }
    }, 1000); // 1 second delay to ensure everything is loaded
    
    // Function to calculate optimal SVG dimensions based on card type and available space
    function calculateSVGDimensions(cardType, containerElement = null) {
        // Base configuration for different card types
        const configs = {
            narrow: {
                // Account for card padding, formula text, table space, etc.
                paddingAndContent: 120, // 15px padding * 2 + formula + count + table space
                aspectRatio: 1.25, // width:height ratio (5:4)
                maxWidth: 600,
                minWidth: 350,
                maxHeight: 480,
                minHeight: 280
            },
            wide: {
                paddingAndContent: 140, // More space for wider layout
                aspectRatio: 2.0, // width:height ratio (2:1)
                maxWidth: 1000,
                minWidth: 600,
                maxHeight: 500,
                minHeight: 300
            }
        };
        
        const config = configs[cardType] || configs.narrow;
        
        // Try to get actual container dimensions if available
        let availableWidth = config.maxWidth;
        let availableHeight = config.maxHeight;
        
        if (containerElement) {
            const containerRect = containerElement.getBoundingClientRect();
            availableWidth = Math.max(containerRect.width - 30, config.minWidth); // 30px for padding
        } else {
            // Estimate based on CSS and viewport
            const narrowCardContainer = document.querySelector('#narrowCards');
            if (narrowCardContainer && cardType === 'narrow') {
                const containerRect = narrowCardContainer.getBoundingClientRect();
                // Account for grid gap and 2-column layout
                availableWidth = Math.max((containerRect.width - 20) / 2 - 30, config.minWidth);
            }
        }
        
        // Calculate optimal dimensions
        let svgWidth = Math.min(availableWidth, config.maxWidth);
        svgWidth = Math.max(svgWidth, config.minWidth);
        
        // Calculate height based on aspect ratio
        let svgHeight = svgWidth / config.aspectRatio;
        
        // Ensure height constraints
        svgHeight = Math.min(svgHeight, config.maxHeight);
        svgHeight = Math.max(svgHeight, config.minHeight);
        
        // Adjust width if height was constrained
        if (svgHeight === config.maxHeight || svgHeight === config.minHeight) {
            svgWidth = svgHeight * config.aspectRatio;
        }
        
        // Round to avoid subpixel issues
        svgWidth = Math.round(svgWidth);
        svgHeight = Math.round(svgHeight);
        
        console.log(`SVG dimensions for ${cardType}: ${svgWidth}x${svgHeight} (available: ${availableWidth})`);
        
        return { width: svgWidth, height: svgHeight };
    }

    // Function to create SVG lattice grid
    function createSVGLattice(svg, width, height) {
        const leftMargin = 10;
        const bottomMargin = 10;
        const effectiveWidth = width - leftMargin;
        const effectiveHeight = height - bottomMargin;
        
        // Create grid group
        const gridGroup = svg.append('g').attr('class', 'grid');
        
        // Vertical grid lines
        const gridSpacingX = effectiveWidth / 20;
        for (let i = 0; i <= 20; i++) {
            const x = leftMargin + (i * gridSpacingX);
            gridGroup.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', effectiveHeight)
                .attr('stroke', '#eee')
                .attr('stroke-width', 0.5);
        }
        
        // Horizontal grid lines
        const gridSpacingY = effectiveHeight / 15;
        for (let i = 0; i <= 15; i++) {
            const y = i * gridSpacingY;
            gridGroup.append('line')
                .attr('x1', leftMargin)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', '#eee')
                .attr('stroke-width', 0.5);
        }
    }

    // Function to create SVG axes with tick marks and labels
    function createSVGAxes(svg, width, height) {
        const leftMargin = 10;
        const bottomMargin = 10;
        const effectiveWidth = width - leftMargin;
        const effectiveHeight = height - bottomMargin;
        
        const axesGroup = svg.append('g').attr('class', 'axes');
        
        // X axis
        axesGroup.append('line')
            .attr('x1', 0)
            .attr('y1', effectiveHeight)
            .attr('x2', width)
            .attr('y2', effectiveHeight)
            .attr('stroke', '#888')
            .attr('stroke-width', 1.5);
            
        // Y axis
        axesGroup.append('line')
            .attr('x1', leftMargin)
            .attr('y1', 0)
            .attr('x2', leftMargin)
            .attr('y2', height)
            .attr('stroke', '#888')
            .attr('stroke-width', 1.5);
        
        // Axis labels
        axesGroup.append('text')
            .attr('x', width - 15)
            .attr('y', effectiveHeight - 3)
            .attr('fill', '#222')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text('x');
            
        axesGroup.append('text')
            .attr('x', leftMargin + 3)
            .attr('y', 12)
            .attr('fill', '#222')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text('y');
        
        // X-axis ticks and labels
        const xTickSpacing = effectiveWidth / 12;
        for (let i = 1; i < 12; i++) {
            const x = leftMargin + (i * xTickSpacing);
            
            // Tick mark
            axesGroup.append('line')
                .attr('x1', x)
                .attr('y1', effectiveHeight - 2)
                .attr('x2', x)
                .attr('y2', effectiveHeight + 2)
                .attr('stroke', '#888')
                .attr('stroke-width', 1);
            
            // Label
            const xValue = Math.round(-630 + (i * 1260 / 12));
            axesGroup.append('text')
                .attr('x', x)
                .attr('y', height - 2)
                .attr('fill', '#222')
                .attr('font-size', '8px')
                .attr('text-anchor', 'middle')
                .text(xValue);
        }
        
        // Y-axis ticks and labels
        const yTickSpacing = effectiveHeight / 8;
        for (let i = 1; i < 8; i++) {
            const y = effectiveHeight - (i * yTickSpacing);
            
            // Tick mark
            axesGroup.append('line')
                .attr('x1', leftMargin - 2)
                .attr('y1', y)
                .attr('x2', leftMargin + 2)
                .attr('y2', y)
                .attr('stroke', '#888')
                .attr('stroke-width', 1);
            
            // Label
            const yValue = Math.round(i * 500 / 8);
            axesGroup.append('text')
                .attr('x', 8)
                .attr('y', y + 3)
                .attr('fill', '#222')
                .attr('font-size', '8px')
                .attr('text-anchor', 'end')
                .text(yValue);
        }
    }

    // SVG-based lattice intersection calculation
    function calculateParabolaLatticeIntersections(a, width, height) {
        const points = [];
        const intersections = [];
        
        // Reduced margins for better graph visibility
        const leftMargin = 10;
        const bottomMargin = 10;
        const effectiveWidth = width - leftMargin;
        const effectiveHeight = height - bottomMargin;
        
        // Draw the parabola with full x range
        const xMin = -630;
        const xMax = 630;
        for (let x = xMin; x <= xMax; x += 0.5) {
            const y = (x * x) / a;
            // Scale y to fit better in canvas, increased max y range for more intersections
            if (y >= 0 && y <= 500) {
                const px = leftMargin + (x * (effectiveWidth / (xMax - xMin)) + effectiveWidth / 2);
                const py = effectiveHeight - y * (effectiveHeight / 500);
                points.push({ x: px, y: py, origX: x, origY: y });
            }
        }
        
        // Mathematical formula for lattice intersections
        // For y = x²/a to have integer solutions, we need x² ≡ 0 (mod a)
        // This means x must be divisible by the square-free part of a
        
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
        const maxK = Math.floor(1000 / step);
        
        for (let k = -maxK; k <= maxK; k++) {
            const x = k * step;
            const y = (x * x) / a;
            if (Number.isInteger(x) && Number.isInteger(y) && y >= 0 && y <= 500) {
                const px = leftMargin + (x * (effectiveWidth / (xMax - xMin)) + effectiveWidth / 2);
                const py = effectiveHeight - y * (effectiveHeight / 500);
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

    // Function to label the parabola (vertex only, no formula)
    function labelParabola(ctx, a, color, width, height) {
        // Optionally, you can label the vertex or skip this function entirely
        // ctx.fillStyle = color;
        // ctx.font = '14px Arial';
        // ctx.fillText('vertex', width / 2 + 10, height - 30);
    }

    // Main function to initialize the application
    function init() {
        console.log('Init function called');
        
        // Create containers for narrow and wide cards
        const functionCards = document.getElementById('functionCards');
        if (!functionCards) {
            console.error('functionCards element not found!');
            return;
        }
        
        functionCards.innerHTML = '';
        console.log('Cleared functionCards');
        
        // Narrow cards section
        const narrowHeader = document.createElement('h2');
        narrowHeader.textContent = 'Narrow Cards (2x2 Grid) - Perfect Squares 1² to 25²';
        functionCards.appendChild(narrowHeader);
        const narrowContainer = document.createElement('div');
        narrowContainer.id = 'narrowCards';
        functionCards.appendChild(narrowContainer);
        console.log('Created narrow section');
        
        // Wide cards section
        const wideHeader = document.createElement('h2');
        wideHeader.textContent = 'Wide Cards (Full Width) - Perfect Squares 32² to 56²';
        wideHeader.style.marginTop = '40px';
        functionCards.appendChild(wideHeader);
        const wideContainer = document.createElement('div');
        wideContainer.id = 'wideCards';
        functionCards.appendChild(wideContainer);
        console.log('Created wide section');
        
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
        // Render into separate containers
        console.log('About to render narrow cards, values:', narrowValues.length);
        displayFunctionCards(narrowValues, 'narrow', narrowContainer);
        console.log('About to render wide cards, values:', wideValues.length);
        displayFunctionCards(wideValues, 'wide', wideContainer);
        console.log('Finished rendering all cards');
    }

    // Function to create a card for each function
    function displayFunctionCards(aValues, cardType = 'narrow', container = null) {
        console.log(`displayFunctionCards called with ${aValues.length} values for ${cardType} cards`);
        
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
                card.style.display = 'block';
                
                // Calculate optimal SVG dimensions dynamically
                const dimensions = calculateSVGDimensions('narrow', card);
                const svgWidth = dimensions.width;
                const svgHeight = dimensions.height;
                const svg = d3.select(card)
                    .append('svg')
                    .attr('width', svgWidth)
                    .attr('height', svgHeight)
                    .style('width', '100%')
                    .style('height', 'auto')
                    .style('display', 'block')
                    .style('margin-bottom', '10px')
                    .style('background-color', '#fafafa')
                    .style('border', '1px solid #ddd')
                    .style('border-radius', '4px');
                
                // Draw SVG elements with error handling
                let intersections = [];
                try {
                    console.log('Creating lattice for narrow card', idx, 'with a =', a);
                    createSVGLattice(svg, svgWidth, svgHeight);
                    createSVGAxes(svg, svgWidth, svgHeight);
                    const result = drawSVGParabola(svg, a, colors[idx % colors.length], svgWidth, svgHeight);
                    intersections = result.intersections || [];
                    console.log('Narrow card created with', intersections.length, 'intersections');
                } catch (error) {
                    console.error('Error creating narrow SVG elements:', error);
                    svg.append('rect')
                        .attr('x', 10).attr('y', 10).attr('width', svgWidth - 20).attr('height', svgHeight - 20)
                        .attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 2);
                }
                
                // Add formula and info with improved font sizes
                const formula = document.createElement('div');
                formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:10px;">√a = ${Math.sqrt(a) % 1 === 0 ? Math.sqrt(a) : Math.sqrt(a).toFixed(2)}</span>`;
                formula.style.textAlign = 'center';
                formula.style.marginTop = '5px';
                formula.style.fontSize = '11px'; // Slightly reduced from 12px
                card.appendChild(formula);
                
                // Add intersection count with improved styling
                const count = document.createElement('div');
                count.innerHTML = `<span style="color:#666;font-size:9px;">${intersections.length} intersections</span>`;
                count.style.textAlign = 'center';
                count.style.marginTop = '2px';
                card.appendChild(count);
                
                // Add intersection table for narrow cards (vertical with scrollbar)
                if (intersections.length > 0) {
                    const tableContainer = document.createElement('div');
                    tableContainer.className = 'narrow-table-container';
                    
                    let tableHtml = '<table><tr><th>x</th><th>y</th></tr>';
                    intersections.slice(0, 50).forEach(pt => { // Show up to 50 intersections
                        tableHtml += `<tr><td>${pt.origX}</td><td>${pt.origY}</td></tr>`;
                    });
                    if (intersections.length > 50) {
                        tableHtml += '<tr><td colspan="2">...</td></tr>';
                    }
                    tableHtml += '</table>';
                    tableContainer.innerHTML = tableHtml;
                    card.appendChild(tableContainer);
                }
                
            } else if (cardType === 'wide') {
                card.style.display = 'block';
                card.style.margin = '20px 0';
                card.style.width = '100%';
                
                // Calculate optimal SVG dimensions dynamically
                const dimensions = calculateSVGDimensions('wide', card);
                const svgWidth = dimensions.width;
                const svgHeight = dimensions.height;
                const svg = d3.select(card)
                    .append('svg')
                    .attr('width', svgWidth)
                    .attr('height', svgHeight)
                    .style('width', '100%')
                    .style('height', 'auto')
                    .style('display', 'block')
                    .style('margin-bottom', '10px')
                    .style('background-color', '#fafafa')
                    .style('border', '1px solid #ddd')
                    .style('border-radius', '4px');
                
                // Draw SVG elements with error handling
                let intersections = [];
                try {
                    console.log('Creating lattice for wide card', idx, 'with a =', a);
                    createSVGLattice(svg, svgWidth, svgHeight);
                    createSVGAxes(svg, svgWidth, svgHeight);
                    const result = drawSVGParabola(svg, a, colors[idx % colors.length], svgWidth, svgHeight);
                    intersections = result.intersections || [];
                    console.log('Wide card created with', intersections.length, 'intersections');
                } catch (error) {
                    console.error('Error creating wide SVG elements:', error);
                    svg.append('rect')
                        .attr('x', 10).attr('y', 10).attr('width', svgWidth - 20).attr('height', svgHeight - 20)
                        .attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 2);
                }
                
                // Add formula and range with improved typography
                const formula = document.createElement('div');
                formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:12px;">√a = ${Math.sqrt(a) % 1 === 0 ? Math.sqrt(a) : Math.sqrt(a).toFixed(2)} | x range: [-1000, 1000]</span>`;
                formula.style.textAlign = 'center';
                formula.style.marginTop = '10px';
                formula.style.fontSize = '14px'; // Slightly reduced from default
                card.appendChild(formula);
                
                // Add intersection values table
                const tableContainer = document.createElement('div');
                tableContainer.className = 'wide-table-container';
                
                let tableHtml = '<b>Lattice Intersections:</b><br><table>';
                tableHtml += '<tr><th>x</th>';
                intersections.slice(0, 30).forEach(pt => { // Show up to 30 for wide tables
                    tableHtml += `<td>${pt.origX}</td>`;
                });
                if (intersections.length > 30) tableHtml += '<td>...</td>';
                tableHtml += '</tr><tr><th>y</th>';
                intersections.slice(0, 30).forEach(pt => {
                    tableHtml += `<td>${pt.origY}</td>`;
                });
                if (intersections.length > 30) tableHtml += '<td>...</td>';
                tableHtml += `</tr></table><div style="text-align:center; margin-top:5px; color:#666;">Total: ${intersections.length} intersections</div>`;
                tableContainer.innerHTML = tableHtml;
                card.appendChild(tableContainer);
            }
            
            // Add card to container
            parent.appendChild(card);
        });
    }

    // Function to handle responsive SVG resizing
    function handleResize() {
        // Debounce resize events to avoid excessive recalculation
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            console.log('Handling window resize - recalculating SVG dimensions');
            
            // Re-initialize if the viewport has changed significantly
            const currentViewportWidth = window.innerWidth;
            if (Math.abs(currentViewportWidth - (window.lastViewportWidth || 0)) > 100) {
                window.lastViewportWidth = currentViewportWidth;
                
                // Find all existing SVGs and update their dimensions
                const narrowCards = document.querySelectorAll('.function-card.narrow svg');
                const wideCards = document.querySelectorAll('.function-card.wide svg');
                
                narrowCards.forEach((svg, index) => {
                    const card = svg.closest('.function-card.narrow');
                    const dimensions = calculateSVGDimensions('narrow', card);
                    svg.setAttribute('width', dimensions.width);
                    svg.setAttribute('height', dimensions.height);
                    svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
                });
                
                wideCards.forEach((svg, index) => {
                    const card = svg.closest('.function-card.wide');
                    const dimensions = calculateSVGDimensions('wide', card);
                    svg.setAttribute('width', dimensions.width);
                    svg.setAttribute('height', dimensions.height);
                    svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
                });
            }
        }, 250); // 250ms debounce
    }

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Function to create SVG lattice grid
});