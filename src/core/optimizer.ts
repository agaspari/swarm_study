/**
 * Core Optimizer Interface
 * 
 * All algorithms implement this interface for unified visualization.
 */

/**
 * Represents a single agent (particle, bat, firefly, etc.)
 */
export interface Agent {
    x: number;
    y: number;
    vx?: number;
    vy?: number;
}

/**
 * Common state format for all optimization algorithms
 */
export interface OptimizationState {
    iteration: number;
    bestFitness: number;
    bestX: number;
    bestY: number;
    agents: Agent[];
}

/**
 * Objective function signature (2D continuous optimization)
 */
export type ObjectiveFunction = (x: number, y: number) => number;

/**
 * Standard test functions
 */
export const rastrigin: ObjectiveFunction = (x, y) => {
    const A = 10;
    return A * 2 + (x * x - A * Math.cos(2 * Math.PI * x))
        + (y * y - A * Math.cos(2 * Math.PI * y));
};

export const sphere: ObjectiveFunction = (x, y) => x * x + y * y;

export const rosenbrock: ObjectiveFunction = (x, y) => {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
};

/**
 * Base interface all optimizers must implement
 */
export interface Optimizer {
    /** Run the algorithm for N iterations */
    run(iterations: number): void;

    /** Execute a single iteration */
    step(): void;

    /** Reset to initial state */
    reset(): void;

    /** Get full optimization history */
    getHistory(): OptimizationState[];

    /** Get current iteration count */
    getIteration(): number;
}

/**
 * Configuration for optimizer construction
 */
export interface OptimizerConfig {
    populationSize: number;
    bounds: [number, number];
    func?: ObjectiveFunction;
}
