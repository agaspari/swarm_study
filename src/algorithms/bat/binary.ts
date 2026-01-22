/**
 * Chapter 2.2.2: Binary Bat Algorithm
 * 
 * Modified for binary/discrete optimization problems.
 * Uses sigmoid function to convert continuous velocity to binary position.
 * 
 * Key differences from Standard BA:
 * - Positions are binary (0 or 1)
 * - Transfer function converts velocity to probability
 * 
 * Reference: Hassanien & Emary, Section 2.2.2
 */

export interface BinaryBat {
    position: number[];        // Binary array
    velocity: number[];        // Continuous velocity
    frequency: number;
    loudness: number;
    pulseRate: number;
    fitness: number;
}

export interface BinaryBatConfig {
    nBats: number;
    nDimensions: number;
    fMin: number;
    fMax: number;
    alpha: number;
    gamma: number;
    initialLoudness: number;
    initialPulseRate: number;
}

export interface BinaryBatState {
    bats: BinaryBat[];
    bestPosition: number[];
    bestFitness: number;
    iteration: number;
}

export type BinaryObjectiveFunction = (position: number[]) => number;

/**
 * Sigmoid transfer function
 */
function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

/**
 * OneMax problem - count number of 1s (for testing)
 */
export const oneMax: BinaryObjectiveFunction = (pos) => {
    return -pos.reduce((a, b) => a + b, 0);  // Negative for minimization
};

/**
 * Binary Bat Algorithm (Section 2.2.2)
 */
export class BinaryBatAlgorithm {
    private bats: BinaryBat[] = [];
    private bestPosition: number[] = [];
    private bestFitness = Infinity;
    private config: BinaryBatConfig;
    private func: BinaryObjectiveFunction;
    private iteration = 0;

    public history: BinaryBatState[] = [];

    constructor(config: BinaryBatConfig, func: BinaryObjectiveFunction = oneMax) {
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
            const velocity = Array(nDimensions).fill(0).map(() => (Math.random() - 0.5) * 2);
            const fitness = this.func(position);

            const bat: BinaryBat = {
                position,
                velocity,
                frequency: fMin + Math.random() * (fMax - fMin),
                loudness: initialLoudness,
                pulseRate: initialPulseRate,
                fitness
            };

            this.bats.push(bat);

            if (fitness < this.bestFitness) {
                this.bestFitness = fitness;
                this.bestPosition = [...position];
            }
        }

        this.recordState();
    }

    public step(): void {
        const { fMin, fMax, alpha, gamma, nDimensions } = this.config;

        for (const bat of this.bats) {
            // Update frequency
            bat.frequency = fMin + (fMax - fMin) * Math.random();

            // Update velocity
            for (let d = 0; d < nDimensions; d++) {
                bat.velocity[d] += (bat.position[d] - this.bestPosition[d]) * bat.frequency;
            }

            // Generate new binary solution
            const newPosition = [...bat.position];

            for (let d = 0; d < nDimensions; d++) {
                // Transfer function: sigmoid
                const probability = sigmoid(bat.velocity[d]);

                // Local search
                if (Math.random() > bat.pulseRate) {
                    newPosition[d] = this.bestPosition[d];
                } else {
                    newPosition[d] = Math.random() < probability ? 1 : 0;
                }
            }

            const newFitness = this.func(newPosition);

            // Accept new solution?
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
        for (let i = 0; i < iterations; i++) {
            this.step();
        }
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

    public reset(): void {
        this.initialize();
    }
}
