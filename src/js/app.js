// This file contains the main JavaScript code for the application. It generates the formulas for the conics, calculates the points that intersect the fractional integer lattice, and uses D3.js and Chart.js to visualize the grid lattice and the points on the parabola.

const canvas = document.getElementById('canvas');
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

// Function to draw the parabola
function drawParabola(a) {
    const points = calculateParabola(a);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

// Function to label points on the parabola
function labelPoints(a) {
    const points = calculateParabola(a);
    ctx.fillStyle = 'red';
    points.forEach(point => {
        ctx.fillText(`(${(point.x - width / 2).toFixed(1)}, ${(height - point.y).toFixed(1)})`, point.x, point.y);
    });
}

// Main function to initialize the application
function init() {
    drawLattice();
    const aValues = [64, 60]; // Example values for the conics
    aValues.forEach(a => {
        drawParabola(a);
        labelPoints(a);
    });
}

// Run the application
init();