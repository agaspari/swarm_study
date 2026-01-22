/**
 * Differential Evolution (DE) Operators
 * 
 * Provides mutation and crossover operators for DE hybridization.
 * Used in BA+DE, Cuckoo+DE, and other hybrid algorithms.
 */

import { ContinuousSolution, Agent } from '../../types';

/**
 * DE Mutation Strategies
 */
export type DEMutationStrategy =
    | 'rand/1'      // Most common: v = x_r1 + F * (x_r2 - x_r3)
    | 'best/1'      // v = x_best + F * (x_r1 - x_r2)
    | 'rand/2'      // v = x_r1 + F * (x_r2 - x_r3) + F * (x_r4 - x_r5)
    | 'best/2'      // v = x_best + F * (x_r1 - x_r2) + F * (x_r3 - x_r4)
    | 'current-to-best/1';  // v = x_i + F * (x_best - x_i) + F * (x_r1 - x_r2)

/**
 * DE Configuration
 */
export interface DEConfig {
    /** Mutation factor (typically 0.5-1.0) */
    F: number;
    /** Crossover rate (typically 0.7-0.9) */
    CR: number;
    /** Mutation strategy */
    strategy?: DEMutationStrategy;
}

/**
 * Default DE configuration
 */
export const defaultDEConfig: DEConfig = {
    F: 0.8,
    CR: 0.9,
    strategy: 'rand/1'
};

/**
 * Select random distinct indices from population
 */
function selectRandomIndices(
    populationSize: number,
    count: number,
    exclude?: number[]
): number[] {
    const indices: number[] = [];
    const excludeSet = new Set(exclude ?? []);

    while (indices.length < count) {
        const idx = Math.floor(Math.random() * populationSize);
        if (!excludeSet.has(idx) && !indices.includes(idx)) {
            indices.push(idx);
        }
    }

    return indices;
}

/**
 * DE Mutation: Generate mutant vector
 * 
 * @param population - Current population
 * @param targetIndex - Index of target vector
 * @param globalBest - Global best solution
 * @param config - DE configuration
 * @returns Mutant vector
 */
export function deMutation(
    population: Agent<ContinuousSolution>[],
    targetIndex: number,
    globalBest: ContinuousSolution,
    config: DEConfig = defaultDEConfig
): ContinuousSolution {
    const { F, strategy = 'rand/1' } = config;
    const n = population.length;
    const dim = population[0].position.length;
    const target = population[targetIndex].position;

    let mutant: ContinuousSolution;

    switch (strategy) {
        case 'rand/1': {
            const [r1, r2, r3] = selectRandomIndices(n, 3, [targetIndex]);
            mutant = population[r1].position.map((v, i) =>
                v + F * (population[r2].position[i] - population[r3].position[i])
            );
            break;
        }

        case 'best/1': {
            const [r1, r2] = selectRandomIndices(n, 2, [targetIndex]);
            mutant = globalBest.map((v, i) =>
                v + F * (population[r1].position[i] - population[r2].position[i])
            );
            break;
        }

        case 'rand/2': {
            const [r1, r2, r3, r4, r5] = selectRandomIndices(n, 5, [targetIndex]);
            mutant = population[r1].position.map((v, i) =>
                v + F * (population[r2].position[i] - population[r3].position[i])
                + F * (population[r4].position[i] - population[r5].position[i])
            );
            break;
        }

        case 'best/2': {
            const [r1, r2, r3, r4] = selectRandomIndices(n, 4, [targetIndex]);
            mutant = globalBest.map((v, i) =>
                v + F * (population[r1].position[i] - population[r2].position[i])
                + F * (population[r3].position[i] - population[r4].position[i])
            );
            break;
        }

        case 'current-to-best/1': {
            const [r1, r2] = selectRandomIndices(n, 2, [targetIndex]);
            mutant = target.map((v, i) =>
                v + F * (globalBest[i] - v)
                + F * (population[r1].position[i] - population[r2].position[i])
            );
            break;
        }

        default:
            mutant = [...target];
    }

    return mutant;
}

/**
 * DE Crossover (Binomial)
 * 
 * @param target - Target vector
 * @param mutant - Mutant vector
 * @param CR - Crossover rate
 * @returns Trial vector
 */
export function deCrossover(
    target: ContinuousSolution,
    mutant: ContinuousSolution,
    CR: number
): ContinuousSolution {
    const dim = target.length;
    const jRand = Math.floor(Math.random() * dim); // Ensure at least one gene from mutant

    return target.map((v, j) =>
        (Math.random() < CR || j === jRand) ? mutant[j] : v
    );
}

/**
 * Full DE operation: mutation + crossover
 * 
 * @param population - Current population
 * @param targetIndex - Index of target vector
 * @param globalBest - Global best solution
 * @param config - DE configuration
 * @returns Trial vector
 */
export function deOperator(
    population: Agent<ContinuousSolution>[],
    targetIndex: number,
    globalBest: ContinuousSolution,
    config: DEConfig = defaultDEConfig
): ContinuousSolution {
    const mutant = deMutation(population, targetIndex, globalBest, config);
    const trial = deCrossover(population[targetIndex].position, mutant, config.CR);
    return trial;
}
