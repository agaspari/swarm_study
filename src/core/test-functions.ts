/**
 * Standard Test Functions for Optimization
 * 
 * Common benchmark functions used to test optimization algorithms.
 * All functions are for minimization; global minimum is at origin (0,0,...).
 */

import { ObjectiveFunction2D, ContinuousSolution, ObjectiveFunction } from './types';

// Re-export types for convenience
export type { ObjectiveFunction2D } from './types';

// ============================================================================
// 2D TEST FUNCTIONS (For Visualization)
// ============================================================================

/**
 * Rastrigin Function
 * 
 * Highly multimodal with many local minima.
 * Global minimum: f(0,0) = 0
 * Typical bounds: [-5.12, 5.12]
 */
export const rastrigin2D: ObjectiveFunction2D = (x, y) => {
    const A = 10;
    return A * 2 + (x * x - A * Math.cos(2 * Math.PI * x))
        + (y * y - A * Math.cos(2 * Math.PI * y));
};

/**
 * Sphere Function
 * 
 * Simple convex function, easy for most algorithms.
 * Global minimum: f(0,0) = 0
 * Typical bounds: [-5.12, 5.12]
 */
export const sphere2D: ObjectiveFunction2D = (x, y) => {
    return x * x + y * y;
};

/**
 * Rosenbrock Function
 * 
 * Has a narrow, curved valley. Difficult to converge.
 * Global minimum: f(1,1) = 0
 * Typical bounds: [-5, 10]
 */
export const rosenbrock2D: ObjectiveFunction2D = (x, y) => {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
};

/**
 * Ackley Function
 * 
 * Has many local minima with a deep global minimum.
 * Global minimum: f(0,0) = 0
 * Typical bounds: [-5, 5]
 */
export const ackley2D: ObjectiveFunction2D = (x, y) => {
    const a = 20;
    const b = 0.2;
    const c = 2 * Math.PI;
    const sum1 = x * x + y * y;
    const sum2 = Math.cos(c * x) + Math.cos(c * y);
    return -a * Math.exp(-b * Math.sqrt(sum1 / 2)) - Math.exp(sum2 / 2) + a + Math.E;
};

/**
 * Griewank Function
 * 
 * Many regularly distributed local minima.
 * Global minimum: f(0,0) = 0
 * Typical bounds: [-600, 600]
 */
export const griewank2D: ObjectiveFunction2D = (x, y) => {
    const sum = (x * x + y * y) / 4000;
    const prod = Math.cos(x / 1) * Math.cos(y / Math.sqrt(2));
    return sum - prod + 1;
};

/**
 * Schwefel Function
 * 
 * Complex function with many local optima.
 * Global minimum: f(420.9687, 420.9687) ≈ 0
 * Typical bounds: [-500, 500]
 */
export const schwefel2D: ObjectiveFunction2D = (x, y) => {
    const d = 2;
    const sum = x * Math.sin(Math.sqrt(Math.abs(x))) + y * Math.sin(Math.sqrt(Math.abs(y)));
    return 418.9829 * d - sum;
};

/**
 * Michalewicz Function
 * 
 * Has steep ridges and drops.
 * Global minimum depends on dimensions.
 * Typical bounds: [0, π]
 */
export const michalewicz2D: ObjectiveFunction2D = (x, y) => {
    const m = 10; // Steepness parameter
    return -(Math.sin(x) * Math.pow(Math.sin((1 * x * x) / Math.PI), 2 * m)
        + Math.sin(y) * Math.pow(Math.sin((2 * y * y) / Math.PI), 2 * m));
};

// ============================================================================
// N-DIMENSIONAL TEST FUNCTIONS
// ============================================================================

/**
 * N-dimensional Rastrigin
 */
export const rastriginND: ObjectiveFunction<ContinuousSolution> = (x) => {
    const A = 10;
    const n = x.length;
    let sum = A * n;
    for (let i = 0; i < n; i++) {
        sum += x[i] * x[i] - A * Math.cos(2 * Math.PI * x[i]);
    }
    return sum;
};

/**
 * N-dimensional Sphere
 */
export const sphereND: ObjectiveFunction<ContinuousSolution> = (x) => {
    return x.reduce((sum, xi) => sum + xi * xi, 0);
};

/**
 * N-dimensional Ackley
 */
export const ackleyND: ObjectiveFunction<ContinuousSolution> = (x) => {
    const a = 20;
    const b = 0.2;
    const c = 2 * Math.PI;
    const n = x.length;
    const sum1 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sum2 = x.reduce((sum, xi) => sum + Math.cos(c * xi), 0);
    return -a * Math.exp(-b * Math.sqrt(sum1 / n)) - Math.exp(sum2 / n) + a + Math.E;
};

// ============================================================================
// TEST FUNCTION REGISTRY
// ============================================================================

export interface TestFunctionInfo {
    name: string;
    func2D: ObjectiveFunction2D;
    funcND?: ObjectiveFunction<ContinuousSolution>;
    bounds: { min: number; max: number };
    globalMinimum: { x: number[]; f: number };
    description: string;
}

export const testFunctions: Record<string, TestFunctionInfo> = {
    rastrigin: {
        name: 'Rastrigin',
        func2D: rastrigin2D,
        funcND: rastriginND,
        bounds: { min: -5.12, max: 5.12 },
        globalMinimum: { x: [0, 0], f: 0 },
        description: 'Highly multimodal with many local minima'
    },
    sphere: {
        name: 'Sphere',
        func2D: sphere2D,
        funcND: sphereND,
        bounds: { min: -5.12, max: 5.12 },
        globalMinimum: { x: [0, 0], f: 0 },
        description: 'Simple convex function, easy for most algorithms'
    },
    rosenbrock: {
        name: 'Rosenbrock',
        func2D: rosenbrock2D,
        funcND: undefined,
        bounds: { min: -5, max: 10 },
        globalMinimum: { x: [1, 1], f: 0 },
        description: 'Narrow curved valley, difficult to converge'
    },
    ackley: {
        name: 'Ackley',
        func2D: ackley2D,
        funcND: ackleyND,
        bounds: { min: -5, max: 5 },
        globalMinimum: { x: [0, 0], f: 0 },
        description: 'Many local minima with deep global minimum'
    },
    griewank: {
        name: 'Griewank',
        func2D: griewank2D,
        funcND: undefined,
        bounds: { min: -600, max: 600 },
        globalMinimum: { x: [0, 0], f: 0 },
        description: 'Many regularly distributed local minima'
    },
    schwefel: {
        name: 'Schwefel',
        func2D: schwefel2D,
        funcND: undefined,
        bounds: { min: -500, max: 500 },
        globalMinimum: { x: [420.9687, 420.9687], f: 0 },
        description: 'Complex function with deceptive local optima'
    }
};
