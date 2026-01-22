/**
 * Chapter 2.3.1: Bat with Differential Evolution (BA+DE)
 * 
 * Hybrid combining BA's echolocation with DE's mutation operators.
 * DE mutation enhances exploration.
 * 
 * Reference: Hassanien & Emary, Section 2.3.1
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { Agent, ContinuousSolution } from '../../core';

/**
 * Extended config with DE parameters
 */
export interface BADEConfig extends BatConfig {
    F: number;   // DE scaling factor
    CR: number;  // DE crossover rate
}

/**
 * BA + Differential Evolution (Section 2.3.1)
 */
export class BatDEHybrid extends BatAlgorithm {
    private deConfig: BADEConfig;

    constructor(config: BADEConfig) {
        super(config);
        this.deConfig = config;
    }

    /**
     * Select 3 random distinct agents (excluding index i)
     */
    private selectThree(excludeIdx: number): [Agent<ContinuousSolution>, Agent<ContinuousSolution>, Agent<ContinuousSolution>] {
        const indices: number[] = [];
        while (indices.length < 3) {
            const idx = Math.floor(Math.random() * this.population.length);
            if (idx !== excludeIdx && !indices.includes(idx)) {
                indices.push(idx);
            }
        }
        return [this.population[indices[0]], this.population[indices[1]], this.population[indices[2]]];
    }

    /**
     * Override updatePopulation with DE mutation operators
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma, F, CR } = this.deConfig;
        const iteration = this.getIteration();

        for (let i = 0; i < this.population.length; i++) {
            const bat = this.population[i];
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // BA frequency update
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            // DE mutation: v = x_r1 + F * (x_r2 - x_r3)
            const [r1, r2, r3] = this.selectThree(i);
            const mutantX = r1.position[0] + F * (r2.position[0] - r3.position[0]);
            const mutantY = r1.position[1] + F * (r2.position[1] - r3.position[1]);

            // DE crossover
            const trialX = Math.random() < CR ? mutantX : bat.position[0];
            const trialY = Math.random() < CR ? mutantY : bat.position[1];

            // BA velocity update (blended with DE trial)
            velocity[0] += (trialX - bat.position[0]) * meta.frequency;
            velocity[1] += (trialY - bat.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // BA local search
            if (Math.random() > meta.pulseRate) {
                const avgLoudness = this.getAverageLoudness();
                newPosition = [
                    this.globalBest.position[0] + avgLoudness * (Math.random() * 2 - 1),
                    this.globalBest.position[1] + avgLoudness * (Math.random() * 2 - 1)
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
