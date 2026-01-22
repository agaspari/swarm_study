/**
 * Chapter 2.1.2: Standard Bat Algorithm
 * 
 * Based on the echolocation behavior of bats.
 * Bats emit sound pulses and listen to echoes to detect prey.
 * 
 * Key parameters:
 * - Frequency (f): Controls step size
 * - Loudness (A): Decreases as bat approaches prey
 * - Pulse rate (r): Increases as bat approaches prey
 * 
 * Reference: Hassanien & Emary, "Swarm Intelligence: Principles, Advances, and Applications"
 */

import {
    BaseContinuous2DOptimizer,
    Continuous2DConfig,
    ContinuousSolution,
    Agent
} from '../../core';

/**
 * Bat-specific metadata stored in agent.metadata
 */
export interface BatMetadata {
    [key: string]: unknown;  // Index signature for Record compatibility
    frequency: number;
    loudness: number;
    pulseRate: number;
    initialPulseRate: number;  // Needed for pulse rate update formula
}

/**
 * Bat Algorithm configuration
 */
export interface BatConfig extends Continuous2DConfig {
    fMin: number;           // Minimum frequency
    fMax: number;           // Maximum frequency
    alpha: number;          // Loudness decrease rate (0 < α < 1)
    gamma: number;          // Pulse rate increase rate (γ > 0)
    initialLoudness: number;
    initialPulseRate: number;
}

/**
 * Standard Bat Algorithm (Section 2.1.2)
 * 
 * Now extends BaseContinuous2DOptimizer for framework compatibility.
 */
export class BatAlgorithm extends BaseContinuous2DOptimizer {
    protected batConfig: BatConfig;

    constructor(config: BatConfig) {
        super(config);
        this.batConfig = config;
        this.reset();
    }

    /**
     * Initialize population with bat-specific properties
     */
    protected initializePopulation(): void {
        const { populationSize, fMin, fMax, initialLoudness, initialPulseRate } = this.batConfig;

        this.population = [];

        for (let i = 0; i < populationSize; i++) {
            const position = this.randomPosition();
            const fitness = this.evaluate(position);

            const agent: Agent<ContinuousSolution> = {
                position,
                fitness,
                velocity: [0, 0],  // Bats start with zero velocity
                metadata: {
                    frequency: fMin + Math.random() * (fMax - fMin),
                    loudness: initialLoudness,
                    pulseRate: initialPulseRate,
                    initialPulseRate: initialPulseRate
                } as BatMetadata
            };

            this.population.push(agent);
        }

        // Find initial global best
        this.globalBest = this.cloneAgent(
            this.population.reduce((best, agent) =>
                agent.fitness < best.fitness ? agent : best
            )
        );
    }

    /**
     * Core Bat Algorithm update logic
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma } = this.batConfig;

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // Eq. 2: Update frequency
            // fi = fmin + (fmax - fmin) * beta, where beta ∈ [0, 1]
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            // Eq. 3: Update velocity
            // vi^t = vi^{t-1} + (xi^{t-1} - x*) * fi
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            // Eq. 4: Generate new solution
            // xi^t = xi^{t-1} + vi^t
            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // Eq. 5: Local search (if random > pulse rate)
            // x_new = x_old + epsilon * A^t
            if (Math.random() > meta.pulseRate) {
                // Random walk around current best
                const avgLoudness = this.getAverageLoudness();
                newPosition = [
                    this.globalBest.position[0] + avgLoudness * (Math.random() * 2 - 1),
                    this.globalBest.position[1] + avgLoudness * (Math.random() * 2 - 1)
                ];
            }

            // Boundary handling
            newPosition = this.clamp(newPosition);

            const newFitness = this.evaluate(newPosition);

            // Accept new solution?
            // If random < loudness AND new solution is better
            if (Math.random() < meta.loudness && newFitness < bat.fitness) {
                bat.position = newPosition;
                bat.fitness = newFitness;

                // Decrease loudness: A^{t+1} = alpha * A^t
                meta.loudness *= alpha;

                // Increase pulse rate: r^{t+1} = r^0 * (1 - exp(-gamma * t))
                meta.pulseRate = meta.initialPulseRate * (1 - Math.exp(-gamma * this.iteration));
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }

    /**
     * Calculate average loudness across population
     */
    protected getAverageLoudness(): number {
        let sum = 0;
        for (const bat of this.population) {
            sum += (bat.metadata as BatMetadata).loudness;
        }
        return sum / this.population.length;
    }
}

/**
 * Default Bat Algorithm configuration
 */
export function createDefaultBatConfig(
    objectiveFunction: (x: number, y: number) => number
): BatConfig {
    return {
        populationSize: 30,
        type: 'continuous',
        dimensions: 2,
        bounds: { min: -5.12, max: 5.12 },
        objectiveFunction,
        fMin: 0,
        fMax: 2,
        alpha: 0.9,
        gamma: 0.9,
        initialLoudness: 1.0,
        initialPulseRate: 0.5
    };
}
