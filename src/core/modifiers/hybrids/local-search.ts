/**
 * Local Search Methods
 * 
 * Provides local search operators for hybridization.
 * Includes: Powell's method, Nelder-Mead Simplex, Gradient Descent
 */

import { ContinuousSolution, ObjectiveFunction } from '../../types';

// ============================================================================
// POWELL'S METHOD (Derivative-Free Line Search)
// ============================================================================

/**
 * Powell's configuration
 */
export interface PowellConfig {
    /** Maximum line search iterations */
    maxLineIterations: number;
    /** Convergence tolerance */
    tolerance: number;
    /** Step size for line search */
    stepSize: number;
}

export const defaultPowellConfig: PowellConfig = {
    maxLineIterations: 20,
    tolerance: 1e-6,
    stepSize: 0.1
};

/**
 * 1D line search using golden section
 * 
 * @param func - Objective function
 * @param start - Starting point
 * @param direction - Search direction
 * @param config - Powell configuration
 * @returns Optimized point along the line
 */
export function lineSearch(
    func: ObjectiveFunction<ContinuousSolution>,
    start: ContinuousSolution,
    direction: ContinuousSolution,
    config: PowellConfig = defaultPowellConfig
): ContinuousSolution {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let a = -config.stepSize;
    let b = config.stepSize;

    // Golden section search
    let c = b - (b - a) / phi;
    let d = a + (b - a) / phi;

    const evalPoint = (t: number) => {
        const point = start.map((x, i) => x + t * direction[i]);
        return func(point);
    };

    for (let i = 0; i < config.maxLineIterations; i++) {
        if (Math.abs(b - a) < config.tolerance) break;

        if (evalPoint(c) < evalPoint(d)) {
            b = d;
        } else {
            a = c;
        }

        c = b - (b - a) / phi;
        d = a + (b - a) / phi;
    }

    const t = (a + b) / 2;
    return start.map((x, i) => x + t * direction[i]);
}

/**
 * Single Powell iteration
 * Searches along each coordinate direction
 * 
 * @param func - Objective function
 * @param position - Current position
 * @param config - Powell configuration
 * @returns Improved position
 */
export function powellStep(
    func: ObjectiveFunction<ContinuousSolution>,
    position: ContinuousSolution,
    config: PowellConfig = defaultPowellConfig
): ContinuousSolution {
    const dim = position.length;
    let current = [...position];

    // Search along each coordinate direction
    for (let i = 0; i < dim; i++) {
        const direction = new Array(dim).fill(0);
        direction[i] = 1;
        current = lineSearch(func, current, direction, config);
    }

    return current;
}

// ============================================================================
// GRADIENT DESCENT (Numerical Gradient)
// ============================================================================

/**
 * Gradient descent configuration
 */
export interface GradientConfig {
    /** Learning rate */
    learningRate: number;
    /** Step size for numerical gradient */
    epsilon: number;
}

export const defaultGradientConfig: GradientConfig = {
    learningRate: 0.01,
    epsilon: 1e-6
};

/**
 * Compute numerical gradient
 * 
 * @param func - Objective function
 * @param position - Point to evaluate gradient at
 * @param epsilon - Step size for finite difference
 * @returns Gradient vector
 */
export function numericalGradient(
    func: ObjectiveFunction<ContinuousSolution>,
    position: ContinuousSolution,
    epsilon: number = 1e-6
): ContinuousSolution {
    const dim = position.length;
    const gradient: ContinuousSolution = [];

    for (let i = 0; i < dim; i++) {
        const posPlus = [...position];
        const posMinus = [...position];
        posPlus[i] += epsilon;
        posMinus[i] -= epsilon;

        gradient[i] = (func(posPlus) - func(posMinus)) / (2 * epsilon);
    }

    return gradient;
}

/**
 * Single gradient descent step
 * 
 * @param func - Objective function
 * @param position - Current position
 * @param config - Gradient configuration
 * @returns New position after gradient step
 */
export function gradientStep(
    func: ObjectiveFunction<ContinuousSolution>,
    position: ContinuousSolution,
    config: GradientConfig = defaultGradientConfig
): ContinuousSolution {
    const gradient = numericalGradient(func, position, config.epsilon);

    return position.map((x, i) => x - config.learningRate * gradient[i]);
}

// ============================================================================
// RANDOM WALK / PERTURBATION
// ============================================================================

/**
 * Generate a random perturbation
 * 
 * @param position - Current position
 * @param magnitude - Perturbation magnitude
 * @returns Perturbed position
 */
export function randomPerturbation(
    position: ContinuousSolution,
    magnitude: number
): ContinuousSolution {
    return position.map(x => x + (Math.random() * 2 - 1) * magnitude);
}

/**
 * Gaussian perturbation
 * 
 * @param position - Current position
 * @param sigma - Standard deviation
 * @returns Perturbed position
 */
export function gaussianPerturbation(
    position: ContinuousSolution,
    sigma: number
): ContinuousSolution {
    return position.map(x => {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return x + z * sigma;
    });
}
