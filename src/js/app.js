// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js and Chart.js to visualize the grid lattice and the points on the parabola.

window.addEventListener('DOMContentLoaded', () => {
    // Function to draw the lattice on a given context
    function drawLattice(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        // Reduced margins for better graph visibility
        const leftMargin = 10;
        const bottomMargin = 10;
        
        ctx.beginPath();
        ctx.strokeStyle = '#eee'; // Lighter grid lines
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines (use fewer lines for cleaner look)
        const gridSpacingX = (width - leftMargin) / 20;
        for (let x = leftMargin; x <= width; x += gridSpacingX) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height - bottomMargin);
        }
        
        // Horizontal grid lines
        const gridSpacingY = (height - bottomMargin) / 15;
        for (let y = 0; y <= height - bottomMargin; y += gridSpacingY) {
            ctx.moveTo(leftMargin, y);
            ctx.lineTo(width, y);
        }
        
        ctx.stroke();
    }

    // Function to draw axes with tick marks and labels for full range
    function drawAxes(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        
        // Reduced margins for better graph visibility
        const leftMargin = 10;
        const bottomMargin = 10;
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(0, height - bottomMargin);
        ctx.lineTo(width, height - bottomMargin);
        ctx.stroke();
        // Y axis
        ctx.beginPath();
        ctx.moveTo(leftMargin, 0);
        ctx.lineTo(leftMargin, height);
        ctx.stroke();
        
        // Smaller axis labels
        ctx.fillStyle = '#222';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('x', width - 15, height - bottomMargin - 3);
        ctx.fillText('y', leftMargin + 3, 12);
        
        // Draw x-axis ticks and labels for full range
        ctx.font = '8px Arial';
        const xTickSpacing = width / 12;
        for (let i = 1; i < 12; i++) {
            const x = i * xTickSpacing;
            ctx.beginPath();
            ctx.moveTo(x, height - bottomMargin - 2);
            ctx.lineTo(x, height - bottomMargin + 2);
            ctx.stroke();
            const xValue = Math.round(-630 + (i * 1260 / 12));
            ctx.fillText(`${xValue}`, x - 10, height - 2);
        }
        
        // Draw y-axis ticks and labels for increased range
        const yTickSpacing = height / 8;
        for (let i = 1; i < 8; i++) {
            const y = height - (i * yTickSpacing);
            ctx.beginPath();
            ctx.moveTo(leftMargin - 2, y);
            ctx.lineTo(leftMargin + 2, y);
            ctx.stroke();
            const yValue = Math.round(i * 500 / 8);
            ctx.fillText(`${yValue}`, 1, y + 3);
        }
        ctx.restore();
    }

    // Efficient math-based lattice intersection calculation
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

    // Function to calculate points on the parabola
    function calculateParabola(a, width, height) {
        const points = [];
        for (let x = -width / 2; x <= width / 2; x++) {
            const y = (x * x) / a;
            if (y >= 0 && y <= height) {
                points.push({ x: x + width / 2, y: height - y });
            }
        }
        return points;
    }

    // Function to draw the parabola and label intersections
    function drawParabola(ctx, a, color, width, height) {
        const { points, intersections } = calculateParabolaLatticeIntersections(a, width, height);
        if (points.length === 0) return { points: [], intersections: [] };
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw smaller intersection points and labels
        intersections.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI); // Reduced from 5 to 2.5
            ctx.fillStyle = 'red';
            ctx.fill();
            
            // Smaller font for labels
            ctx.font = '8px Arial'; // Reduced from 12px to 8px
            ctx.fillStyle = 'black';
            
            const label = `(${Math.round(pt.origX)}, ${Math.round(pt.origY)})`;
            const labelWidth = ctx.measureText(label).width;
            
            // Position labels: negative x on left, positive x on right
            let labelX, labelY;
            if (pt.origX < 0) {
                // Negative x: position label to the left of the point
                labelX = pt.x - labelWidth - 5;
                labelY = pt.y - 4;
            } else {
                // Positive x: position label to the right of the point
                labelX = pt.x + 4;
                labelY = pt.y - 4;
            }
            
            ctx.fillText(label, labelX, labelY);
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
        // Create containers for narrow and wide cards
        const functionCards = document.getElementById('functionCards');
        functionCards.innerHTML = '';
        
        // Narrow cards section
        const narrowHeader = document.createElement('h2');
        narrowHeader.textContent = 'Narrow Cards (2x2 Grid) - Perfect Squares 1² to 25²';
        functionCards.appendChild(narrowHeader);
        const narrowContainer = document.createElement('div');
        narrowContainer.id = 'narrowCards';
        functionCards.appendChild(narrowContainer);
        
        // Wide cards section
        const wideHeader = document.createElement('h2');
        wideHeader.textContent = 'Wide Cards (Full Width) - Perfect Squares 32² to 56²';
        wideHeader.style.marginTop = '40px';
        functionCards.appendChild(wideHeader);
        const wideContainer = document.createElement('div');
        wideContainer.id = 'wideCards';
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
        // Render into separate containers
        displayFunctionCards(narrowValues, 'narrow', narrowContainer);
        displayFunctionCards(wideValues, 'wide', wideContainer);
    }

    // Function to create a card for each function
    function displayFunctionCards(aValues, cardType = 'narrow', container = null) {
        const parent = container || document.getElementById('functionCards');
        const colors = ['blue', 'green', 'red', 'purple', 'orange', 'brown', 'pink', 'gray', 'olive', 'navy'];
        
        aValues.forEach((a, idx) => {
            // Create card
            const card = document.createElement('div');
            card.className = `function-card ${cardType}`;
            
            if (cardType === 'narrow') {
                card.style.display = 'block';
                
                // Create smaller canvas for grid layout
                const canvas = document.createElement('canvas');
                canvas.width = 250;
                canvas.height = 200;
                canvas.style.display = 'block';
                canvas.style.marginBottom = '10px';
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
                card.appendChild(canvas);
                
                // Draw on canvas
                const ctx = canvas.getContext('2d');
                drawLattice(ctx, canvas.width, canvas.height);
                drawAxes(ctx, canvas.width, canvas.height);
                const { points, intersections } = drawParabola(ctx, a, colors[idx % colors.length], canvas.width, canvas.height);
                
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
                
                // Create full-width canvas
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 400;
                canvas.style.display = 'block';
                canvas.style.marginBottom = '10px';
                card.appendChild(canvas);
                
                // Draw on canvas
                const ctx = canvas.getContext('2d');
                drawLattice(ctx, canvas.width, canvas.height);
                drawAxes(ctx, canvas.width, canvas.height);
                const { points, intersections } = drawParabola(ctx, a, colors[idx % colors.length], canvas.width, canvas.height);
                
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

    // Run the application
    init();
});