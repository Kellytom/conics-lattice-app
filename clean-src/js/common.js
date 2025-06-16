// Common utilities for the Conics Explorer website

// Mathematical constants
const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    SQRT_2: Math.sqrt(2),
    SQRT_3: Math.sqrt(3)
};

// Color schemes for visualizations
const COLOR_SCHEMES = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    mathematical: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
    celestial: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#a8edea'],
    warm: ['#fa709a', '#fee140', '#ffecd2', '#fcb69f'],
    cool: ['#667eea', '#764ba2', '#a8edea', '#fed6e3']
};

// Utility functions
const MathUtils = {
    // Round to specified decimal places
    round: (num, decimals = 2) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    // Check if a number is an integer
    isInteger: (num) => {
        return Number.isInteger(num);
    },
    
    // Calculate distance between two points
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    // Convert degrees to radians
    toRadians: (degrees) => {
        return degrees * Math.PI / 180;
    },
    
    // Convert radians to degrees
    toDegrees: (radians) => {
        return radians * 180 / Math.PI;
    },
    
    // Generate range of numbers
    range: (start, end, step = 1) => {
        const result = [];
        for (let i = start; i <= end; i += step) {
            result.push(i);
        }
        return result;
    },
    
    // Linear interpolation
    lerp: (a, b, t) => {
        return a + (b - a) * t;
    }
};

// DOM utilities
const DOMUtils = {
    // Create element with attributes
    createElement: (tag, attributes = {}, textContent = '') => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    },
    
    // Add event listener with cleanup
    addEventListenerWithCleanup: (element, event, handler) => {
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
    },
    
    // Debounce function calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// D3.js utilities
const D3Utils = {
    // Create responsive SVG
    createResponsiveSVG: (container, width, height) => {
        return d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('width', '100%')
            .style('height', 'auto');
    },
    
    // Create scale with nice ticks
    createScale: (domain, range, type = 'linear') => {
        let scale;
        switch (type) {
            case 'log':
                scale = d3.scaleLog();
                break;
            case 'sqrt':
                scale = d3.scaleSqrt();
                break;
            default:
                scale = d3.scaleLinear();
        }
        return scale.domain(domain).range(range).nice();
    },
    
    // Add grid lines to SVG
    addGridLines: (svg, xScale, yScale, width, height) => {
        const gridGroup = svg.append('g').attr('class', 'grid');
        
        // Vertical grid lines
        gridGroup.selectAll('.grid-line-vertical')
            .data(xScale.ticks())
            .enter().append('line')
            .attr('class', 'grid-line-vertical')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', '#eee')
            .attr('stroke-width', 0.5);
        
        // Horizontal grid lines
        gridGroup.selectAll('.grid-line-horizontal')
            .data(yScale.ticks())
            .enter().append('line')
            .attr('class', 'grid-line-horizontal')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', '#eee')
            .attr('stroke-width', 0.5);
    }
};

// Animation utilities
const AnimationUtils = {
    // Smooth transition function
    easeInOutCubic: (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    
    // Animate value over time
    animateValue: (start, end, duration, callback, easing = AnimationUtils.easeInOutCubic) => {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            const currentValue = start + (end - start) * easedProgress;
            
            callback(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
};

// Lattice calculation utilities
const LatticeUtils = {
    // Find integer points within a given range
    getIntegerPoints: (xMin, xMax, yMin, yMax) => {
        const points = [];
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
            for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
                points.push({ x, y });
            }
        }
        return points;
    },
    
    // Check if a point satisfies a conic equation
    satisfiesConicEquation: (x, y, coefficients, tolerance = 0.001) => {
        const { A = 0, B = 0, C = 0, D = 0, E = 0, F = 0 } = coefficients;
        const result = A * x * x + B * x * y + C * y * y + D * x + E * y + F;
        return Math.abs(result) < tolerance;
    }
};

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MATH_CONSTANTS,
        COLOR_SCHEMES,
        MathUtils,
        DOMUtils,
        D3Utils,
        AnimationUtils,
        LatticeUtils
    };
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.ConicUtils = {
        MATH_CONSTANTS,
        COLOR_SCHEMES,
        MathUtils,
        DOMUtils,
        D3Utils,
        AnimationUtils,
        LatticeUtils
    };
}
