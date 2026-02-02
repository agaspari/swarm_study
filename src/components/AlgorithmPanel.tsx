import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from './Canvas';
import { ConvergenceChart } from './ConvergenceChart';
import { HyperparameterPanel } from './HyperparameterPanel';
import { getAlgorithm, registry } from '../core/registry';
import { testFunctions } from '../core/test-functions';
import { Optimizer, IterationState, ContinuousSolution, HyperparameterDef, Continuous2DConfig } from '../core/types';

interface AlgorithmPanelProps {
    // Shared settings
    functionId: string;
    populationSize: number;
    maxIterations: number;
    // Playback state (shared)
    currentFrame: number;
    tweenProgress: number;
    // Synchronization
    yMin?: number;
    yMax?: number;
    onHistoryChange?: (history: IterationState<ContinuousSolution>[]) => void;
    // Run trigger
    runTrigger: number;
}

function getDefaultHyperparams(defs: HyperparameterDef[]): Record<string, string | number> {
    const defaults: Record<string, string | number> = {};
    for (const def of defs) {
        defaults[def.key] = def.defaultValue;
    }
    return defaults;
}

export function AlgorithmPanel({
    functionId,
    populationSize,
    maxIterations,
    currentFrame,
    tweenProgress,
    yMin,
    yMax,
    onHistoryChange,
    runTrigger
}: AlgorithmPanelProps) {
    const [algoId, setAlgoId] = useState('bat-standard');
    const [history, setHistory] = useState<IterationState<ContinuousSolution>[]>([]);
    const [hyperparamValues, setHyperparamValues] = useState<Record<string, string | number>>({});
    const optimizerRef = useRef<Optimizer<ContinuousSolution> | null>(null);

    const currentAlgorithm = getAlgorithm(algoId);

    const hyperparameters = useMemo(() => {
        return currentAlgorithm?.hyperparameters ?? [];
    }, [currentAlgorithm]);

    // Initialize hyperparams when algorithm changes
    useEffect(() => {
        const defaults = getDefaultHyperparams(hyperparameters);
        setHyperparamValues(defaults);
    }, [algoId, hyperparameters]);

    // Run optimization
    const runOptimization = useCallback(() => {
        const algo = getAlgorithm(algoId);
        const func = testFunctions[functionId];
        if (!algo || !func) return;

        const config: Continuous2DConfig = {
            populationSize,
            type: 'continuous',
            dimensions: 2,
            bounds: func.bounds,
            objectiveFunction: func.func2D
        };

        const optimizer = algo.create(config, hyperparamValues as Record<string, any>);
        optimizer.run(maxIterations);

        optimizerRef.current = optimizer;
        const newHistory = optimizer.getHistory();
        setHistory(newHistory);
        onHistoryChange?.(newHistory);
    }, [algoId, functionId, populationSize, maxIterations, hyperparamValues, onHistoryChange]);

    // Run when trigger changes
    useEffect(() => {
        if (runTrigger > 0) {
            runOptimization();
        }
    }, [runTrigger, runOptimization]);

    const setHyperparam = useCallback((key: string, value: string | number) => {
        setHyperparamValues(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetHyperparams = useCallback(() => {
        const defaults = getDefaultHyperparams(hyperparameters);
        setHyperparamValues(defaults);
    }, [hyperparameters]);

    // Flatten all algorithms for dropdown
    const allAlgorithms = registry.flatMap(chapter => [
        ...chapter.variants,
        ...(chapter.hybridizations || [])
    ]);

    const safeFrame = Math.min(currentFrame, Math.max(0, history.length - 1));

    return (
        <div className="algorithm-panel">
            <div className="panel-header">
                <select
                    value={algoId}
                    onChange={e => setAlgoId(e.target.value)}
                    className="algo-select"
                >
                    {allAlgorithms.map(algo => (
                        <option key={algo.id} value={algo.id}>
                            {algo.name}
                        </option>
                    ))}
                </select>
                <span className="algo-section-badge">§{currentAlgorithm?.section}</span>
            </div>

            <div className="panel-canvas">
                <Canvas
                    history={history}
                    currentFrame={safeFrame}
                    tweenProgress={tweenProgress}
                    functionId={functionId}
                />
            </div>

            <ConvergenceChart
                history={history}
                currentFrame={safeFrame}
                yMin={yMin}
                yMax={yMax}
            />

            <div className="panel-stats">
                {history[safeFrame] && (
                    <span className="best-fitness">
                        Best: {history[safeFrame].globalBestFitness.toFixed(6)}
                    </span>
                )}
            </div>

            <HyperparameterPanel
                hyperparameters={hyperparameters}
                values={hyperparamValues}
                onChange={setHyperparam}
                onReset={resetHyperparams}
            />
        </div>
    );
}
