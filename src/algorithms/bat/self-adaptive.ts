/**
 * Chapter 2.2.6: Self-Adaptive Bat Algorithm
 * 
 * Parameters automatically adjust based on search progress.
 * No need for manual parameter tuning.
 * 
 * Key features:
 * - Frequency bounds adapt based on convergence
 * - Loudness and pulse rate use self-adaptive formulas
 * 
 * Reference: Hassanien & Emary, Section 2.2.6
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Extended config with max iterations for progress calculation
 */
export interface SelfAdaptiveBatConfig extends BatConfig {
    maxIterations: number;
}

/**
 * Self-Adaptive Bat Algorithm (Section 2.2.6)
 */
export class SelfAdaptiveBatAlgorithm extends BatAlgorithm {
    private selfAdaptiveConfig: SelfAdaptiveBatConfig;

    constructor(config: SelfAdaptiveBatConfig) {
        super(config);
        this.selfAdaptiveConfig = config;
    }

    /**
     * Self-adaptive frequency: changes based on iteration progress
     */
    private adaptiveFrequency(): number {
        const progress = this.getIteration() / this.selfAdaptiveConfig.maxIterations;
        // Start with high frequency (exploration), decrease for exploitation
        return 2 * (1 - progress) + 0.1;
    }

    /**
     * Self-adaptive loudness based on progress
     */
    private adaptiveLoudness(currentLoudness: number): number {
        const progress = this.getIteration() / this.selfAdaptiveConfig.maxIterations;
        return currentLoudness * (1 - progress * 0.9);
    }

    /**
     * Self-adaptive pulse rate based on iteration
     */
    private adaptivePulseRate(): number {
        const progress = this.getIteration() / this.selfAdaptiveConfig.maxIterations;
        const iteration = this.getIteration();
        return 0.9 * progress * (1 - Math.exp(-0.1 * iteration));
    }

    /**
     * Override updatePopulation with self-adaptive parameters
     */
    protected updatePopulation(): void {
        const adaptFreq = this.adaptiveFrequency();
        const adaptPulse = this.adaptivePulseRate();

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // Self-adaptive frequency
            meta.frequency = adaptFreq * (0.5 + Math.random());

            // Velocity update
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // Adaptive local search
            if (Math.random() > adaptPulse) {
                const adaptLoud = this.adaptiveLoudness(meta.loudness);
                newPosition = [
                    this.globalBest.position[0] + adaptLoud * (Math.random() * 2 - 1),
                    this.globalBest.position[1] + adaptLoud * (Math.random() * 2 - 1)
                ];
            }

            // Boundary handling
            newPosition = this.clamp(newPosition);
            const newFitness = this.evaluate(newPosition);

            // Adaptive acceptance
            const adaptLoud = this.adaptiveLoudness(meta.loudness);
            if (Math.random() < adaptLoud && newFitness < bat.fitness) {
                bat.position = newPosition;
                bat.fitness = newFitness;
                meta.loudness = adaptLoud;
                meta.pulseRate = adaptPulse;
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }
}
