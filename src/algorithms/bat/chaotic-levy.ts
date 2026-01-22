/**
 * Chapter 2.2.5: Chaotic Bat Algorithm with Lévy Distribution
 * 
 * Combines chaotic maps for exploration with Lévy flights for
 * heavy-tailed random walks. This enhances global search capability.
 * 
 * Key features:
 * - Chaos maps (logistic, tent, sine) for parameter tuning
 * - Lévy flights for long-range exploration
 * 
 * Reference: Hassanien & Emary, Section 2.2.5
 */

import { BatAlgorithm, BatConfig, BatMetadata } from './standard';
import { ContinuousSolution } from '../../core';

/**
 * Chaos map types
 */
type ChaosMap = 'logistic' | 'tent' | 'sine';

/**
 * Logistic map: x_{n+1} = μ * x_n * (1 - x_n)
 */
function logisticMap(x: number, mu: number = 4): number {
    return mu * x * (1 - x);
}

/**
 * Tent map
 */
function tentMap(x: number): number {
    return x < 0.5 ? 2 * x : 2 * (1 - x);
}

/**
 * Sine map
 */
function sineMap(x: number): number {
    return Math.sin(Math.PI * x);
}

/**
 * Get chaos value based on map type
 */
function getChaosValue(x: number, mapType: ChaosMap): number {
    switch (mapType) {
        case 'logistic': return logisticMap(x);
        case 'tent': return tentMap(x);
        case 'sine': return sineMap(x);
    }
}

/**
 * Lévy flight step using Mantegna's algorithm
 */
function levyFlight(beta: number = 1.5): number {
    const sigma = Math.pow(
        (gamma(1 + beta) * Math.sin(Math.PI * beta / 2)) /
        (gamma((1 + beta) / 2) * beta * Math.pow(2, (beta - 1) / 2)),
        1 / beta
    );

    const u = randomNormal() * sigma;
    const v = randomNormal();

    return u / Math.pow(Math.abs(v), 1 / beta);
}

/**
 * Gamma function approximation (Lanczos)
 */
function gamma(z: number): number {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }

    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Box-Muller for normal distribution
 */
function randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Extended config with chaos and Lévy parameters
 */
export interface ChaoticBatConfig extends BatConfig {
    chaosMap: ChaosMap;
    levyBeta: number;
}

/**
 * Chaotic Bat Algorithm with Lévy Distribution (Section 2.2.5)
 */
export class ChaoticLevyBatAlgorithm extends BatAlgorithm {
    private chaoticConfig: ChaoticBatConfig;
    private chaosValue = Math.random();

    constructor(config: ChaoticBatConfig) {
        super(config);
        this.chaoticConfig = config;
    }

    /**
     * Override updatePopulation with chaotic frequency and Lévy flights
     */
    protected updatePopulation(): void {
        const { fMin, fMax, alpha, gamma: gam, chaosMap, levyBeta } = this.chaoticConfig;
        const range = this.bounds.max - this.bounds.min;
        const iteration = this.getIteration();

        // Update chaos value
        this.chaosValue = getChaosValue(this.chaosValue, chaosMap);

        for (const bat of this.population) {
            const meta = bat.metadata as BatMetadata;
            const velocity = bat.velocity!;

            // Chaotic frequency update
            meta.frequency = fMin + (fMax - fMin) * this.chaosValue;

            // Update velocity with Lévy flight
            const levy1 = levyFlight(levyBeta);
            const levy2 = levyFlight(levyBeta);

            velocity[0] += (bat.position[0] - this.globalBest.position[0]) * meta.frequency + levy1 * 0.01 * range;
            velocity[1] += (bat.position[1] - this.globalBest.position[1]) * meta.frequency + levy2 * 0.01 * range;

            let newPosition: ContinuousSolution = [
                bat.position[0] + velocity[0],
                bat.position[1] + velocity[1]
            ];

            // Local search with chaotic perturbation
            if (Math.random() > meta.pulseRate) {
                const avgLoudness = this.getAverageLoudness();
                const nextChaos = getChaosValue(this.chaosValue, chaosMap);
                newPosition = [
                    this.globalBest.position[0] + avgLoudness * (this.chaosValue * 2 - 1),
                    this.globalBest.position[1] + avgLoudness * (nextChaos * 2 - 1)
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
                meta.pulseRate = meta.initialPulseRate * (1 - Math.exp(-gam * iteration));
            }

            // Update global best
            this.updateGlobalBest(bat);
        }
    }
}

