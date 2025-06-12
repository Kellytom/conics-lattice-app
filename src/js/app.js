// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js and Chart.js to visualize the grid lattice and the points on the parabola.

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('latticeChart'); // changed from 'canvas' to 'latticeChart'
    if (!canvas) {
        console.error('Canvas element with id "latticeChart" not found.');
        return;
    }
    // Set canvas size if not set in HTML
    if (!canvas.width) canvas.width = 800;
    if (!canvas.height) canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Function to draw the fractional integer lattice
    function drawLattice() {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        
        // Draw vertical lines
        for (let x = 0; x <= width; x += 20) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= height; y += 20) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
    }

    // Function to calculate points on the parabola
    function calculateParabola(a) {
        const points = [];
        for (let x = -width / 2; x <= width / 2; x++) {
            const y = (x * x) / a;
            if (y >= 0 && y <= height) {
                points.push({ x: x + width / 2, y: height - y });
            }
        }
        return points;
    }

    // Function to draw the parabola with a specific color
    function drawParabola(a, color) {
        const points = calculateParabola(a);
        if (points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Function to label a few key points and the parabola itself
    function labelParabola(a, color) {
        const points = calculateParabola(a);
        ctx.fillStyle = color;
        ctx.font = '14px Arial';
        // Label the vertex
        const vertex = { x: width / 2, y: height };
        ctx.fillText(`y = x² / ${a}`, vertex.x + 10, vertex.y - 10);
        // Label a few other points
        const sampleIndices = [Math.floor(points.length / 4), Math.floor(points.length / 2), Math.floor(3 * points.length / 4)];
        sampleIndices.forEach(i => {
            if (points[i]) {
                ctx.fillText(`(${(points[i].x - width / 2).toFixed(0)}, ${(height - points[i].y).toFixed(0)})`, points[i].x + 5, points[i].y - 5);
            }
        });
    }

    // Function to display formulas as separate cards
    function displayFormulas(aValues) {
        const functionCards = document.getElementById('functionCards');
        if (!functionCards) return;
        functionCards.innerHTML = '';
        aValues.forEach((a, idx) => {
            const card = document.createElement('div');
            card.className = 'function-card';
            card.style.border = '1px solid #ccc';
            card.style.borderRadius = '8px';
            card.style.padding = '12px';
            card.style.margin = '10px 0';
            card.style.background = '#f9f9f9';
            card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
            card.innerHTML = `<b style="color:${idx === 0 ? 'blue' : 'green'}">y = x² / ${a}</b>`;
            functionCards.appendChild(card);
        });
    }

    // Main function to initialize the application
    function init() {
        drawLattice();
        const aValues = [64, 60];
        const colors = ['blue', 'green'];
        aValues.forEach((a, idx) => {
            drawParabola(a, colors[idx % colors.length]);
            labelParabola(a, colors[idx % colors.length]);
        });
        displayFormulas(aValues);
    }

    // Run the application
    init();
});