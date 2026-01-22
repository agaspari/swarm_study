/**
 * Chapter 3.2.2: Fast AFSA
 * 
 * AFSA with adaptive step size that decreases over iterations
 * for enhanced exploitation in later stages.
 * 
 * Reference: Hassanien & Emary, Section 3.2.2
 */

import { AFSAAlgorithm, AFSAConfig } from './standard';

/**
 * Extended config with step decay parameters
 */
export interface FastAFSAConfig extends AFSAConfig {
    alpha: number;    // Decay factor for step size
    minStep: number;  // Minimum step size
}

/**
 * Fast AFSA with adaptive step size (Section 3.2.2)
 */
export class FastAFSA extends AFSAAlgorithm {
    private fastConfig: FastAFSAConfig;
    private currentStep: number;

    constructor(config: FastAFSAConfig) {
        super(config);
        this.fastConfig = config;
        // Initialize step after fastConfig is set
        this.currentStep = config.step;
    }

    /**
     * Reset including step size
     */
    public reset(): void {
        super.reset();
        // fastConfig may not be set during parent constructor call
        if (this.fastConfig) {
            this.currentStep = this.fastConfig.step;
        }
    }

    /**
     * Override preStep to adapt step size before each iteration
     */
    protected preStep(): void {
        // Guard against preStep being called before config is set
        if (!this.fastConfig) return;

        // Decrease step size over iterations for exploitation
        const minStep = this.fastConfig.minStep || 0.01;
        const alpha = this.fastConfig.alpha || 0.9;

        if (this.currentStep > minStep) {
            this.currentStep *= alpha;
        }

        // Update the config step for this iteration
        this.afsaConfig.step = this.currentStep;
    }
}
