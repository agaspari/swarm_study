/**
 * Chapter 2.3.5: Bat with Harmony Search (BA+HS)
 * 
 * Hybrid combining BA's echolocation with HS's memory consideration
 * and pitch adjustment for enhanced solution generation.
 * 
 * Reference: Hassanien & Emary, Section 2.3.5
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Extended config with HS parameters
 */
export interface BAHSConfig extends BatConfig {
    hmcr: number;  // Harmony Memory Consideration Rate
    par: number;   // Pitch Adjustment Rate
    bw: number;    // Bandwidth
}

/**
 * BA + Harmony Search (Section 2.3.5)
 */
export class BatHarmonyHybrid extends BatAlgorithm {
    private hsConfig: BAHSConfig;

    constructor(config: BAHSConfig) {
        super(config);
        this.hsConfig = config;
    }

    /**
     * Generate new value using HS operators
     */
    private harmonyValue(dimension: 0 | 1): number {
        const { hmcr, par, bw } = this.hsConfig;

        let value: number;

        if (Math.random() < hmcr) {
            // Memory consideration: pick from existing population
            const idx = Math.floor(Math.random() * this.population.length);
            value = this.population[idx].position[dimension];

            // Pitch adjustment
            if (Math.random() < par) {
                value += (Math.random() * 2 - 1) * bw;
            }
        } else {
            // Random initialization
            const range = this.bounds.max - this.bounds.min;
            value = this.bounds.min + Math.random() * range;
        }

        return Math.max(this.bounds.min, Math.min(this.bounds.max, value));
    }

    /**
     * Override updatePopulation with HS operators
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma } = this.hsConfig;
        const iteration = this.getIteration();

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // BA frequency update
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            // BA velocity update
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution;

            // Use HS for solution generation
            if (Math.random() > meta.pulseRate) {
                newPosition = [
                    this.harmonyValue(0),
                    this.harmonyValue(1)
                ];
            } else {
                newPosition = [
                    bat.position[0] + velocity[0],
                    bat.position[1] + velocity[1]
                ];
            }

            // Boundary handling
            newPosition = this.clamp(newPosition);
            const newFitness = this.evaluate(newPosition);

            // Accept new solution
            if (Math.random() < meta.loudness && newFitness < bat.fitness) {
                bat.position = newPosition;
                bat.fitness = newFitness;
                meta.loudness *= alpha;
                meta.pulseRate = meta.initialPulseRate * (1 - Math.exp(-gamma * iteration));
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }
}
