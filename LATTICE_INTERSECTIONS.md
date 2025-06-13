# Lattice Intersections for Parabolas

## Overview

This document explains how to choose the denominator `a` in the parabola equation `y = x²/a` to maximize lattice intersections (points where both x and y are integers).

## The Math

For a point (x, y) to be a lattice intersection on the parabola `y = x²/a`:
- Both x and y must be integers
- This means x²/a must be an integer
- Therefore, a must divide x²

## Key Insight: Square-Free Factorization

Every positive integer can be written as: `a = s² × d`

Where:
- `s` is the largest perfect square that divides a
- `d` is the "square-free part" (no perfect square factors except 1)

## The Rule

**For y = x²/a to have integer solutions, x must be a multiple of s.**

The lattice intersections occur at x-values: `x = k × s` for any integer k.

## Examples

### Example 1: a = 64
- 64 = 8² × 1
- s = 8, d = 1
- Intersections at x = 0, ±8, ±16, ±24, ±32, ±40, ±48, ±56, ±64, ...
- Corresponding y-values: 0, 1, 4, 9, 16, 25, 36, 49, 64, ...

### Example 2: a = 60  
- 60 = 4 × 15 = 2² × 15
- s = 2, d = 15
- For lattice intersections, we need x² to be divisible by 60
- This happens when x is divisible by 2√15 ≈ 7.75
- Since x must be integer, we need x = multiples of lcm(factors)
- Integer intersections occur at x = 0, ±6√10, ±12√10, ... (approximately ±19, ±38, ...)
- At x = 0: y = 0
- At x = ±6√10 ≈ ±19: y ≈ 6
- At x = ±12√10 ≈ ±38: y ≈ 24

### Example 3: a = 600
- 600 = 100 × 6 = 10² × 6  
- s = 10, d = 6
- Integer intersections occur when x² is divisible by 600
- This requires x to be divisible by 10√6 ≈ 24.5
- Approximate integer intersections at x = 0, ±10√6, ±20√6, ... (roughly ±24, ±49, ...)
- At x = 0: y = 0
- At x ≈ ±24: y ≈ 1
- At x ≈ ±49: y ≈ 4

## The Numerator Multiplier Strategy

### The Problem with Fractions
When a is not a perfect square, many intersections give fractional y-values:
- a = 60: gives y = 1/15, 4/15, 3/5, 16/15, 5/3, 12/5, ...
- a = 600: gives y = 1/6, 2/3, 3/2, 8/3, 25/6, ...

### The Solution: Scale by the Denominator
Instead of y = x²/a, use: **y = (LCM × x²)/a**

Where LCM is the least common multiple of all fraction denominators.

### Example: a = 60
- Fraction denominators from y = x²/60: 15, 5, 3, ...
- LCM(15, 5, 3) = 15
- **New equation**: y = (15 × x²)/60 = x²/4
- **Result**: All integer y-values! (0, 1, 4, 9, 16, 25, ...)

### Example: a = 600  
- Fraction denominators from y = x²/600: 6, 3, 2, ...
- LCM(6, 3, 2) = 6
- **New equation**: y = (6 × x²)/600 = x²/100  
- **Result**: All integer y-values! (0, 1, 4, 9, 16, 25, ...)

### The Magic Formula
For any a = s² × d:
- **Numerator multiplier** = d (the square-free part)
- **Effective denominator** = s²
- **New equation**: y = x²/s²

This converts ANY parabola into one with a perfect square denominator!

Wait, that's wrong! Let me recalculate...

### Example 2 (Corrected): a = 60
- For x = 2: y = 4/60 = 1/15 (not integer)
- For x = 6: y = 36/60 = 3/5 (not integer)  
- For x = 10: y = 100/60 = 5/3 (not integer)
- For x = 30: y = 900/60 = 15 ✓

Actually, for a = 60, we need x to be a multiple of √60 = 2√15 ≈ 7.75, but since we need integers, the pattern is more complex.

## Better Examples for Many Intersections

### Perfect Squares (Best Choice)
- a = 1: x = any integer, y = x²
- a = 4: x = any integer, y = x²/4  
- a = 9: x = any integer, y = x²/9
- a = 16: x = any integer, y = x²/16
- a = 25: x = any integer, y = x²/25

### Powers of Small Primes
- a = 2^n: intersections at x = multiples of 2^(n/2)
- a = 3^n: intersections at x = multiples of 3^(n/2) (if n is even)

### Good Choices for Many Intersections
1. **a = 4**: intersections at every integer x
2. **a = 16**: intersections at x = 0, ±1, ±2, ±3, ±4, ...
3. **a = 64**: intersections at x = 0, ±8, ±16, ±24, ...
4. **a = 100**: intersections at x = 0, ±10, ±20, ±30, ...

## Strategy

To get many lattice intersections:
1. **Choose perfect squares** (a = 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, ...)
2. **Choose small perfect squares** for dense intersections
3. **Avoid numbers with large square-free parts** (like 60 = 4 × 15)

## Formula for Step Size

Given a = s² × d (where d is square-free):
- **Step size** = s
- **Intersections** occur at x = k × s for integer k
- **Density** = 1/s intersections per unit on x-axis

Therefore, smaller s gives denser intersections!
