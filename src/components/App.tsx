import '../styles.css';
import { Sidebar } from './Sidebar';
import { Controls } from './Controls';
import { Stats } from './Stats';
import { AlgorithmInfo } from './AlgorithmInfo';
import { Canvas } from './Canvas';
import { HyperparameterPanel } from './HyperparameterPanel';
import { useOptimizer } from '../hooks/useOptimizer';
import { usePlayback } from '../hooks/usePlayback';

export function App() {
    const {
        history,
        currentAlgoId,
        selectAlgorithm,
        runOptimization,
        currentAlgorithm,
        hyperparameters,
        hyperparamValues,
        setHyperparam,
        resetHyperparams
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
                        <AlgorithmInfo algorithm={currentAlgorithm} />
                    </div>
                </header>

                <div className="visualization-area">
                    <div className="canvas-container">
                        <Canvas
                            history={history}
                            currentFrame={currentFrame}
                            tweenProgress={tweenProgress}
                        />
                        <div className="legend">
                            <div className="legend-item">
                                <span className="legend-dot agent"></span>
                                <span>{currentAlgorithm?.agentName || 'Agent'}</span>
                                <span className="legend-desc">Population members searching the space</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot gbest"></span>
                                <span>Global Best</span>
                                <span className="legend-desc">Best solution found by the swarm so far</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot optimal"></span>
                                <span>Optimal (0,0)</span>
                                <span className="legend-desc">True minimum of the {currentAlgorithm?.objectiveName || 'Rastrigin'} function</span>
                            </div>
                            <div className="legend-item legend-heatmap">
                                <span className="legend-gradient"></span>
                                <span>Fitness Landscape</span>
                                <span className="legend-desc">Blue = low (better), Red = high (worse)</span>
                            </div>
                        </div>
                    </div>

                    <aside className="info-panel">
                        {currentState && (
                            <Stats
                                iteration={currentState.iteration}
                                bestFitness={currentState.globalBestFitness}
                                bestPosition={[currentState.globalBest[0], currentState.globalBest[1]]}
                                functionName={currentAlgorithm?.objectiveName || 'Rastrigin'}
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
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
}
