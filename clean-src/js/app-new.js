// Parabolas - High-resolution Canvas visualization for crisp graphics
window.addEventListener('DOMContentLoaded', () => {
    
    // Function to create high-resolution canvas for crisp graphics
    function createCrispCanvas(width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 2; // Force higher resolution
        
        // Set actual size in memory (scaled to account for pixel ratio)
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        
        // Scale the canvas back down using CSS
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.display = 'block';
        canvas.style.marginBottom = '10px';
        canvas.style.background = '#fafafa';
        canvas.style.border = '1px solid #ddd';
        canvas.style.borderRadius = '4px';
        
        // Scale the drawing context so everything draws at the correct size
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        return { canvas, ctx };
    }

    // Function to draw the lattice grid
    function drawLattice(ctx, width, height) {
        const leftMargin = 10;
        const bottomMargin = 10;
        const effectiveWidth = width - leftMargin;
        const effectiveHeight = height - bottomMargin;
        
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        const gridSpacingX = effectiveWidth / 20;
        for (let x = leftMargin; x <= width; x += gridSpacingX) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, effectiveHeight);
        }
        
        // Horizontal grid lines
        const gridSpacingY = effectiveHeight / 15;
        for (let y = 0; y <= effectiveHeight; y += gridSpacingY) {
            ctx.moveTo(leftMargin, y);
            ctx.lineTo(width, y);
        }
        
        ctx.stroke();
    }

    // Function to draw axes with tick marks and labels
    function drawAxes(ctx, width, height) {
        const leftMargin = 10;
        const bottomMargin = 10;
        
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(leftMargin, height - bottomMargin);
        ctx.lineTo(width, height - bottomMargin);
        ctx.stroke();
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(leftMargin, 0);
        ctx.lineTo(leftMargin, height - bottomMargin);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#222';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('x', width - 15, height - bottomMargin - 3);
        ctx.fillText('y', leftMargin + 3, 12);
        
        // Tick marks and labels
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
        
        const yTickSpacing = (height - bottomMargin) / 8;
        for (let i = 1; i < 8; i++) {
            const y = (height - bottomMargin) - (i * yTickSpacing);
            ctx.beginPath();
            ctx.moveTo(leftMargin - 2, y);
            ctx.lineTo(leftMargin + 2, y);
            ctx.stroke();
            const yValue = Math.round(i * 500 / 8);
            ctx.fillText(`${yValue}`, 1, y + 3);
        }
        ctx.restore();
    }

    // Calculate parabola points and lattice intersections
    function calculateParabolaData(a, width, height) {
        const points = [];
        const intersections = [];
        const leftMargin = 10;
        const bottomMargin = 10;
        const effectiveWidth = width - leftMargin;
        const effectiveHeight = height - bottomMargin;
        
        const xMin = -630;
        const xMax = 630;
        
        // Generate parabola points
        for (let x = xMin; x <= xMax; x += 0.5) {
            const y = (x * x) / a;
            if (y >= 0 && y <= 500) {
                const px = leftMargin + (x * (effectiveWidth / (xMax - xMin)) + effectiveWidth / 2);
                const py = effectiveHeight - y * (effectiveHeight / 500);
                points.push({ x: px, y: py, origX: x, origY: y });
            }
        }
        
        // Calculate lattice intersections mathematically
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
        
        return { points, intersections };
    }

    // Draw parabola and intersection points
    function drawParabola(ctx, a, color, width, height) {
        const { points, intersections } = calculateParabolaData(a, width, height);
        
        if (points.length === 0) return { points: [], intersections: [] };
        
        // Draw parabola curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw intersection points and labels
        intersections.forEach(pt => {
            // Draw red dot
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            
            // Position labels: negative x values on left, positive on right
            ctx.font = '8px Arial';
            ctx.fillStyle = 'black';
            const isNegative = pt.origX < 0;
            const labelX = isNegative ? pt.x - 4 : pt.x + 4;
            ctx.textAlign = isNegative ? 'end' : 'start';
            ctx.fillText(`(${Math.round(pt.origX)}, ${Math.round(pt.origY)})`, labelX, pt.y - 4);
            ctx.textAlign = 'start'; // Reset text align
        });
        
        return { points, intersections };
    }

    // Main initialization function
    function init() {
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
        
        // Render cards
        displayFunctionCards(narrowValues, 'narrow', narrowContainer);
        displayFunctionCards(wideValues, 'wide', wideContainer);
    }

    // Function to create function cards
    function displayFunctionCards(aValues, cardType = 'narrow', container = null) {
        const parent = container || document.getElementById('functionCards');
        const colors = ['blue', 'green', 'red', 'purple', 'orange', 'brown', 'pink', 'gray', 'olive', 'navy'];
        
        aValues.forEach((a, idx) => {
            const card = document.createElement('div');
            card.className = `function-card ${cardType}`;
            
            if (cardType === 'narrow') {
                // Create high-resolution canvas
                const { canvas, ctx } = createCrispCanvas(250, 200);
                card.appendChild(canvas);
                
                // Draw on canvas
                drawLattice(ctx, 250, 200);
                drawAxes(ctx, 250, 200);
                const { points, intersections } = drawParabola(ctx, a, colors[idx % colors.length], 250, 200);
                
                // Add formula and info
                const formula = document.createElement('div');
                formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:10px;">√a = ${Math.sqrt(a) % 1 === 0 ? Math.sqrt(a) : Math.sqrt(a).toFixed(2)}</span>`;
                formula.style.textAlign = 'center';
                formula.style.marginTop = '5px';
                formula.style.fontSize = '11px';
                card.appendChild(formula);
                
                // Add intersection count
                const count = document.createElement('div');
                count.innerHTML = `<span style="color:#666;font-size:9px;">${intersections.length} intersections</span>`;
                count.style.textAlign = 'center';
                count.style.marginTop = '2px';
                card.appendChild(count);
                
                // Add intersection table
                if (intersections.length > 0) {
                    const tableContainer = document.createElement('div');
                    tableContainer.className = 'narrow-table-container';
                    
                    let tableHtml = '<table><tr><th>x</th><th>y</th></tr>';
                    intersections.slice(0, 50).forEach(pt => {
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
                // Create larger high-resolution canvas
                const { canvas, ctx } = createCrispCanvas(800, 400);
                card.appendChild(canvas);
                
                // Draw on canvas
                drawLattice(ctx, 800, 400);
                drawAxes(ctx, 800, 400);
                const { points, intersections } = drawParabola(ctx, a, colors[idx % colors.length], 800, 400);
                
                // Add formula and range
                const formula = document.createElement('div');
                formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:12px;">√a = ${Math.sqrt(a) % 1 === 0 ? Math.sqrt(a) : Math.sqrt(a).toFixed(2)} | x range: [-1000, 1000]</span>`;
                formula.style.textAlign = 'center';
                formula.style.marginTop = '10px';
                formula.style.fontSize = '14px';
                card.appendChild(formula);
                
                // Add intersection values table
                const tableContainer = document.createElement('div');
                tableContainer.className = 'wide-table-container';
                
                let tableHtml = '<b>Lattice Intersections:</b><br><table>';
                tableHtml += '<tr><th>x</th>';
                intersections.slice(0, 30).forEach(pt => {
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
            
            parent.appendChild(card);
        });
    }

    // Run the application
    init();
});
