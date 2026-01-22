/**
 * Adaptive Parameter Schedules
 * 
 * Provides functions for adjusting algorithm parameters over iterations.
 * Used in adaptive variants of most swarm algorithms.
 */

import { AdaptiveSchedule, AdaptiveScheduleType } from '../types';

/**
 * Calculate parameter value at a given iteration based on schedule
 * 
 * @param schedule - The adaptive schedule configuration
 * @param iteration - Current iteration (0-indexed)
 * @param maxIterations - Total number of iterations
 * @returns The parameter value at this iteration
 */
export function getAdaptiveValue(
    schedule: AdaptiveSchedule,
    iteration: number,
    maxIterations: number
): number {
    const { type, startValue, endValue } = schedule;
    const progress = Math.min(iteration / Math.max(maxIterations - 1, 1), 1);

    switch (type) {
        case 'linear':
            return startValue + (endValue - startValue) * progress;

        case 'exponential':
            // Exponential decay/growth: start * (end/start)^progress
            if (startValue === 0) return endValue * progress;
            const ratio = endValue / startValue;
            return startValue * Math.pow(ratio, progress);

        case 'cosine':
            // Cosine annealing: smooth transition
            const cosValue = (1 - Math.cos(Math.PI * progress)) / 2;
            return startValue + (endValue - startValue) * cosValue;

        case 'step':
            // Step function: switch at specified iteration
            const switchAt = schedule.switchAt ?? Math.floor(maxIterations / 2);
            return iteration < switchAt ? startValue : endValue;

        default:
            return startValue;
    }
}

/**
 * Create an adaptive parameter manager
 * Tracks multiple parameters with different schedules
 */
export class AdaptiveParameterManager {
    private schedules: Map<string, AdaptiveSchedule> = new Map();
    private maxIterations: number;

    constructor(maxIterations: number) {
        this.maxIterations = maxIterations;
    }

    /**
     * Add a parameter with an adaptive schedule
     */
    public addParameter(name: string, schedule: AdaptiveSchedule): this {
        this.schedules.set(name, schedule);
        return this;
    }

    /**
     * Get parameter value at current iteration
     */
    public getValue(name: string, iteration: number): number {
        const schedule = this.schedules.get(name);
        if (!schedule) {
            throw new Error(`Unknown adaptive parameter: ${name}`);
        }
        return getAdaptiveValue(schedule, iteration, this.maxIterations);
    }

    /**
     * Get all parameter values at current iteration
     */
    public getAllValues(iteration: number): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [name, schedule] of this.schedules) {
            result[name] = getAdaptiveValue(schedule, iteration, this.maxIterations);
        }
        return result;
    }
}

/**
 * Common adaptive schedules used across algorithms
 */
export const commonSchedules = {
    /** Linearly decreasing inertia weight (PSO-style) */
    inertiaWeight: (wMax: number = 0.9, wMin: number = 0.4): AdaptiveSchedule => ({
        type: 'linear',
        startValue: wMax,
        endValue: wMin
    }),

    /** Exponentially decaying temperature (SA-style) */
    temperature: (T0: number = 100, Tmin: number = 0.01): AdaptiveSchedule => ({
        type: 'exponential',
        startValue: T0,
        endValue: Tmin
    }),

    /** Cosine annealing for learning rate */
    cosineAnnealing: (start: number, end: number): AdaptiveSchedule => ({
        type: 'cosine',
        startValue: start,
        endValue: end
    }),

    /** Step function for phase changes */
    stepChange: (before: number, after: number, switchAt: number): AdaptiveSchedule => ({
        type: 'step',
        startValue: before,
        endValue: after,
        switchAt
    })
};
