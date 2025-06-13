// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js and Chart.js to visualize the grid lattice and the points on the parabola.

window.addEventListener('DOMContentLoaded', () => {
    // Function to draw the lattice on a given context
    function drawLattice(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        for (let x = 0; x <= width; x += 20) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += 20) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
    }

    // Function to draw axes with tick marks but no labels
    function drawAxes(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        // X axis
        ctx.beginPath();
        ctx.moveTo(0, height - 20);
        ctx.lineTo(width, height - 20);
        ctx.stroke();
        // Y axis
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(20, height);
        ctx.stroke();
        // X label
        ctx.fillStyle = '#222';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('x', width - 20, height - 25);
        // Y label
        ctx.fillText('y', 25, 25);
        // Draw x-axis ticks (no labels)
        for (let x = 60; x < width; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, height - 18);
            ctx.lineTo(x, height - 22);
            ctx.stroke();
        }
        // Draw y-axis ticks (no labels)
        for (let y = height - 40; y > 0; y -= 60) {
            ctx.beginPath();
            ctx.moveTo(18, y);
            ctx.lineTo(22, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Robust lattice intersection calculation using math
    function calculateParabolaLatticeIntersections(a, width, height) {
        const points = [];
        const intersections = [];
        const seen = new Set();
        // Draw the parabola as before
        const xMin = -630;
        const xMax = 630;
        for (let x = xMin; x <= xMax; x += 0.5) {
            const y = (x * x) / a;
            if (y >= 0 && y <= height) {
                const px = x + width / 2;
                const py = height - y;
                points.push({ x: px, y: py, origX: x, origY: y });
            }
        }
        // Math-based lattice intersections
        const latticeStep = 20;
        const kMax = Math.floor(xMax / latticeStep);
        for (let k = -kMax; k <= kMax; k++) {
            const x = latticeStep * k;
            const m = (latticeStep * k * k) / a;
            if (Number.isInteger(m)) {
                const y = latticeStep * m;
                if (y >= 0 && y <= height) {
                    const px = x + width / 2;
                    const py = height - y;
                    const key = `${px},${py}`;
                    if (!seen.has(key)) {
                        intersections.push({ x: px, y: py, origX: x, origY: y });
                        seen.add(key);
                    }
                }
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
        const { points, intersections } = calculateParabolaLatticeIntersections(a, width, height, 0.5);
        if (points.length === 0) return;
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
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.font = '12px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(`(${Math.round(pt.origX)}, ${Math.round(pt.origY)})`, pt.x + 6, pt.y - 6);
        });
    }

    // Function to label the parabola (vertex only, no formula)
    function labelParabola(ctx, a, color, width, height) {
        // Optionally, you can label the vertex or skip this function entirely
        // ctx.fillStyle = color;
        // ctx.font = '14px Arial';
        // ctx.fillText('vertex', width / 2 + 10, height - 30);
    }

    // Function to create a card for each function
    function displayFunctionCards(aValues) {
        const functionCards = document.getElementById('functionCards');
        if (!functionCards) return;
        functionCards.innerHTML = '';
        const colors = ['blue', 'green'];
        aValues.forEach((a, idx) => {
            // Create card
            const card = document.createElement('div');
            card.className = 'function-card';
            // Create canvas with more vertical space and adjust y-scaling
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 600; // Substantially increased height
            canvas.style.display = 'block';
            canvas.style.marginBottom = '10px';
            card.appendChild(canvas);
            // Draw on canvas
            const ctx = canvas.getContext('2d');
            drawLattice(ctx, canvas.width, canvas.height);
            drawAxes(ctx, canvas.width, canvas.height);
            // Move the parabola up by 80px
            ctx.save();
            ctx.translate(0, -80); // Move up
            drawParabola(ctx, a, colors[idx % colors.length], canvas.width, canvas.height);
            ctx.restore();
            // Add formula and range below
            const { xMin, xMax } = calculateParabolaLatticeIntersections(a, canvas.width, canvas.height, 0.5);
            const formula = document.createElement('div');
            formula.innerHTML = `<b style="color:${colors[idx % colors.length]}">y = x² / ${a}</b><br><span style="color:#333;font-size:13px;">x range: [${Math.round(xMin)}, ${Math.round(xMax)}]</span>`;
            formula.style.textAlign = 'center';
            formula.style.marginTop = '10px';
            card.appendChild(formula);
            // Add card to container
            functionCards.appendChild(card);
        });
    }

    // Main function to initialize the application
    function init() {
        const aValues = [64, 60];
        displayFunctionCards(aValues);
    }

    // Run the application
    init();
});