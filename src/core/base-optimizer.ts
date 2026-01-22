/**
 * Abstract Base Optimizer
 * 
 * Template Method pattern for swarm intelligence algorithms.
 * Subclasses only need to implement updatePopulation().
 */

import {
    Solution,
    ContinuousSolution,
    Agent,
    IterationState,
    BaseOptimizerConfig,
    Continuous2DConfig,
    Optimizer,
    Bounds,
    ObjectiveFunction2D
} from './types';

/**
 * Abstract base class for all swarm optimization algorithms.
 * 
 * Provides common functionality:
 * - Population management
 * - History recording
 * - Boundary handling
 * - Global best tracking
 * 
 * Subclasses implement: updatePopulation()
 */
export abstract class BaseOptimizer<T extends Solution = ContinuousSolution>
    implements Optimizer<T> {

    protected population: Agent<T>[] = [];
    protected globalBest!: Agent<T>;
    protected iteration: number = 0;
    protected history: IterationState<T>[] = [];
    protected config: BaseOptimizerConfig;

    constructor(config: BaseOptimizerConfig) {
        this.config = config;
    }

    // ========================================================================
    // PUBLIC API (Optimizer interface)
    // ========================================================================

    /** Execute a single iteration using template method pattern */
    public step(): void {
        this.preStep();
        this.updatePopulation();
        this.postStep();
        this.iteration++;
        this.recordState();
    }

    /** Run for N iterations */
    public run(iterations: number): void {
        for (let i = 0; i < iterations; i++) {
            this.step();
        }
    }

    /** Reset to initial state */
    public reset(): void {
        this.iteration = 0;
        this.history = [];
        this.initializePopulation();
        this.recordState();
    }

    /** Get current iteration number */
    public getIteration(): number {
        return this.iteration;
    }

    /** Get full optimization history */
    public getHistory(): IterationState<T>[] {
        return this.history;
    }

    /** Get current global best */
    public getGlobalBest(): Agent<T> {
        return this.globalBest;
    }

    // ========================================================================
    // TEMPLATE METHOD HOOKS (Override in subclasses if needed)
    // ========================================================================

    /** Called before updatePopulation() each iteration */
    protected preStep(): void {
        // Default: no-op. Override for setup logic.
    }

    /** Called after updatePopulation() each iteration */
    protected postStep(): void {
        // Default: no-op. Override for cleanup logic.
    }

    /** 
     * THE CORE ALGORITHM LOGIC
     * Subclasses MUST implement this.
     */
    protected abstract updatePopulation(): void;

    /** Initialize the population. Subclasses may override for custom init. */
    protected abstract initializePopulation(): void;

    // ========================================================================
    // UTILITY METHODS (Common operations for subclasses)
    // ========================================================================

    /** Record current state to history */
    protected recordState(): void {
        this.history.push({
            iteration: this.iteration,
            agents: this.population.map(a => this.cloneAgent(a)),
            globalBest: this.clonePosition(this.globalBest.position),
            globalBestFitness: this.globalBest.fitness
        });
    }

    /** Deep clone an agent */
    protected cloneAgent(agent: Agent<T>): Agent<T> {
        return {
            position: this.clonePosition(agent.position),
            fitness: agent.fitness,
            velocity: agent.velocity ? this.clonePosition(agent.velocity) : undefined,
            personalBest: agent.personalBest ? this.clonePosition(agent.personalBest) : undefined,
            personalBestFitness: agent.personalBestFitness,
            metadata: agent.metadata ? { ...agent.metadata } : undefined
        };
    }

    /** Clone a position/solution */
    protected clonePosition(pos: T): T {
        return [...pos] as T;
    }

    /** Update global best if agent is better */
    protected updateGlobalBest(agent: Agent<T>): boolean {
        if (agent.fitness < this.globalBest.fitness) {
            this.globalBest = this.cloneAgent(agent);
            return true;
        }
        return false;
    }

    /** Calculate Euclidean distance between two solutions */
    protected distance(a: T, b: T): number {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = (a[i] as number) - (b[i] as number);
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}

/**
 * Base class specifically for 2D continuous optimization.
 * Most algorithms in this visualizer will extend this.
 */
export abstract class BaseContinuous2DOptimizer extends BaseOptimizer<ContinuousSolution> {
    protected bounds: Bounds;
    protected objectiveFunction: ObjectiveFunction2D;

    constructor(config: Continuous2DConfig) {
        super(config);
        this.bounds = config.bounds;
        this.objectiveFunction = config.objectiveFunction;
    }

    /** Evaluate a 2D position */
    protected evaluate(position: ContinuousSolution): number {
        return this.objectiveFunction(position[0], position[1]);
    }

    /** Clamp position to bounds */
    protected clamp(position: ContinuousSolution): ContinuousSolution {
        return position.map(v =>
            Math.max(this.bounds.min, Math.min(this.bounds.max, v))
        );
    }

    /** Generate random position within bounds */
    protected randomPosition(): ContinuousSolution {
        const range = this.bounds.max - this.bounds.min;
        return [
            this.bounds.min + Math.random() * range,
            this.bounds.min + Math.random() * range
        ];
    }

    /** Create a new agent at a random position */
    protected createRandomAgent(): Agent<ContinuousSolution> {
        const position = this.randomPosition();
        const fitness = this.evaluate(position);
        return { position, fitness };
    }

    /** Default population initialization */
    protected initializePopulation(): void {
        this.population = [];

        for (let i = 0; i < this.config.populationSize; i++) {
            const agent = this.createRandomAgent();
            this.population.push(agent);
        }

        // Find initial global best
        this.globalBest = this.cloneAgent(
            this.population.reduce((best, agent) =>
                agent.fitness < best.fitness ? agent : best
            )
        );
    }
}
