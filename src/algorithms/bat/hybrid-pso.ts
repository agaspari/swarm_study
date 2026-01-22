/**
 * Chapter 2.3.2: Bat with Particle Swarm Optimization (BA+PSO)
 * 
 * Hybrid combining BA's echolocation with PSO's social learning.
 * Uses personal best and global best like PSO.
 * 
 * Reference: Hassanien & Emary, Section 2.3.2
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Extended metadata with PSO personal best
 */
interface PSOBatMetadata extends BatMetadata {
    pbestX: number;
    pbestY: number;
    pbestFitness: number;
}

/**
 * Extended config with PSO parameters
 */
export interface BAPSOConfig extends BatConfig {
    w: number;   // PSO inertia
    c1: number;  // Cognitive coefficient
    c2: number;  // Social coefficient
}

/**
 * BA + PSO Hybrid (Section 2.3.2)
 */
export class BatPSOHybrid extends BatAlgorithm {
    private psoConfig: BAPSOConfig;

    constructor(config: BAPSOConfig) {
        super(config);
        this.psoConfig = config;
    }

    /**
     * Override initialization to add personal best tracking
     */
    protected initializePopulation(): void {
        super.initializePopulation();

        // Add personal best to each agent's metadata
        for (const agent of this.population) {
            const meta = agent.metadata as PSOBatMetadata;
            meta.pbestX = agent.position[0];
            meta.pbestY = agent.position[1];
            meta.pbestFitness = agent.fitness;
        }
    }

    /**
     * Override updatePopulation with PSO velocity components
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma, w, c1, c2 } = this.psoConfig;
        const iteration = this.getIteration();

        for (const bat of this.population) {
            const meta = bat.metadata as PSOBatMetadata;
            const velocity = bat.velocity!;

            // BA frequency
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            const r1 = Math.random();
            const r2 = Math.random();

            // PSO-style velocity update
            velocity[0] = w * velocity[0]
                + c1 * r1 * (meta.pbestX - bat.position[0])
                + c2 * r2 * (this.globalBest.position[0] - bat.position[0]);
            velocity[1] = w * velocity[1]
                + c1 * r1 * (meta.pbestY - bat.position[1])
                + c2 * r2 * (this.globalBest.position[1] - bat.position[1]);

            // BA velocity component
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency * 0.5;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency * 0.5;

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

            // Update personal best
            if (bat.fitness < meta.pbestFitness) {
                meta.pbestX = bat.position[0];
                meta.pbestY = bat.position[1];
                meta.pbestFitness = bat.fitness;
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }
}
