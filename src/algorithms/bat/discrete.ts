/**
 * Chapter 2.2.1: Discrete Bat Algorithm
 * 
 * Modified for combinatorial optimization problems like TSP.
 * Uses permutation-based representation instead of continuous positions.
 * 
 * Key differences:
 * - Positions are permutations (e.g., city order for TSP)
 * - Velocity is a swap sequence
 * - Movement is position update via swap operations
 * 
 * Reference: Hassanien & Emary, Section 2.2.1
 */

export interface DiscreteBat {
    permutation: number[];
    velocity: Array<[number, number]>;  // Swap sequence
    frequency: number;
    loudness: number;
    pulseRate: number;
    fitness: number;
}

export interface DiscreteBatConfig {
    nBats: number;
    nElements: number;      // Size of permutation
    fMin: number;
    fMax: number;
    alpha: number;
    gamma: number;
    initialLoudness: number;
    initialPulseRate: number;
}

export interface DiscreteBatState {
    bats: DiscreteBat[];
    bestPermutation: number[];
    bestFitness: number;
    iteration: number;
}

export type PermutationObjectiveFunction = (permutation: number[]) => number;

/**
 * Random permutation generator
 */
function randomPermutation(n: number): number[] {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Apply swap sequence to permutation
 */
function applySwaps(perm: number[], swaps: Array<[number, number]>): number[] {
    const result = [...perm];
    for (const [i, j] of swaps) {
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Generate random swap sequence
 */
function randomSwaps(n: number, count: number): Array<[number, number]> {
    const swaps: Array<[number, number]> = [];
    for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * n);
        let b = Math.floor(Math.random() * n);
        while (b === a) b = Math.floor(Math.random() * n);
        swaps.push([a, b]);
    }
    return swaps;
}

/**
 * Simple TSP fitness (for demo - uses indices as coordinates)
 */
export const simpleTSP: PermutationObjectiveFunction = (perm) => {
    let distance = 0;
    for (let i = 0; i < perm.length; i++) {
        const current = perm[i];
        const next = perm[(i + 1) % perm.length];
        distance += Math.abs(current - next);  // Simple distance
    }
    return distance;
};

/**
 * Discrete Bat Algorithm (Section 2.2.1)
 */
export class DiscreteBatAlgorithm {
    private bats: DiscreteBat[] = [];
    private bestPermutation: number[] = [];
    private bestFitness = Infinity;
    private config: DiscreteBatConfig;
    private func: PermutationObjectiveFunction;
    private iteration = 0;

    public history: DiscreteBatState[] = [];

    constructor(config: DiscreteBatConfig, func: PermutationObjectiveFunction = simpleTSP) {
        this.config = config;
        this.func = func;
        this.initialize();
    }

    private initialize(): void {
        const { nBats, nElements, fMin, fMax, initialLoudness, initialPulseRate } = this.config;

        this.bats = [];
        this.bestFitness = Infinity;
        this.bestPermutation = [];
        this.iteration = 0;
        this.history = [];

        for (let i = 0; i < nBats; i++) {
            const permutation = randomPermutation(nElements);
            const fitness = this.func(permutation);

            const bat: DiscreteBat = {
                permutation,
                velocity: [],
                frequency: fMin + Math.random() * (fMax - fMin),
                loudness: initialLoudness,
                pulseRate: initialPulseRate,
                fitness
            };

            this.bats.push(bat);

            if (fitness < this.bestFitness) {
                this.bestFitness = fitness;
                this.bestPermutation = [...permutation];
            }
        }

        this.recordState();
    }

    public step(): void {
        const { nElements, fMin, fMax, alpha, gamma } = this.config;

        for (const bat of this.bats) {
            // Update frequency
            bat.frequency = fMin + (fMax - fMin) * Math.random();

            // Number of swaps proportional to frequency
            const nSwaps = Math.max(1, Math.floor(bat.frequency * 3));

            // Generate velocity (swap sequence)
            bat.velocity = randomSwaps(nElements, nSwaps);

            // Generate new permutation
            let newPerm: number[];

            if (Math.random() > bat.pulseRate) {
                // Local search around best
                newPerm = applySwaps(this.bestPermutation, randomSwaps(nElements, 1));
            } else {
                // Apply velocity
                newPerm = applySwaps(bat.permutation, bat.velocity);
            }

            const newFitness = this.func(newPerm);

            // Accept?
            if (Math.random() < bat.loudness && newFitness < bat.fitness) {
                bat.permutation = newPerm;
                bat.fitness = newFitness;

                bat.loudness *= alpha;
                bat.pulseRate = bat.pulseRate * (1 - Math.exp(-gamma * this.iteration));
            }

            if (bat.fitness < this.bestFitness) {
                this.bestFitness = bat.fitness;
                this.bestPermutation = [...bat.permutation];
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
                permutation: [...b.permutation],
                velocity: [...b.velocity]
            })),
            bestPermutation: [...this.bestPermutation],
            bestFitness: this.bestFitness,
            iteration: this.iteration
        });
    }

    public reset(): void {
        this.initialize();
    }
}
