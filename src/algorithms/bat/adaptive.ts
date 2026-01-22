/**
 * Chapter 2.2.7: Adaptive Bat Algorithm
 * 
 * Dynamic parameter control based on population diversity
 * and search progress. Different from self-adaptive in that
 * it considers the entire population state.
 * 
 * Reference: Hassanien & Emary, Section 2.2.7
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Adaptive Bat Algorithm (Section 2.2.7)
 * 
 * Extends standard BA with diversity-based adaptive frequency control.
 */
export class AdaptiveBatAlgorithm extends BatAlgorithm {
    constructor(config: BatConfig) {
        super(config);
    }

    /**
     * Calculate population diversity (average distance from centroid)
     */
    private calculateDiversity(): number {
        const n = this.population.length;
        const meanX = this.population.reduce((s, a) => s + a.position[0], 0) / n;
        const meanY = this.population.reduce((s, a) => s + a.position[1], 0) / n;

        let diversity = 0;
        for (const agent of this.population) {
            diversity += Math.sqrt(
                (agent.position[0] - meanX) ** 2 +
                (agent.position[1] - meanY) ** 2
            );
        }

        return diversity / n;
    }

    /**
     * Adaptive frequency based on diversity
     * Low diversity -> higher frequency for exploration
     * High diversity -> lower frequency for exploitation
     */
    private adaptiveFrequency(diversity: number): number {
        const { fMin, fMax, bounds } = this.batConfig;
        const maxDiversity = (bounds.max - bounds.min) * Math.sqrt(2);
        const normalizedDiversity = diversity / maxDiversity;

        return fMin + (fMax - fMin) * (1 - normalizedDiversity);
    }

    /**
     * Override updatePopulation with adaptive frequency logic
     */
    protected updatePopulation(): void {
        const { fMax, alpha, gamma } = this.batConfig;
        const diversity = this.calculateDiversity();
        const adaptFreq = this.adaptiveFrequency(diversity);
        const maxDiversity = (this.bounds.max - this.bounds.min) * Math.sqrt(2);

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;
            const iteration = this.getIteration();

            // Adaptive frequency per bat (with some randomness)
            meta.frequency = adaptFreq * (0.8 + Math.random() * 0.4);

            // Velocity update
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // Adaptive local search with diversity-aware perturbation
            if (Math.random() > meta.pulseRate) {
                const perturbScale = Math.max(0.01, 0.1 * (1 - diversity / maxDiversity));
                const range = this.bounds.max - this.bounds.min;
                newPosition = [
                    this.globalBest.position[0] + perturbScale * range * (Math.random() * 2 - 1),
                    this.globalBest.position[1] + perturbScale * range * (Math.random() * 2 - 1)
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
