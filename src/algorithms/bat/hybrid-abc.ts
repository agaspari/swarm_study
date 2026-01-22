/**
 * Chapter 2.3.6: Bat with Artificial Bee Colony (BA+ABC)
 * 
 * Hybrid combining BA's echolocation with ABC's employed/onlooker
 * bee phases for enhanced exploitation.
 * 
 * Reference: Hassanien & Emary, Section 2.3.6
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { Agent, ContinuousSolution } from '../../core';

/**
 * Extended metadata with trial counter for ABC scout phase
 */
interface ABCBatMetadata extends BatMetadata {
    trial: number;
}

/**
 * Extended config with ABC parameters
 */
export interface BAABCConfig extends BatConfig {
    limit: number;  // Abandonment limit for scout phase
}

/**
 * BA + Artificial Bee Colony (Section 2.3.6)
 */
export class BatABCHybrid extends BatAlgorithm {
    private abcConfig: BAABCConfig;

    constructor(config: BAABCConfig) {
        super(config);
        this.abcConfig = config;
    }

    /**
     * Override initialization to add trial counter
     */
    protected initializePopulation(): void {
        super.initializePopulation();

        // Add trial counter to each agent's metadata
        for (const agent of this.population) {
            const meta = agent.metadata as ABCBatMetadata;
            meta.trial = 0;
        }
    }

    /**
     * ABC employed bee phase: search near a neighbor
     */
    private employedBeePhase(bat: Agent<ContinuousSolution>): ContinuousSolution {
        // Select random neighbor
        const k = Math.floor(Math.random() * this.population.length);
        const neighbor = this.population[k];

        // Generate new position
        const phi = Math.random() * 2 - 1;
        const newX = bat.position[0] + phi * (bat.position[0] - neighbor.position[0]);
        const newY = bat.position[1] + phi * (bat.position[1] - neighbor.position[1]);

        return this.clamp([newX, newY]);
    }

    /**
     * Override updatePopulation with ABC phases
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma, limit } = this.abcConfig;
        const iteration = this.getIteration();

        for (const bat of this.population) {
            const meta = bat.metadata as ABCBatMetadata;
            const velocity = bat.velocity!;

            // BA frequency update
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            // BA velocity update
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution;

            if (Math.random() > meta.pulseRate) {
                // Use ABC employed bee phase
                newPosition = this.employedBeePhase(bat);
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
                meta.trial = 0;
            } else {
                meta.trial++;
            }

            // Scout phase: abandon and reinitialize if stuck
            if (meta.trial > limit) {
                bat.position = this.randomPosition();
                bat.fitness = this.evaluate(bat.position);
                meta.trial = 0;
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }
}
