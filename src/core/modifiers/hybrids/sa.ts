/**
 * Simulated Annealing (SA) Operators
 * 
 * Provides Metropolis acceptance criterion for SA hybridization.
 * Used in BA+SA, Cuckoo+SA, and other hybrid algorithms.
 */

/**
 * SA Configuration
 */
export interface SAConfig {
    /** Initial temperature */
    T0: number;
    /** Cooling rate (alpha, typically 0.95-0.99) */
    alpha: number;
    /** Minimum temperature (optional stopping criterion) */
    Tmin?: number;
}

/**
 * Default SA configuration
 */
export const defaultSAConfig: SAConfig = {
    T0: 100,
    alpha: 0.95,
    Tmin: 0.001
};

/**
 * Calculate temperature at a given iteration
 * 
 * T(t) = T0 * alpha^t
 * 
 * @param iteration - Current iteration
 * @param config - SA configuration
 * @returns Current temperature
 */
export function getTemperature(iteration: number, config: SAConfig = defaultSAConfig): number {
    const { T0, alpha, Tmin } = config;
    const T = T0 * Math.pow(alpha, iteration);
    return Tmin !== undefined ? Math.max(T, Tmin) : T;
}

/**
 * Metropolis acceptance criterion
 * 
 * For minimization:
 * - If new solution is better (lower fitness), always accept
 * - If new solution is worse, accept with probability exp(-delta/T)
 * 
 * @param currentFitness - Current solution fitness
 * @param newFitness - New (candidate) solution fitness
 * @param temperature - Current temperature
 * @returns Whether to accept the new solution
 */
export function metropolisAccept(
    currentFitness: number,
    newFitness: number,
    temperature: number
): boolean {
    const delta = newFitness - currentFitness;

    // If new solution is better, always accept
    if (delta < 0) {
        return true;
    }

    // If temperature is very low, reject worse solutions
    if (temperature <= 0) {
        return false;
    }

    // Accept with probability exp(-delta/T)
    const probability = Math.exp(-delta / temperature);
    return Math.random() < probability;
}

/**
 * Boltzmann selection probability
 * 
 * Used for probabilistic selection in some SA variants
 * 
 * @param fitnesses - Array of fitness values
 * @param temperature - Current temperature
 * @returns Array of selection probabilities
 */
export function boltzmannProbabilities(
    fitnesses: number[],
    temperature: number
): number[] {
    if (temperature <= 0) {
        // At T=0, select only the best
        const minFitness = Math.min(...fitnesses);
        return fitnesses.map(f => f === minFitness ? 1 : 0);
    }

    // Calculate exp(-f/T) for each fitness
    const expValues = fitnesses.map(f => Math.exp(-f / temperature));
    const sum = expValues.reduce((a, b) => a + b, 0);

    // Normalize to probabilities
    return expValues.map(e => e / sum);
}

/**
 * Generate neighbor solution using random perturbation
 * 
 * @param position - Current position
 * @param stepSize - Perturbation magnitude
 * @returns Neighbor position
 */
export function generateNeighbor(
    position: number[],
    stepSize: number
): number[] {
    return position.map(x => x + (Math.random() * 2 - 1) * stepSize);
}

/**
 * Adaptive step size based on temperature
 * Higher temperature = larger steps (exploration)
 * Lower temperature = smaller steps (exploitation)
 * 
 * @param T0 - Initial temperature
 * @param T - Current temperature
 * @param baseStep - Base step size at T0
 * @returns Adapted step size
 */
export function adaptiveStepSize(T0: number, T: number, baseStep: number): number {
    return baseStep * (T / T0);
}
