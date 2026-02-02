import { useState, useMemo } from 'react';
import { Play, Pause, SkipBack, Rewind, FastForward, RotateCcw } from 'lucide-react';
import { AlgorithmPanel } from './AlgorithmPanel';
import { TestFunctionSelector } from './TestFunctionSelector';
import { usePlayback } from '../hooks/usePlayback';
import { IterationState, ContinuousSolution } from '../core/types';

export function CompareView() {
    // Shared settings
    const [functionId, setFunctionId] = useState('rastrigin');
    const [populationSize, setPopulationSize] = useState(30);
    const [maxIterations, setMaxIterations] = useState(100);
    const [runTrigger, setRunTrigger] = useState(0);

    // Track histories for synchronized axes
    const [leftHistory, setLeftHistory] = useState<IterationState<ContinuousSolution>[]>([]);
    const [rightHistory, setRightHistory] = useState<IterationState<ContinuousSolution>[]>([]);

    // Compute shared Y-axis bounds
    const allFitness = useMemo(() => [
        ...leftHistory.map(h => h.globalBestFitness),
        ...rightHistory.map(h => h.globalBestFitness)
    ], [leftHistory, rightHistory]);

    const sharedYMin = allFitness.length > 0 ? Math.min(...allFitness) : undefined;
    const sharedYMax = allFitness.length > 0 ? Math.max(...allFitness) : undefined;

    // Shared playback
    const maxLength = Math.max(leftHistory.length, rightHistory.length);
    const dummyHistory = useMemo(() =>
        Array(maxLength).fill({ iteration: 0 }),
        [maxLength]
    );

    const {
        currentFrame,
        isPlaying,
        tweenProgress,
        togglePlay,
        reset,
        prevFrame,
        nextFrame,
        setSpeed
    } = usePlayback(dummyHistory);

    const handleRun = () => {
        setRunTrigger(t => t + 1);
    };

    return (
        <div className="compare-view">
            <div className="compare-settings-bar">
                <TestFunctionSelector
                    currentFunction={functionId}
                    onChange={setFunctionId}
                />

                <div className="setting-group">
                    <label>Population</label>
                    <input
                        type="number"
                        value={populationSize}
                        onChange={e => setPopulationSize(parseInt(e.target.value) || 30)}
                        min={10} max={100} step={5}
                    />
                </div>

                <div className="setting-group">
                    <label>Iterations</label>
                    <input
                        type="number"
                        value={maxIterations}
                        onChange={e => setMaxIterations(parseInt(e.target.value) || 100)}
                        min={50} max={500} step={25}
                    />
                </div>

                <button className="btn-run" onClick={handleRun}>
                    <RotateCcw size={14} />
                    Run Both
                </button>
            </div>

            <div className="compare-panels">
                <AlgorithmPanel
                    functionId={functionId}
                    populationSize={populationSize}
                    maxIterations={maxIterations}
                    currentFrame={currentFrame}
                    tweenProgress={tweenProgress}
                    yMin={sharedYMin}
                    yMax={sharedYMax}
                    onHistoryChange={setLeftHistory}
                    runTrigger={runTrigger}
                />

                <div className="compare-divider">VS</div>

                <AlgorithmPanel
                    functionId={functionId}
                    populationSize={populationSize}
                    maxIterations={maxIterations}
                    currentFrame={currentFrame}
                    tweenProgress={tweenProgress}
                    yMin={sharedYMin}
                    yMax={sharedYMax}
                    onHistoryChange={setRightHistory}
                    runTrigger={runTrigger}
                />
            </div>

            <div className="compare-playback">
                <button onClick={reset}><SkipBack size={16} /></button>
                <button onClick={prevFrame}><Rewind size={16} /></button>
                <button onClick={togglePlay} className="btn-play">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={nextFrame}><FastForward size={16} /></button>

                <div className="speed-control">
                    <label>Speed</label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        defaultValue={50}
                        onChange={e => setSpeed(parseInt(e.target.value))}
                    />
                </div>

                <span className="frame-info">
                    Frame {currentFrame + 1} / {maxLength || 1}
                </span>
            </div>
        </div>
    );
}
