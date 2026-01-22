/**
 * Chapter 3.2.3: Modified AFSA
 * 
 * AFSA with stricter crowding control to avoid local optima.
 * Uses an adaptive delta factor based on iteration progress.
 * 
 * Reference: Hassanien & Emary, Section 3.2.3
 */

import { AFSAAlgorithm, AFSAConfig } from './standard';

/**
 * Modified AFSA with dynamic crowding control (Section 3.2.3)
 */
export class ModifiedAFSA extends AFSAAlgorithm {
    constructor(config: AFSAConfig) {
        super(config);
    }

    /**
     * Override preStep to dynamically adjust delta (crowding factor)
     * As iterations progress, become stricter about crowding
     */
    protected preStep(): void {
        const iteration = this.getIteration();
        const maxIterations = 100; // Assume 100 iterations max
        const progress = Math.min(1, iteration / maxIterations);

        // Start with looser crowding, become stricter over time
        // This helps escape local optima early, exploit later
        const originalDelta = 0.618; // Golden ratio default
        this.afsaConfig.delta = originalDelta * (1 - progress * 0.5);
    }
}
