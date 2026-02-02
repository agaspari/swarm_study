import { useState, useRef, useCallback, useEffect } from 'react';
import { getAlgorithm } from '../core/registry';
import { testFunctions } from '../core/test-functions';
import { Optimizer, IterationState, ContinuousSolution, Continuous2DConfig } from '../core/types';

interface SideState {
    algoId: string;
    history: IterationState<ContinuousSolution>[];
}

interface UseComparisonOptimizerReturn {
    left: SideState;
    right: SideState;
    // Controls
    selectLeftAlgorithm: (id: string) => void;
    selectRightAlgorithm: (id: string) => void;
    runComparison: () => void;
    // Shared settings
    functionId: string;
    setFunction: (id: string) => void;
    populationSize: number;
    setPopulationSize: (size: number) => void;
    maxIterations: number;
    setMaxIterations: (count: number) => void;
}

export function useComparisonOptimizer(): UseComparisonOptimizerReturn {
    // Algorithm selections
    const [leftAlgoId, setLeftAlgoId] = useState('bat-standard');
    const [rightAlgoId, setRightAlgoId] = useState('afsa-standard');

    // Histories
    const [leftHistory, setLeftHistory] = useState<IterationState<ContinuousSolution>[]>([]);
    const [rightHistory, setRightHistory] = useState<IterationState<ContinuousSolution>[]>([]);

    // Shared settings
    const [functionId, setFunctionId] = useState('rastrigin');
    const [populationSize, setPopulationSize] = useState(30);
    const [maxIterations, setMaxIterations] = useState(100);

    // Refs for optimizers
    const leftRef = useRef<Optimizer<ContinuousSolution> | null>(null);
    const rightRef = useRef<Optimizer<ContinuousSolution> | null>(null);

    const runComparison = useCallback(() => {
        const func = testFunctions[functionId];
        if (!func) return;

        const config: Continuous2DConfig = {
            populationSize,
            type: 'continuous',
            dimensions: 2,
            bounds: func.bounds,
            objectiveFunction: func.func2D
        };

        // Run left algorithm
        const leftAlgo = getAlgorithm(leftAlgoId);
        if (leftAlgo) {
            const optimizer = leftAlgo.create(config, {});
            optimizer.run(maxIterations);
            leftRef.current = optimizer;
            setLeftHistory(optimizer.getHistory());
        }

        // Run right algorithm
        const rightAlgo = getAlgorithm(rightAlgoId);
        if (rightAlgo) {
            const optimizer = rightAlgo.create(config, {});
            optimizer.run(maxIterations);
            rightRef.current = optimizer;
            setRightHistory(optimizer.getHistory());
        }
    }, [leftAlgoId, rightAlgoId, functionId, populationSize, maxIterations]);

    // Run comparison once on mount
    useEffect(() => {
        runComparison();
    }, []);

    return {
        left: { algoId: leftAlgoId, history: leftHistory },
        right: { algoId: rightAlgoId, history: rightHistory },
        selectLeftAlgorithm: setLeftAlgoId,
        selectRightAlgorithm: setRightAlgoId,
        runComparison,
        functionId,
        setFunction: setFunctionId,
        populationSize,
        setPopulationSize,
        maxIterations,
        setMaxIterations
    };
}
