/**
 * Particle Swarm Optimization (PSO) Operators
 * 
 * Provides velocity and position update operators for PSO hybridization.
 * Used in BA+PSO, AFSA+PSO, Cuckoo+PSO, and other hybrid algorithms.
 */

import { ContinuousSolution, Agent } from '../../types';

/**
 * PSO Configuration
 */
export interface PSOConfig {
    /** Inertia weight (typically 0.4-0.9) */
    w: number;
    /** Cognitive coefficient (personal best attraction) */
    c1: number;
    /** Social coefficient (global best attraction) */
    c2: number;
    /** Maximum velocity (optional, limits step size) */
    vMax?: number;
}

/**
 * Default PSO configuration
 */
export const defaultPSOConfig: PSOConfig = {
    w: 0.7,
    c1: 1.5,
    c2: 1.5
};

/**
 * Initialize velocity for an agent
 * 
 * @param dimensions - Number of dimensions
 * @param vMax - Maximum velocity (optional)
 * @returns Initial velocity vector
 */
export function initializeVelocity(dimensions: number, vMax?: number): ContinuousSolution {
    const velocity: ContinuousSolution = [];
    for (let i = 0; i < dimensions; i++) {
        let v = (Math.random() * 2 - 1); // Random between -1 and 1
        if (vMax !== undefined) {
            v *= vMax;
        }
        velocity.push(v);
    }
    return velocity;
}

/**
 * Update velocity using PSO equation
 * 
 * v_new = w * v + c1 * r1 * (pBest - x) + c2 * r2 * (gBest - x)
 * 
 * @param velocity - Current velocity
 * @param position - Current position
 * @param personalBest - Personal best position
 * @param globalBest - Global best position
 * @param config - PSO configuration
 * @returns New velocity
 */
export function updateVelocity(
    velocity: ContinuousSolution,
    position: ContinuousSolution,
    personalBest: ContinuousSolution,
    globalBest: ContinuousSolution,
    config: PSOConfig = defaultPSOConfig
): ContinuousSolution {
    const { w, c1, c2, vMax } = config;
    const r1 = Math.random();
    const r2 = Math.random();

    const newVelocity = velocity.map((v, i) => {
        let newV = w * v
            + c1 * r1 * (personalBest[i] - position[i])
            + c2 * r2 * (globalBest[i] - position[i]);

        // Clamp to vMax if specified
        if (vMax !== undefined) {
            newV = Math.max(-vMax, Math.min(vMax, newV));
        }

        return newV;
    });

    return newVelocity;
}

/**
 * Update position using velocity
 * 
 * x_new = x + v
 * 
 * @param position - Current position
 * @param velocity - Current velocity
 * @returns New position
 */
export function updatePosition(
    position: ContinuousSolution,
    velocity: ContinuousSolution
): ContinuousSolution {
    return position.map((x, i) => x + velocity[i]);
}

/**
 * Full PSO update for an agent
 * Updates velocity and position, returns new position
 * 
 * @param agent - Current agent (must have velocity and personalBest)
 * @param globalBest - Global best position
 * @param config - PSO configuration
 * @returns Object with new position and velocity
 */
export function psoUpdate(
    agent: Agent<ContinuousSolution>,
    globalBest: ContinuousSolution,
    config: PSOConfig = defaultPSOConfig
): { position: ContinuousSolution; velocity: ContinuousSolution } {
    if (!agent.velocity || !agent.personalBest) {
        throw new Error('Agent must have velocity and personalBest for PSO update');
    }

    const newVelocity = updateVelocity(
        agent.velocity,
        agent.position,
        agent.personalBest,
        globalBest,
        config
    );

    const newPosition = updatePosition(agent.position, newVelocity);

    return { position: newPosition, velocity: newVelocity };
}

/**
 * Update personal best if current position is better
 * 
 * @param agent - Agent to update
 * @param currentFitness - Fitness at current position
 * @returns Whether personal best was updated
 */
export function updatePersonalBest(
    agent: Agent<ContinuousSolution>,
    currentFitness: number
): boolean {
    if (agent.personalBestFitness === undefined || currentFitness < agent.personalBestFitness) {
        agent.personalBest = [...agent.position];
        agent.personalBestFitness = currentFitness;
        return true;
    }
    return false;
}
