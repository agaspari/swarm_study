/**
 * Chapter 2.2.4: Binary Bat Algorithm with Lévy Distribution
 * 
 * Combines binary representation with Lévy flights for enhanced
 * exploration in discrete search spaces.
 * 
 * Reference: Hassanien & Emary, Section 2.2.4
 */

import { BinaryBat, BinaryBatConfig, BinaryBatState, BinaryObjectiveFunction, oneMax } from './binary';

/**
 * Lévy flight step
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

function gamma(z: number): number {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function randomNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

export interface BinaryLevyBatConfig extends BinaryBatConfig {
    levyBeta: number;
}

/**
 * Binary Bat Algorithm with Lévy Distribution (Section 2.2.4)
 */
export class BinaryLevyBatAlgorithm {
    private bats: BinaryBat[] = [];
    private bestPosition: number[] = [];
    private bestFitness = Infinity;
    private config: BinaryLevyBatConfig;
    private func: BinaryObjectiveFunction;
    private iteration = 0;

    public history: BinaryBatState[] = [];

    constructor(config: BinaryLevyBatConfig, func: BinaryObjectiveFunction = oneMax) {
        this.config = config;
        this.func = func;
        this.initialize();
    }

    private initialize(): void {
        const { nBats, nDimensions, fMin, fMax, initialLoudness, initialPulseRate } = this.config;

        this.bats = [];
        this.bestFitness = Infinity;
        this.bestPosition = [];
        this.iteration = 0;
        this.history = [];

        for (let i = 0; i < nBats; i++) {
            const position = Array(nDimensions).fill(0).map(() => Math.random() < 0.5 ? 0 : 1);
            const velocity = Array(nDimensions).fill(0);
            const fitness = this.func(position);

            this.bats.push({
                position,
                velocity,
                frequency: fMin + Math.random() * (fMax - fMin),
                loudness: initialLoudness,
                pulseRate: initialPulseRate,
                fitness
            });

            if (fitness < this.bestFitness) {
                this.bestFitness = fitness;
                this.bestPosition = [...position];
            }
        }

        this.recordState();
    }

    public step(): void {
        const { fMin, fMax, alpha, gamma, nDimensions, levyBeta } = this.config;

        for (const bat of this.bats) {
            bat.frequency = fMin + (fMax - fMin) * Math.random();

            // Update velocity with Lévy flight
            for (let d = 0; d < nDimensions; d++) {
                const levy = levyFlight(levyBeta);
                bat.velocity[d] += (bat.position[d] - this.bestPosition[d]) * bat.frequency + levy * 0.1;
            }

            const newPosition = [...bat.position];

            for (let d = 0; d < nDimensions; d++) {
                const probability = sigmoid(bat.velocity[d]);

                if (Math.random() > bat.pulseRate) {
                    newPosition[d] = this.bestPosition[d];
                } else {
                    newPosition[d] = Math.random() < probability ? 1 : 0;
                }
            }

            const newFitness = this.func(newPosition);

            if (Math.random() < bat.loudness && newFitness < bat.fitness) {
                bat.position = newPosition;
                bat.fitness = newFitness;
                bat.loudness *= alpha;
                bat.pulseRate = bat.pulseRate * (1 - Math.exp(-gamma * this.iteration));
            }

            if (bat.fitness < this.bestFitness) {
                this.bestFitness = bat.fitness;
                this.bestPosition = [...bat.position];
            }
        }

        this.iteration++;
        this.recordState();
    }

    public run(iterations: number): void {
        for (let i = 0; i < iterations; i++) this.step();
    }

    private recordState(): void {
        this.history.push({
            bats: this.bats.map(b => ({
                ...b,
                position: [...b.position],
                velocity: [...b.velocity]
            })),
            bestPosition: [...this.bestPosition],
            bestFitness: this.bestFitness,
            iteration: this.iteration
        });
    }

    public reset(): void { this.initialize(); }
}
