/**
 * Chapter 2.3.4: Bat with Simulated Annealing (BA+SA)
 * 
 * Hybrid combining BA's echolocation with SA's temperature-based
 * acceptance criterion for escaping local optima.
 * 
 * Reference: Hassanien & Emary, Section 2.3.4
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Extended config with SA parameters
 */
export interface BASAConfig extends BatConfig {
    initialTemp: number;
    coolingRate: number;
}

/**
 * BA + Simulated Annealing (Section 2.3.4)
 */
export class BatSAHybrid extends BatAlgorithm {
    private saConfig: BASAConfig;
    private temperature: number;

    constructor(config: BASAConfig) {
        super(config);
        this.saConfig = config;
        // Initialize temperature after saConfig is set
        this.temperature = config.initialTemp;
    }

    /**
     * Reset including temperature
     */
    public reset(): void {
        super.reset();
        // saConfig may not be set during parent constructor call
        if (this.saConfig) {
            this.temperature = this.saConfig.initialTemp;
        }
    }

    /**
     * Override updatePopulation with SA acceptance criterion
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma, coolingRate } = this.saConfig;
        const iteration = this.getIteration();

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // BA frequency update
            meta.frequency = fMin + (fMax - fMin) * Math.random();

            // Velocity update
            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency;

            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // Local search
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
            const delta = newFitness - bat.fitness;

            // SA acceptance criterion: accept if better OR with probability exp(-delta/T)
            const acceptProb = delta < 0 ? 1 : Math.exp(-delta / this.temperature);

            if (Math.random() < acceptProb && Math.random() < meta.loudness) {
                bat.position = newPosition;
                bat.fitness = newFitness;
                meta.loudness *= alpha;
                meta.pulseRate = meta.initialPulseRate * (1 - Math.exp(-gamma * iteration));
            }

            // Update global best
            this.updateGlobalBest(bat);
        }

        // Cool down temperature
        this.temperature *= coolingRate;
    }
}
