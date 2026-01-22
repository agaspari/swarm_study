import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getAlgorithm, getDefaultConfig } from '../core/registry';
import { Optimizer, IterationState, ContinuousSolution, HyperparameterDef } from '../core/types';

interface UseOptimizerReturn {
    optimizer: Optimizer<ContinuousSolution> | null;
    history: IterationState<ContinuousSolution>[];
    currentAlgoId: string;
    selectAlgorithm: (id: string) => void;
    runOptimization: () => void;
    currentAlgorithm: ReturnType<typeof getAlgorithm> | undefined;
    // Hyperparameter controls
    hyperparameters: HyperparameterDef[];
    hyperparamValues: Record<string, number>;
    setHyperparam: (key: string, value: number) => void;
    resetHyperparams: () => void;
}

/**
 * Get default values from hyperparameter definitions
 */
function getDefaultHyperparams(defs: HyperparameterDef[]): Record<string, number> {
    const defaults: Record<string, number> = {};
    for (const def of defs) {
        defaults[def.key] = def.defaultValue;
    }
    return defaults;
}

export function useOptimizer(): UseOptimizerReturn {
    const [currentAlgoId, setCurrentAlgoId] = useState('bat-standard');
    const [history, setHistory] = useState<IterationState<ContinuousSolution>[]>([]);
    const [hyperparamValues, setHyperparamValues] = useState<Record<string, number>>({});
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

    const runOptimization = useCallback(() => {
        const algo = getAlgorithm(currentAlgoId);
        if (!algo) return;

        const config = getDefaultConfig();
        // Pass hyperparameters to the create function
        const optimizer = algo.create(config, hyperparamValues);
        optimizer.run(100);

        optimizerRef.current = optimizer;
        setHistory(optimizer.getHistory());
    }, [currentAlgoId, hyperparamValues]);

    const selectAlgorithm = useCallback((id: string) => {
        setCurrentAlgoId(id);
    }, []);

    const setHyperparam = useCallback((key: string, value: number) => {
        setHyperparamValues(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetHyperparams = useCallback(() => {
        const defaults = getDefaultHyperparams(hyperparameters);
        setHyperparamValues(defaults);
    }, [hyperparameters]);

    // Run optimization when algorithm changes
    useEffect(() => {
        runOptimization();
    }, [currentAlgoId, runOptimization]);

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
        resetHyperparams
    };
}
