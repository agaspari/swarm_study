import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getAlgorithm } from '../core/registry';
import { testFunctions } from '../core/test-functions';
import { Optimizer, IterationState, ContinuousSolution, HyperparameterDef, Continuous2DConfig } from '../core/types';

interface UseOptimizerReturn {
    optimizer: Optimizer<ContinuousSolution> | null;
    history: IterationState<ContinuousSolution>[];
    currentAlgoId: string;
    selectAlgorithm: (id: string) => void;
    runOptimization: () => void;
    currentAlgorithm: ReturnType<typeof getAlgorithm> | undefined;
    // Hyperparameter controls
    hyperparameters: HyperparameterDef[];
    hyperparamValues: Record<string, string | number>;
    setHyperparam: (key: string, value: string | number) => void;
    resetHyperparams: () => void;
    // Test function controls
    currentFunctionId: string;
    setFunction: (id: string) => void;
    // Shared tuning controls
    populationSize: number;
    setPopulationSize: (size: number) => void;
    maxIterations: number;
    setMaxIterations: (count: number) => void;
}

/**
 * Get default values from hyperparameter definitions
 */
function getDefaultHyperparams(defs: HyperparameterDef[]): Record<string, string | number> {
    const defaults: Record<string, string | number> = {};
    for (const def of defs) {
        defaults[def.key] = def.defaultValue;
    }
    return defaults;
}

export function useOptimizer(): UseOptimizerReturn {
    const [currentAlgoId, setCurrentAlgoId] = useState('bat-standard');
    const [currentFunctionId, setCurrentFunctionId] = useState('rastrigin');
    const [populationSize, setPopulationSize] = useState(30);
    const [maxIterations, setMaxIterations] = useState(100);
    const [history, setHistory] = useState<IterationState<ContinuousSolution>[]>([]);
    const [hyperparamValues, setHyperparamValues] = useState<Record<string, string | number>>({});
    const optimizerRef = useRef<Optimizer<ContinuousSolution> | null>(null);

    const currentAlgorithm = getAlgorithm(currentAlgoId);

    // Get hyperparameter definitions for current algorithm
    const hyperparameters = useMemo(() => {
        return currentAlgorithm?.hyperparameters ?? [];
    }, [currentAlgorithm]);

    // Initialize hyperparams when algorithm changes
    useEffect(() => {
        const defaults = getDefaultHyperparams(hyperparameters);
        setHyperparamValues(defaults);
    }, [currentAlgoId, hyperparameters]);

    // Define runOptimization at top level (NOT inside useEffect)
    const runOptimization = useCallback(() => {
        const algo = getAlgorithm(currentAlgoId);
        const func = testFunctions[currentFunctionId];
        if (!algo || !func) return;

        // Build config with selected function and settings
        const config: Continuous2DConfig = {
            populationSize,
            type: 'continuous',
            dimensions: 2,
            bounds: func.bounds,
            objectiveFunction: func.func2D
        };

        // Pass hyperparameters to the create function
        const optimizer = algo.create(config, hyperparamValues as Record<string, any>);
        optimizer.run(maxIterations);

        optimizerRef.current = optimizer;
        setHistory(optimizer.getHistory());
    }, [currentAlgoId, currentFunctionId, populationSize, maxIterations, hyperparamValues]);

    const selectAlgorithm = useCallback((id: string) => {
        setCurrentAlgoId(id);
    }, []);

    const setFunction = useCallback((id: string) => {
        setCurrentFunctionId(id);
    }, []);

    const setHyperparam = useCallback((key: string, value: string | number) => {
        setHyperparamValues(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetHyperparams = useCallback(() => {
        const defaults = getDefaultHyperparams(hyperparameters);
        setHyperparamValues(defaults);
    }, [hyperparameters]);

    const hasRunRef = useRef(false);

    // Run optimization once on mount (initial load)
    useEffect(() => {
        if (!hasRunRef.current) {
            runOptimization();
            hasRunRef.current = true;
        }
    }, [runOptimization]);

    return {
        optimizer: optimizerRef.current,
        history,
        currentAlgoId,
        selectAlgorithm,
        runOptimization,
        currentAlgorithm,
        hyperparameters,
        hyperparamValues,
        setHyperparam,
        resetHyperparams,
        currentFunctionId,
        setFunction,
        populationSize,
        setPopulationSize,
        maxIterations,
        setMaxIterations
    };
}
