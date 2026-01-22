/**
 * Algorithm Registry
 * 
 * Central registry for all algorithm variants.
 * Organized by book chapter.
 */

import {
    ChapterGroup,
    AlgorithmDefinition,
    Continuous2DConfig
} from './types';
import { rastrigin2D } from './test-functions';

// Import Bat algorithm family
import { BatAlgorithm, BatConfig } from '../algorithms/bat/standard';
import { AdaptiveBatAlgorithm } from '../algorithms/bat/adaptive';
import { ChaoticLevyBatAlgorithm, ChaoticBatConfig } from '../algorithms/bat/chaotic-levy';
import { SelfAdaptiveBatAlgorithm, SelfAdaptiveBatConfig } from '../algorithms/bat/self-adaptive';
import { BatPSOHybrid, BAPSOConfig } from '../algorithms/bat/hybrid-pso';
import { BatSAHybrid, BASAConfig } from '../algorithms/bat/hybrid-sa';
import { BatDEHybrid, BADEConfig } from '../algorithms/bat/hybrid-de';
import { BatABCHybrid, BAABCConfig } from '../algorithms/bat/hybrid-abc';
import { BatHarmonyHybrid, BAHSConfig } from '../algorithms/bat/hybrid-harmony';

// Import AFSA algorithm family
import { AFSAAlgorithm, AFSAConfig } from '../algorithms/afsa/standard';
import { FastAFSA, FastAFSAConfig } from '../algorithms/afsa/fast';
import { ModifiedAFSA } from '../algorithms/afsa/modified';

/**
 * Create a Continuous2DConfig with default values
 */
function createConfig(
    populationSize: number = 30,
    bounds: { min: number; max: number } = { min: -5.12, max: 5.12 }
): Continuous2DConfig {
    return {
        populationSize,
        type: 'continuous',
        dimensions: 2,
        bounds,
        objectiveFunction: rastrigin2D
    };
}

/** Default Bat config parameters */
const defaultBatParams = {
    fMin: 0,
    fMax: 2,
    alpha: 0.9,
    gamma: 0.9,
    initialLoudness: 1.0,
    initialPulseRate: 0.5
};

/** Default AFSA config parameters */
const defaultAFSAParams = {
    visual: 2.5,
    step: 0.3,
    delta: 0.618,
    tryNumber: 5
};

/**
 * Algorithm Registry - organized by chapter
 */
export const registry: ChapterGroup[] = [
    {
        id: 'ch2-bat',
        name: 'Chapter 2: Bat Algorithm',
        variants: [
            {
                id: 'bat-standard',
                name: 'Standard BA',
                section: '2.1.2',
                description: 'Base echolocation model with frequency tuning',
                details: 'Uses echolocation: frequency controls velocity, loudness decreases as bat approaches prey, pulse rate increases. Balances exploration (high loudness) with exploitation (high pulse rate).',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'fMin',
                        name: 'Min Frequency',
                        description: 'Lower bound of echolocation frequency. Lower values = slower movement, more local search. In nature, bats use ~20-200 kHz.',
                        min: 0, max: 1, step: 0.1, defaultValue: 0
                    },
                    {
                        key: 'fMax',
                        name: 'Max Frequency',
                        description: 'Upper bound of echolocation frequency. Higher values = faster movement, wider exploration. Controls the maximum velocity scale.',
                        min: 1, max: 5, step: 0.5, defaultValue: 2
                    },
                    {
                        key: 'alpha',
                        name: 'Loudness Decay (α)',
                        description: 'Rate at which loudness decreases: A_new = α × A_old. Values near 1.0 = slow decay (longer exploration). Values near 0.5 = fast decay (quick exploitation).',
                        min: 0.5, max: 0.99, step: 0.01, defaultValue: 0.9
                    },
                    {
                        key: 'gamma',
                        name: 'Pulse Rate Growth (γ)',
                        description: 'Rate at which pulse rate increases: r_new = r_0 × (1 - e^(-γt)). Higher γ = faster transition from exploration to exploitation.',
                        min: 0.5, max: 2.0, step: 0.1, defaultValue: 0.9
                    },
                    {
                        key: 'initialLoudness',
                        name: 'Initial Loudness',
                        description: 'Starting loudness A_0 ∈ [0,1]. High loudness = bats emit loud calls, willing to explore new areas. Decreases as they "find prey".',
                        min: 0.5, max: 2.0, step: 0.1, defaultValue: 1.0
                    },
                    {
                        key: 'initialPulseRate',
                        name: 'Initial Pulse Rate',
                        description: 'Starting pulse emission rate r_0 ∈ [0,1]. Low initial rate means bats start cautious (exploring). Increases as confidence grows.',
                        min: 0.1, max: 0.9, step: 0.1, defaultValue: 0.5
                    }
                ],
                create: (config, hyperparams) => new BatAlgorithm({
                    ...config,
                    ...defaultBatParams,
                    ...hyperparams
                } as BatConfig)
            },
            {
                id: 'bat-adaptive',
                name: 'Adaptive BA',
                section: '2.2.7',
                description: 'Diversity-based adaptive frequency control',
                details: 'Adjusts frequency based on population diversity. Low diversity triggers higher frequency for exploration, high diversity enables exploitation with lower frequency.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'alpha',
                        name: 'Loudness Decay (α)',
                        description: 'Rate at which loudness decreases. In Adaptive BA, this works with diversity-based frequency to balance exploration/exploitation.',
                        min: 0.5, max: 0.99, step: 0.01, defaultValue: 0.9
                    },
                    {
                        key: 'gamma',
                        name: 'Pulse Rate Growth (γ)',
                        description: 'Controls how quickly pulse rate increases. Adaptive BA modifies frequency based on swarm diversity while this parameter controls pulse emission.',
                        min: 0.5, max: 2.0, step: 0.1, defaultValue: 0.9
                    }
                ],
                create: (config, hyperparams) => new AdaptiveBatAlgorithm({
                    ...config,
                    ...defaultBatParams,
                    ...hyperparams
                } as BatConfig)
            },
            {
                id: 'bat-chaotic-levy',
                name: 'Chaotic + Lévy BA',
                section: '2.2.5',
                description: 'Chaos maps with Lévy flight exploration',
                details: 'Uses logistic chaos map for frequency tuning and Lévy flights for heavy-tailed random walks. Enhances global search capability and escape from local optima.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'levyBeta',
                        name: 'Lévy β Parameter',
                        description: 'Controls the Lévy flight distribution (β ∈ [1,2]). β=1.0 = Cauchy distribution (very heavy tails, large jumps). β=2.0 = Gaussian (normal random walk). β=1.5 is a good balance.',
                        min: 1.0, max: 2.0, step: 0.1, defaultValue: 1.5
                    }
                ],
                create: (config, hyperparams) => new ChaoticLevyBatAlgorithm({
                    ...config, ...defaultBatParams,
                    chaosMap: 'logistic',
                    levyBeta: 1.5,
                    ...hyperparams
                } as ChaoticBatConfig)
            },
            {
                id: 'bat-self-adaptive',
                name: 'Self-Adaptive BA',
                section: '2.2.6',
                description: 'Self-tuning parameters based on progress',
                details: 'Parameters automatically adjust based on iteration progress. No manual tuning needed. Starts with exploration-focused parameters, transitions to exploitation.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                create: (config) => new SelfAdaptiveBatAlgorithm({
                    ...config, ...defaultBatParams,
                    maxIterations: 100
                } as SelfAdaptiveBatConfig)
            }
        ],
        hybridizations: [
            {
                id: 'bat-pso',
                name: 'BA + PSO',
                section: '2.3.2',
                description: 'Hybrid with Particle Swarm Optimization',
                details: 'Combines BA echolocation with PSO social learning. Uses personal best and global best like PSO, plus BA frequency-based velocity updates.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'w',
                        name: 'Inertia Weight (w)',
                        description: 'Controls momentum from previous velocity. High w (0.9) = more exploration, keeps moving. Low w (0.4) = more exploitation, quick direction changes.',
                        min: 0.3, max: 1.0, step: 0.1, defaultValue: 0.7
                    },
                    {
                        key: 'c1',
                        name: 'Cognitive Coef. (c₁)',
                        description: 'Pull toward personal best position. Higher c₁ = particles trust their own experience more. "Self-confidence" of each bat.',
                        min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5
                    },
                    {
                        key: 'c2',
                        name: 'Social Coef. (c₂)',
                        description: 'Pull toward swarm\'s global best. Higher c₂ = particles follow the leader more. "Social influence" from the swarm.',
                        min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5
                    }
                ],
                create: (config, hyperparams) => new BatPSOHybrid({
                    ...config, ...defaultBatParams,
                    w: 0.7, c1: 1.5, c2: 1.5,
                    ...hyperparams
                } as BAPSOConfig)
            },
            {
                id: 'bat-sa',
                name: 'BA + SA',
                section: '2.3.4',
                description: 'Hybrid with Simulated Annealing',
                details: 'Uses SA temperature-based acceptance criterion. Can accept worse solutions with decreasing probability, helping escape local optima.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'initialTemp',
                        name: 'Initial Temperature',
                        description: 'Starting temperature for SA acceptance. High temp = accept almost any move (exploration). Temperature decreases over iterations.',
                        min: 10, max: 500, step: 10, defaultValue: 100
                    },
                    {
                        key: 'coolingRate',
                        name: 'Cooling Rate',
                        description: 'Rate of temperature decay: T_new = rate × T_old. Values near 0.99 = slow cooling (longer exploration). Values near 0.8 = fast cooling (quick convergence).',
                        min: 0.8, max: 0.99, step: 0.01, defaultValue: 0.95
                    }
                ],
                create: (config, hyperparams) => new BatSAHybrid({
                    ...config, ...defaultBatParams,
                    initialTemp: 100, coolingRate: 0.95,
                    ...hyperparams
                } as BASAConfig)
            },
            {
                id: 'bat-de',
                name: 'BA + DE',
                section: '2.3.1',
                description: 'Hybrid with Differential Evolution',
                details: 'Uses DE mutation operators (v = x_r1 + F*(x_r2 - x_r3)) and crossover. DE enhances exploration through population-based mutation.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'F',
                        name: 'Mutation Factor (F)',
                        description: 'Scales the difference vector in DE mutation. F=0.5 is typical. Higher F = larger mutations, more exploration. Lower F = smaller, conservative changes.',
                        min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.5
                    },
                    {
                        key: 'CR',
                        name: 'Crossover Rate (CR)',
                        description: 'Probability of taking mutant component vs original. CR=0.9 = high recombination. Lower CR preserves more of original solution.',
                        min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.9
                    }
                ],
                create: (config, hyperparams) => new BatDEHybrid({
                    ...config, ...defaultBatParams,
                    F: 0.5, CR: 0.9,
                    ...hyperparams
                } as BADEConfig)
            },
            {
                id: 'bat-abc',
                name: 'BA + ABC',
                section: '2.3.6',
                description: 'Hybrid with Artificial Bee Colony',
                details: 'Uses ABC employed bee phase for neighbor search and scout phase for abandoning stagnant solutions. Enhances exploitation and prevents stagnation.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'limit',
                        name: 'Abandonment Limit',
                        description: 'Max iterations without improvement before abandoning solution. Low limit = aggressive restart, high exploration. High limit = patient exploitation.',
                        min: 5, max: 50, step: 5, defaultValue: 20
                    }
                ],
                create: (config, hyperparams) => new BatABCHybrid({
                    ...config, ...defaultBatParams,
                    limit: 20,
                    ...hyperparams
                } as BAABCConfig)
            },
            {
                id: 'bat-harmony',
                name: 'BA + HS',
                section: '2.3.5',
                description: 'Hybrid with Harmony Search',
                details: 'Uses HS memory consideration and pitch adjustment operators. Generates new solutions by sampling from population memory with pitch adjustments.',
                optimizationType: 'continuous',
                agentName: 'Bat',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'hmcr',
                        name: 'Memory Rate (HMCR)',
                        description: 'Probability of choosing from harmony memory vs random. HMCR=0.9 means 90% memory, 10% random. Higher = more exploitation of known good solutions.',
                        min: 0.5, max: 0.99, step: 0.05, defaultValue: 0.9
                    },
                    {
                        key: 'par',
                        name: 'Pitch Adjust Rate (PAR)',
                        description: 'Probability of adjusting a value after memory selection. Higher PAR = more fine-tuning around memory values.',
                        min: 0.1, max: 0.7, step: 0.05, defaultValue: 0.3
                    },
                    {
                        key: 'bw',
                        name: 'Bandwidth (bw)',
                        description: 'Size of pitch adjustment: x ± bw×rand. Larger bandwidth = bigger adjustments, more exploration. Smaller = fine-grained local search.',
                        min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.5
                    }
                ],
                create: (config, hyperparams) => new BatHarmonyHybrid({
                    ...config, ...defaultBatParams,
                    hmcr: 0.9, par: 0.3, bw: 0.5,
                    ...hyperparams
                } as BAHSConfig)
            }
        ]
    },
    {
        id: 'ch3-afsa',
        name: 'Chapter 3: Artificial Fish Swarm',
        variants: [
            {
                id: 'afsa-standard',
                name: 'Standard AFSA',
                section: '3.1.2',
                description: 'Preying, Swarming, and Following behaviors',
                details: 'Simulates fish behaviors: Preying (food search), Swarming (moving to center), Following (moving to best neighbor). Avoids overcrowding via delta factor.',
                optimizationType: 'continuous',
                agentName: 'Fish',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'visual',
                        name: 'Visual Range',
                        description: 'How far a fish can "see" neighbors. Larger visual = more fish visible, stronger social behavior. Smaller = more independent movement.',
                        min: 0.5, max: 5.0, step: 0.5, defaultValue: 2.5
                    },
                    {
                        key: 'step',
                        name: 'Step Size',
                        description: 'Maximum movement distance per iteration. Larger steps = faster exploration but may overshoot. Smaller = precise but slow convergence.',
                        min: 0.05, max: 1.0, step: 0.05, defaultValue: 0.3
                    },
                    {
                        key: 'delta',
                        name: 'Crowding Factor (δ)',
                        description: 'Overcrowding threshold. Fish won\'t swarm if area is too crowded (neighbors/total > δ). Lower δ = avoid crowding, higher δ = allow clustering.',
                        min: 0.3, max: 0.9, step: 0.1, defaultValue: 0.618
                    },
                    {
                        key: 'tryNumber',
                        name: 'Try Number',
                        description: 'Attempts to find better position in Preying behavior before giving up. More tries = thorough local search but slower. Fewer = quick decisions.',
                        min: 1, max: 10, step: 1, defaultValue: 5
                    }
                ],
                create: (config, hyperparams) => new AFSAAlgorithm({
                    ...config, ...defaultAFSAParams,
                    ...hyperparams
                } as AFSAConfig)
            },
            {
                id: 'afsa-fast',
                name: 'Fast AFSA',
                section: '3.2.2',
                description: 'Adaptive step size for faster convergence',
                details: 'Step size decreases over iterations. Larger steps early for exploration, smaller steps later for fine-tuning around optima.',
                optimizationType: 'continuous',
                agentName: 'Fish',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'visual',
                        name: 'Visual Range',
                        description: 'How far a fish can "see" neighbors. In Fast AFSA, this stays constant while step size adapts.',
                        min: 0.5, max: 5.0, step: 0.5, defaultValue: 2.5
                    },
                    {
                        key: 'alpha',
                        name: 'Step Decay (α)',
                        description: 'Step size multiplier each iteration: step_new = α × step_old. Values near 1.0 = slow decay. Values near 0.8 = fast decay, quick convergence.',
                        min: 0.8, max: 0.99, step: 0.01, defaultValue: 0.95
                    },
                    {
                        key: 'minStep',
                        name: 'Minimum Step',
                        description: 'Floor for step size to prevent stagnation. Ensures fish can still move even late in optimization.',
                        min: 0.001, max: 0.1, step: 0.005, defaultValue: 0.01
                    }
                ],
                create: (config, hyperparams) => new FastAFSA({
                    ...config, ...defaultAFSAParams,
                    alpha: 0.95, minStep: 0.01,
                    ...hyperparams
                } as FastAFSAConfig)
            },
            {
                id: 'afsa-modified',
                name: 'Modified AFSA',
                section: '3.2.3',
                description: 'Dynamic crowding control',
                details: 'Crowding factor (delta) adapts over iterations. Starts looser to allow exploration, becomes stricter to focus on exploitation.',
                optimizationType: 'continuous',
                agentName: 'Fish',
                objectiveName: 'Rastrigin',
                hyperparameters: [
                    {
                        key: 'visual',
                        name: 'Visual Range',
                        description: 'How far a fish can "see" neighbors. Works with adaptive delta to control swarming behavior.',
                        min: 0.5, max: 5.0, step: 0.5, defaultValue: 2.5
                    },
                    {
                        key: 'step',
                        name: 'Step Size',
                        description: 'Maximum movement distance. In Modified AFSA, delta changes but step stays constant.',
                        min: 0.05, max: 1.0, step: 0.05, defaultValue: 0.3
                    }
                ],
                create: (config, hyperparams) => new ModifiedAFSA({
                    ...config, ...defaultAFSAParams,
                    ...hyperparams
                } as AFSAConfig)
            }
        ]
    }
];

/**
 * Get algorithm by ID
 */
export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
    for (const chapter of registry) {
        const variant = chapter.variants.find(v => v.id === id);
        if (variant) return variant;

        const hybrid = chapter.hybridizations?.find(v => v.id === id);
        if (hybrid) return hybrid;
    }
    return undefined;
}

/**
 * Get all algorithms of a specific optimization type
 */
export function getAlgorithmsByType(type: 'continuous' | 'discrete' | 'binary'): AlgorithmDefinition[] {
    const result: AlgorithmDefinition[] = [];
    for (const chapter of registry) {
        result.push(...chapter.variants.filter(v => v.optimizationType === type));
        if (chapter.hybridizations) {
            result.push(...chapter.hybridizations.filter(v => v.optimizationType === type));
        }
    }
    return result;
}

/**
 * Get default config for an algorithm
 */
export function getDefaultConfig(): Continuous2DConfig {
    return createConfig();
}
