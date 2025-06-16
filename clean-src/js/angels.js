// Angels Project - Interactive Mathematical Art
window.addEventListener('DOMContentLoaded', () => {
    const svg = d3.select('#angelCanvas');
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Control elements
    const angleSlider = document.getElementById('angleSlider');
    const radiusSlider = document.getElementById('radiusSlider');
    const symmetrySlider = document.getElementById('symmetrySlider');
    const animateBtn = document.getElementById('animateBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Value display elements
    const angleValue = document.getElementById('angleValue');
    const radiusValue = document.getElementById('radiusValue');
    const symmetryValue = document.getElementById('symmetryValue');
    const totalPoints = document.getElementById('totalPoints');
    const symmetryInfo = document.getElementById('symmetryInfo');
    const angleSum = document.getElementById('angleSum');

    let animationRunning = false;
    let animationId = null;

    // Update value displays
    function updateDisplays() {
        angleValue.textContent = angleSlider.value + '°';
        radiusValue.textContent = radiusSlider.value;
        symmetryValue.textContent = symmetrySlider.value;
        symmetryInfo.textContent = `Symmetry: ${symmetrySlider.value}-fold`;
        angleSum.textContent = `Angle Sum: ${parseInt(symmetrySlider.value) * parseInt(angleSlider.value)}°`;
    }

    // Create angel wing path
    function createWingPath(angle, radius, wingAngle) {
        const wingData = [];
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const currentAngle = angle + (wingAngle * t);
            const currentRadius = radius * (1 - 0.3 * t) * (1 + 0.2 * Math.sin(t * Math.PI * 3));
            
            const x = centerX + currentRadius * Math.cos(currentAngle * Math.PI / 180);
            const y = centerY + currentRadius * Math.sin(currentAngle * Math.PI / 180);
            
            wingData.push([x, y]);
        }
        
        return wingData;
    }

    // Create halo (circular pattern)
    function createHalo(radius) {
        const haloData = [];
        const steps = 100;
        
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * 2 * Math.PI;
            const haloRadius = radius * 0.3;
            const x = centerX + haloRadius * Math.cos(angle);
            const y = centerY + haloRadius * Math.sin(angle);
            haloData.push([x, y]);
        }
        
        return haloData;
    }

    // Draw the complete angel pattern
    function drawAngelPattern() {
        const angle = parseInt(angleSlider.value);
        const radius = parseInt(radiusSlider.value);
        const symmetry = parseInt(symmetrySlider.value);
        const wingAngle = angle / 2;

        // Clear previous drawings
        svg.selectAll('*').remove();

        // Create gradient definitions
        const defs = svg.append('defs');
        
        const wingGradient = defs.append('linearGradient')
            .attr('id', 'wingGradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%');
        
        wingGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#667eea')
            .attr('stop-opacity', 0.8);
        
        wingGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#764ba2')
            .attr('stop-opacity', 0.4);

        const haloGradient = defs.append('radialGradient')
            .attr('id', 'haloGradient')
            .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
        
        haloGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ffd700')
            .attr('stop-opacity', 0.8);
        
        haloGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ff6b6b')
            .attr('stop-opacity', 0.2);

        // Draw background circles for depth
        const backgroundGroup = svg.append('g').attr('class', 'background');
        for (let i = 3; i >= 1; i--) {
            backgroundGroup.append('circle')
                .attr('cx', centerX)
                .attr('cy', centerY)
                .attr('r', radius * 0.2 * i)
                .attr('fill', 'none')
                .attr('stroke', '#e1e5e9')
                .attr('stroke-width', 1)
                .attr('opacity', 0.3);
        }

        // Draw halo
        const haloData = createHalo(radius);
        const haloLine = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveCardinalClosed);

        svg.append('path')
            .datum(haloData)
            .attr('class', 'angel-halo')
            .attr('d', haloLine)
            .attr('fill', 'url(#haloGradient)')
            .attr('stroke', '#ffd700')
            .attr('stroke-width', 2)
            .attr('opacity', 0.6);

        // Draw wings with symmetry
        const wingsGroup = svg.append('g').attr('class', 'wings');
        let pointCount = 0;

        for (let i = 0; i < symmetry; i++) {
            const rotationAngle = (360 / symmetry) * i;
            
            // Left wing
            const leftWingData = createWingPath(rotationAngle - wingAngle, radius, wingAngle);
            // Right wing
            const rightWingData = createWingPath(rotationAngle + wingAngle, radius, -wingAngle);
            
            const wingLine = d3.line()
                .x(d => d[0])
                .y(d => d[1])
                .curve(d3.curveCardinal);

            // Draw left wing
            wingsGroup.append('path')
                .datum(leftWingData)
                .attr('class', 'angel-wing')
                .attr('d', wingLine)
                .attr('fill', 'url(#wingGradient)')
                .attr('stroke', '#667eea')
                .attr('stroke-width', 1.5)
                .attr('opacity', 0.7);

            // Draw right wing
            wingsGroup.append('path')
                .datum(rightWingData)
                .attr('class', 'angel-wing')
                .attr('d', wingLine)
                .attr('fill', 'url(#wingGradient)')
                .attr('stroke', '#667eea')
                .attr('stroke-width', 1.5)
                .attr('opacity', 0.7);

            pointCount += leftWingData.length + rightWingData.length;
        }

        // Draw center point (angel body)
        svg.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', 8)
            .attr('fill', '#ffd700')
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 2)
            .attr('filter', 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))');

        // Update info
        totalPoints.textContent = `Points: ${pointCount}`;
        updateDisplays();
    }

    // Animation function
    function animate() {
        if (!animationRunning) return;
        
        const currentAngle = parseInt(angleSlider.value);
        const newAngle = (currentAngle + 2) % 360;
        angleSlider.value = newAngle;
        
        drawAngelPattern();
        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    angleSlider.addEventListener('input', drawAngelPattern);
    radiusSlider.addEventListener('input', drawAngelPattern);
    symmetrySlider.addEventListener('input', drawAngelPattern);

    animateBtn.addEventListener('click', () => {
        animationRunning = !animationRunning;
        if (animationRunning) {
            animateBtn.textContent = '⏸️ Pause';
            animate();
        } else {
            animateBtn.textContent = '🎭 Animate';
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        animationRunning = false;
        animateBtn.textContent = '🎭 Animate';
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        angleSlider.value = 60;
        radiusSlider.value = 100;
        symmetrySlider.value = 6;
        drawAngelPattern();
    });

    // Initialize
    drawAngelPattern();
});
