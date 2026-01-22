/**
 * Core Type Definitions for Swarm Intelligence Framework
 * 
 * This module defines the foundational types used across all algorithm families.
 */

// ============================================================================
// SOLUTION TYPES
// ============================================================================

/** Continuous optimization: real-valued vector */
export type ContinuousSolution = number[];

/** Discrete optimization: permutation (e.g., TSP tour) */
export type DiscreteSolution = number[];

/** Binary optimization: bit string (e.g., feature selection) */
export type BinarySolution = (0 | 1)[];

/** Union type for all solution representations */
export type Solution = ContinuousSolution | DiscreteSolution | BinarySolution;

/** Optimization type identifier */
export type OptimizationType = 'continuous' | 'discrete' | 'binary';

// ============================================================================
// OPTIMIZATION PROBLEM
// ============================================================================

/** Bounds for continuous optimization */
export interface Bounds {
    min: number;
    max: number;
}

/** Objective function signature */
export type ObjectiveFunction<T extends Solution = ContinuousSolution> = (solution: T) => number;

/** 2D objective function (convenience for visualization) */
export type ObjectiveFunction2D = (x: number, y: number) => number;

/** Problem definition */
export interface OptimizationProblem<T extends Solution = ContinuousSolution> {
    type: OptimizationType;
    dimensions: number;
    evaluate: ObjectiveFunction<T>;
    bounds?: Bounds;                     // For continuous
    domain?: T[];                        // For discrete (e.g., cities)
}

// ============================================================================
// AGENT (GENERIC POPULATION MEMBER)
// ============================================================================

/** Generic agent that can represent any swarm member */
export interface Agent<T extends Solution = ContinuousSolution> {
    /** Current position/solution */
    position: T;

    /** Current fitness value (lower is better for minimization) */
    fitness: number;

    /** Velocity vector (for velocity-based algorithms like PSO, BA) */
    velocity?: T;

    /** Personal best position (for memory-based algorithms like PSO) */
    personalBest?: T;

    /** Personal best fitness */
    personalBestFitness?: number;

    /** Algorithm-specific metadata */
    metadata?: Record<string, unknown>;
}

// ============================================================================
// ITERATION STATE (FOR HISTORY/VISUALIZATION)
// ============================================================================

/** Snapshot of optimizer state at a given iteration */
export interface IterationState<T extends Solution = ContinuousSolution> {
    iteration: number;
    agents: Agent<T>[];
    globalBest: T;
    globalBestFitness: number;

    /** Additional algorithm-specific data for visualization */
    extra?: Record<string, unknown>;
}

// ============================================================================
// OPTIMIZER CONFIGURATION
// ============================================================================

/** Base configuration shared by all optimizers */
export interface BaseOptimizerConfig {
    /** Population size */
    populationSize: number;

    /** Maximum iterations (optional, can run indefinitely) */
    maxIterations?: number;

    /** Optimization type */
    type: OptimizationType;

    /** Bounds for continuous optimization */
    bounds?: Bounds;

    /** Number of dimensions */
    dimensions: number;
}

/** Configuration for 2D continuous optimization (most common for visualization) */
export interface Continuous2DConfig extends BaseOptimizerConfig {
    type: 'continuous';
    dimensions: 2;
    bounds: Bounds;
    objectiveFunction: ObjectiveFunction2D;
}

// ============================================================================
// OPTIMIZER INTERFACE
// ============================================================================

/** Interface that all optimizers must implement */
export interface Optimizer<T extends Solution = ContinuousSolution> {
    /** Execute a single iteration */
    step(): void;

    /** Run for N iterations */
    run(iterations: number): void;

    /** Reset to initial state */
    reset(): void;

    /** Get current iteration number */
    getIteration(): number;

    /** Get full optimization history */
    getHistory(): IterationState<T>[];

    /** Get current global best solution */
    getGlobalBest(): Agent<T>;
}

// ============================================================================
// MODIFIER TYPES (FOR COMPOSABLE ENHANCEMENTS)
// ============================================================================

/** Supported chaos map types */
export type ChaosMapType = 'logistic' | 'tent' | 'sinusoidal' | 'circle' | 'gauss';

/** Adaptive parameter schedule types */
export type AdaptiveScheduleType = 'linear' | 'exponential' | 'cosine' | 'step';

/** Adaptive parameter configuration */
export interface AdaptiveSchedule {
    type: AdaptiveScheduleType;
    startValue: number;
    endValue: number;
    /** For step schedule: iteration to switch */
    switchAt?: number;
}

// ============================================================================
// REGISTRY TYPES
// ============================================================================

/** Hyperparameter definition for tunable algorithm parameters */
export interface HyperparameterDef {
    key: string;          // Parameter key (e.g., 'fMin', 'alpha')
    name: string;         // Display name (e.g., 'Min Frequency')
    description: string;  // Tooltip description
    min: number;          // Minimum value
    max: number;          // Maximum value
    step: number;         // Step increment
    defaultValue: number; // Default value
}

/** Algorithm variant definition for the registry */
export interface AlgorithmDefinition {
    id: string;
    name: string;
    section: string;
    description: string;
    details: string;
    optimizationType: OptimizationType;
    agentName: string;
    objectiveName: string;
    hyperparameters?: HyperparameterDef[];  // Tunable parameters
    create: (config: Continuous2DConfig, hyperparams?: Record<string, number>) => Optimizer;
}

/** Chapter group in the registry */
export interface ChapterGroup {
    id: string;
    name: string;
    variants: AlgorithmDefinition[];
    hybridizations?: AlgorithmDefinition[];
}

