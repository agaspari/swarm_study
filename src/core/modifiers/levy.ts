/**
 * Lévy Flight Distribution
 * 
 * Used in Cuckoo Search, some Firefly variants, and other algorithms
 * for heavy-tailed random walks that occasionally make large jumps.
 */

/**
 * Generate a Lévy flight step using Mantegna's algorithm.
 * 
 * @param beta - Lévy exponent (typically 1.5 for Cuckoo Search)
 * @returns A random step from the Lévy distribution
 */
export function levyStep(beta: number = 1.5): number {
    // Mantegna's algorithm for generating Lévy stable random numbers

    // Calculate sigma using the gamma function approximation
    const sigmaU = Math.pow(
        (gamma(1 + beta) * Math.sin(Math.PI * beta / 2)) /
        (gamma((1 + beta) / 2) * beta * Math.pow(2, (beta - 1) / 2)),
        1 / beta
    );

    // Generate standard normal random numbers using Box-Muller
    const u = gaussianRandom() * sigmaU;
    const v = Math.abs(gaussianRandom());

    // Lévy step
    const step = u / Math.pow(v, 1 / beta);

    return step;
}

/**
 * Generate a 2D Lévy flight step
 * 
 * @param beta - Lévy exponent
 * @param scale - Step size scaling factor
 * @returns [dx, dy] step vector
 */
export function levyFlight2D(beta: number = 1.5, scale: number = 0.01): [number, number] {
    const stepMagnitude = levyStep(beta) * scale;
    const angle = Math.random() * 2 * Math.PI;

    return [
        stepMagnitude * Math.cos(angle),
        stepMagnitude * Math.sin(angle)
    ];
}

/**
 * Generate an N-dimensional Lévy flight step
 * 
 * @param dimensions - Number of dimensions
 * @param beta - Lévy exponent
 * @param scale - Step size scaling factor
 * @returns Step vector
 */
export function levyFlightND(dimensions: number, beta: number = 1.5, scale: number = 0.01): number[] {
    const result: number[] = [];

    for (let i = 0; i < dimensions; i++) {
        result.push(levyStep(beta) * scale);
    }

    return result;
}

/**
 * Box-Muller transform for generating Gaussian random numbers
 */
function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    return z0 * stdDev + mean;
}

/**
 * Stirling's approximation for the gamma function
 * Gamma(n) = (n-1)! for positive integers
 */
function gamma(n: number): number {
    // For small values, use lookup
    const gammaTable: Record<number, number> = {
        1: 1,
        1.5: 0.886226925452758,
        2: 1,
        2.5: 1.329340388179137,
        3: 2,
        3.5: 3.323350970447843
    };

    if (gammaTable[n] !== undefined) {
        return gammaTable[n];
    }

    // Stirling's approximation for larger values
    // Gamma(z) ≈ sqrt(2*pi/z) * (z/e)^z
    if (n > 0) {
        const z = n;
        return Math.sqrt(2 * Math.PI / z) * Math.pow(z / Math.E, z);
    }

    // For non-positive integers, gamma is undefined
    return NaN;
}

/**
 * Apply Lévy flight to a current position
 * 
 * @param current - Current position
 * @param best - Global best position (for directional Lévy)
 * @param alpha - Step size scaling (default 0.01)
 * @param beta - Lévy exponent (default 1.5)
 * @returns New position after Lévy flight
 */
export function applyLevyFlight(
    current: number[],
    best: number[],
    alpha: number = 0.01,
    beta: number = 1.5
): number[] {
    const dimensions = current.length;
    const step = levyFlightND(dimensions, beta, 1);

    // New position: x + alpha * Levy * (x - best)
    return current.map((x, i) => {
        const direction = x - best[i];
        return x + alpha * step[i] * direction;
    });
}
