/**
 * Chaos Maps for Chaotic Optimization Variants
 * 
 * These functions replace Math.random() in chaotic variants,
 * providing deterministic but unpredictable sequences.
 */

import { ChaosMapType } from '../types';

/**
 * Chaos map function type
 */
type ChaosMapFunction = (x: number) => number;

/**
 * Available chaos maps
 */
export const chaosMaps: Record<ChaosMapType, ChaosMapFunction> = {
    /**
     * Logistic Map: x_{n+1} = 4 * x_n * (1 - x_n)
     * Most commonly used in chaotic optimization.
     */
    logistic: (x: number) => 4 * x * (1 - x),

    /**
     * Tent Map: Piecewise linear, tent-shaped
     */
    tent: (x: number) => x < 0.5 ? 2 * x : 2 * (1 - x),

    /**
     * Sinusoidal Map: x_{n+1} = sin(pi * x_n)
     */
    sinusoidal: (x: number) => Math.sin(Math.PI * x),

    /**
     * Circle Map (simplified): x_{n+1} = (x_n + 0.5 - (0.5/(2*pi)) * sin(2*pi*x_n)) mod 1
     */
    circle: (x: number) => {
        const result = x + 0.5 - (0.5 / (2 * Math.PI)) * Math.sin(2 * Math.PI * x);
        return result - Math.floor(result); // mod 1
    },

    /**
     * Gauss Map: x_{n+1} = 1 / x_n mod 1 (or 0 if x_n = 0)
     */
    gauss: (x: number) => {
        if (x === 0) return 0;
        const result = 1 / x;
        return result - Math.floor(result); // mod 1
    }
};

/**
 * Chaos sequence generator
 * Generates a sequence of chaotic values using the specified map.
 */
export class ChaosGenerator {
    private mapFn: ChaosMapFunction;
    private state: number;

    constructor(mapType: ChaosMapType, seed?: number) {
        this.mapFn = chaosMaps[mapType];
        // Initialize with seed or random value (avoiding 0, 0.25, 0.5, 0.75, 1 for logistic)
        this.state = seed ?? (0.1 + Math.random() * 0.8);
    }

    /** Get next chaotic value in [0, 1] */
    public next(): number {
        this.state = this.mapFn(this.state);
        return this.state;
    }

    /** Get next value scaled to [min, max] */
    public nextInRange(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    /** Reset with new seed */
    public reset(seed?: number): void {
        this.state = seed ?? (0.1 + Math.random() * 0.8);
    }

    /** Get current state */
    public getState(): number {
        return this.state;
    }
}

/**
 * Create a chaos-enhanced random function
 * Returns a function that behaves like Math.random() but uses chaos
 */
export function createChaoticRandom(mapType: ChaosMapType, seed?: number): () => number {
    const generator = new ChaosGenerator(mapType, seed);
    return () => generator.next();
}
