/**
 * Chapter 3.1.2: Standard Artificial Fish Swarm Algorithm (AFSA)
 * 
 * Simulates fish behaviors for optimization:
 * - Preying: Search for food
 * - Swarming: Move towards center of swarm
 * - Following: Move towards best neighbor
 * - Random: Random movement when no behavior triggers
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
 * AFSA-specific metadata stored in agent.metadata
 */
export interface FishMetadata {
    // No additional metadata needed for standard AFSA
    // Future variants may add properties here
}

/**
 * AFSA configuration
 */
export interface AFSAConfig extends Continuous2DConfig {
    visual: number;     // Visual distance (perception range)
    step: number;       // Step size for movement
    delta: number;      // Crowding factor (0 < delta < 1)
    tryNumber: number;  // Max attempts in preying behavior
}

/**
 * Standard Artificial Fish Swarm Algorithm (Section 3.1.2)
 */
export class AFSAAlgorithm extends BaseContinuous2DOptimizer {
    protected afsaConfig: AFSAConfig;

    constructor(config: AFSAConfig) {
        super(config);
        this.afsaConfig = config;
        this.reset();
    }

    /**
     * Initialize population (fish)
     */
    protected initializePopulation(): void {
        this.population = [];

        for (let i = 0; i < this.config.populationSize; i++) {
            const position = this.randomPosition();
            const fitness = this.evaluate(position);

            this.population.push({ position, fitness });
        }

        // Find initial global best
        this.globalBest = this.cloneAgent(
            this.population.reduce((best, agent) =>
                agent.fitness < best.fitness ? agent : best
            )
        );
    }

    /**
     * Core AFSA update logic
     */
    protected updatePopulation(): void {
        const { visual, step, delta, tryNumber } = this.afsaConfig;
        const n = this.population.length;

        // Store new positions (synchronous update)
        const newPositions: { position: ContinuousSolution; fitness: number }[] = [];

        for (let i = 0; i < n; i++) {
            const fish = this.population[i];
            const neighbors = this.getNeighbors(fish, visual);
            const nf = neighbors.length;

            let newPosition: ContinuousSolution | null = null;

            // 1. SWARMING: Move towards center of neighbors
            if (nf > 0) {
                const center = this.getCenter(neighbors);
                const centerFitness = this.evaluate(center);

                // Check crowding condition and if center is better
                if (centerFitness < fish.fitness && (nf / n) < delta) {
                    newPosition = this.moveTowards(fish.position, center, step);
                }
            }

            // 2. FOLLOWING: Move towards best neighbor
            if (!newPosition && nf > 0) {
                const bestNeighbor = neighbors.reduce((best, neighbor) =>
                    neighbor.fitness < best.fitness ? neighbor : best
                );

                // Check crowding condition and if best neighbor is better
                if (bestNeighbor.fitness < fish.fitness && (nf / n) < delta) {
                    newPosition = this.moveTowards(fish.position, bestNeighbor.position, step);
                }
            }

            // 3. PREYING: Random search for better position
            if (!newPosition) {
                for (let j = 0; j < tryNumber; j++) {
                    const randomPos = this.randomInVisual(fish.position, visual);
                    const randomFitness = this.evaluate(randomPos);

                    if (randomFitness < fish.fitness) {
                        newPosition = this.moveTowards(fish.position, randomPos, step);
                        break;
                    }
                }
            }

            // 4. RANDOM: Move randomly if no behavior triggered
            if (!newPosition) {
                newPosition = this.randomStep(fish.position, step);
            }

            // Apply boundary constraints
            newPosition = this.clamp(newPosition);
            const newFitness = this.evaluate(newPosition);

            newPositions.push({ position: newPosition, fitness: newFitness });

            // Update global best
            if (newFitness < this.globalBest.fitness) {
                this.globalBest = { position: [...newPosition], fitness: newFitness };
            }
        }

        // Apply updates (synchronous)
        for (let i = 0; i < n; i++) {
            this.population[i].position = newPositions[i].position;
            this.population[i].fitness = newPositions[i].fitness;
        }
    }

    /**
     * Get neighbors within visual distance
     */
    private getNeighbors(fish: Agent<ContinuousSolution>, visual: number): Agent<ContinuousSolution>[] {
        return this.population.filter(other => {
            if (other === fish) return false;
            return this.distance(fish.position, other.position) <= visual;
        });
    }

    /**
     * Calculate center of a group
     */
    private getCenter(agents: Agent<ContinuousSolution>[]): ContinuousSolution {
        const n = agents.length;
        const center: ContinuousSolution = [0, 0];

        for (const agent of agents) {
            center[0] += agent.position[0];
            center[1] += agent.position[1];
        }

        return [center[0] / n, center[1] / n];
    }

    /**
     * Move towards a target position with given step size
     */
    private moveTowards(
        from: ContinuousSolution,
        to: ContinuousSolution,
        step: number
    ): ContinuousSolution {
        const dist = this.distance(from, to);
        if (dist === 0) return [...from];

        const ratio = (step * Math.random()) / dist;
        return [
            from[0] + ratio * (to[0] - from[0]),
            from[1] + ratio * (to[1] - from[1])
        ];
    }

    /**
     * Generate random position within visual range
     */
    private randomInVisual(center: ContinuousSolution, visual: number): ContinuousSolution {
        return [
            center[0] + (Math.random() * 2 - 1) * visual,
            center[1] + (Math.random() * 2 - 1) * visual
        ];
    }

    /**
     * Take a random step
     */
    private randomStep(from: ContinuousSolution, step: number): ContinuousSolution {
        return [
            from[0] + (Math.random() * 2 - 1) * step,
            from[1] + (Math.random() * 2 - 1) * step
        ];
    }
}

/**
 * Default AFSA configuration
 */
export function createDefaultAFSAConfig(
    objectiveFunction: (x: number, y: number) => number
): AFSAConfig {
    return {
        populationSize: 30,
        type: 'continuous',
        dimensions: 2,
        bounds: { min: -5.12, max: 5.12 },
        objectiveFunction,
        visual: 2.5,
        step: 0.3,
        delta: 0.618,
        tryNumber: 5
    };
}
