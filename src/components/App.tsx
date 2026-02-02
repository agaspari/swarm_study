import { useState } from 'react';
import '../styles.css';
import { Sidebar } from './Sidebar';
import { Controls } from './Controls';
import { Stats } from './Stats';
import { AlgorithmInfo } from './AlgorithmInfo';
import { Canvas } from './Canvas';
import { HyperparameterPanel } from './HyperparameterPanel';
import { TestFunctionSelector } from './TestFunctionSelector';
import { ConvergenceChart } from './ConvergenceChart';
import { ViewModeToggle, ViewMode } from './ViewModeToggle';
import { CompareView } from './CompareView';
import { useOptimizer } from '../hooks/useOptimizer';
import { usePlayback } from '../hooks/usePlayback';
import { testFunctions } from '../core/test-functions';

export function App() {
    const [viewMode, setViewMode] = useState<ViewMode>('single');

    const {
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
    } = useOptimizer();

    const {
        currentFrame,
        isPlaying,
        tweenProgress,
        togglePlay,
        reset,
        prevFrame,
        nextFrame,
        setFrame,
        setSpeed
    } = usePlayback(history);

    const currentState = history[currentFrame];
    const maxFrame = Math.max(0, history.length - 1);
    const currentFunc = testFunctions[currentFunctionId];

    return (
        <div className="app-container">
            <Sidebar
                currentAlgoId={currentAlgoId}
                onSelectAlgorithm={selectAlgorithm}
            />

            <main className="main-content">
                <header className="header">
                    <div className="header-top">
                        <div>
                            <h1>Swarm Intelligence Visualizer</h1>
                            <p className="subtitle">Interactive visualization of nature-inspired optimization algorithms</p>
                        </div>
                        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                        {viewMode === 'single' && <AlgorithmInfo algorithm={currentAlgorithm} />}
                    </div>
                </header>

                {viewMode === 'single' ? (
                    <div className="visualization-area">
                        <div className="canvas-container">
                            <Canvas
                                history={history}
                                currentFrame={currentFrame}
                                tweenProgress={tweenProgress}
                                functionId={currentFunctionId}
                            />
                            <div className="legend">
                                <div className="legend-item">
                                    <span className="legend-dot agent"></span>
                                    <span>{currentAlgorithm?.agentName || 'Agent'}</span>
                                    <span className="legend-desc">Population members searching</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot gbest"></span>
                                    <span>Global Best</span>
                                    <span className="legend-desc">Best solution found so far</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot optimal"></span>
                                    <span>Optimal</span>
                                    <span className="legend-desc">
                                        ({currentFunc?.globalMinimum.x.join(', ')}) = {currentFunc?.globalMinimum.f}
                                    </span>
                                </div>
                                <div className="legend-item legend-heatmap">
                                    <span className="legend-gradient"></span>
                                    <span>{currentFunc?.name || 'Function'}</span>
                                    <span className="legend-desc">Blue = low (better), Red = high (worse)</span>
                                </div>
                            </div>
                        </div>

                        <aside className="info-panel">
                            <TestFunctionSelector
                                currentFunction={currentFunctionId}
                                onChange={setFunction}
                            />

                            {currentState && (
                                <Stats
                                    iteration={currentState.iteration}
                                    bestFitness={currentState.globalBestFitness}
                                    bestPosition={[currentState.globalBest[0], currentState.globalBest[1]]}
                                    functionName={currentFunc?.name || 'Rastrigin'}
                                />
                            )}

                            <HyperparameterPanel
                                hyperparameters={hyperparameters}
                                values={hyperparamValues}
                                onChange={setHyperparam}
                                onReset={resetHyperparams}
                            />

                            <Controls
                                isPlaying={isPlaying}
                                currentFrame={currentFrame}
                                maxFrame={maxFrame}
                                onTogglePlay={togglePlay}
                                onReset={reset}
                                onPrevFrame={prevFrame}
                                onNextFrame={nextFrame}
                                onFrameChange={setFrame}
                                onSpeedChange={setSpeed}
                                onRunOptimization={runOptimization}
                                populationSize={populationSize}
                                onPopulationSizeChange={setPopulationSize}
                                maxIterations={maxIterations}
                                onMaxIterationsChange={setMaxIterations}
                            />

                            <ConvergenceChart
                                history={history}
                                currentFrame={currentFrame}
                            />
                        </aside>
                    </div>
                ) : (
                    <CompareView />
                )}
            </main>
        </div>
    );
}
