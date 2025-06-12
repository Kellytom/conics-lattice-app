// This file contains the main JavaScript logic for the application. 
// It initializes the D3.js and Chart.js libraries, sets up the conic formulas, 
// and handles the rendering of the fractional integer lattice.

document.addEventListener("DOMContentLoaded", function() {
    const canvas = d3.select("#canvas");
    const width = 800;
    const height = 600;
    
    canvas.attr("width", width).attr("height", height);
    
    const context = canvas.node().getContext("2d");
    
    function drawGrid() {
        context.clearRect(0, 0, width, height);
        context.strokeStyle = "#e0e0e0";
        
        for (let x = 0; x <= width; x += 20) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        
        for (let y = 0; y <= height; y += 20) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    }
    
    function drawConic(a) {
        context.strokeStyle = "blue";
        context.beginPath();
        
        for (let x = -width / 2; x <= width / 2; x++) {
            const y = (x * x) / a;
            const scaledX = x + width / 2;
            const scaledY = height - (y + height / 2);
            context.lineTo(scaledX, scaledY);
        }
        
        context.stroke();
    }
    
    function drawLatticePoints(a) {
        context.fillStyle = "red";
        
        for (let x = -width / 2; x <= width / 2; x++) {
            const y = (x * x) / a;
            if (Number.isInteger(y)) {
                const scaledX = x + width / 2;
                const scaledY = height - (y + height / 2);
                context.beginPath();
                context.arc(scaledX, scaledY, 3, 0, 2 * Math.PI);
                context.fill();
                context.fillText(`(${x}, ${y})`, scaledX + 5, scaledY - 5);
            }
        }
    }
    
    function render(a) {
        drawGrid();
        drawConic(a);
        drawLatticePoints(a);
    }
    
    const a = 64; // Change this value to test different conics
    render(a);
});