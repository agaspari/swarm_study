import { SkipBack, Rewind, Pause, Play, FastForward, Users, Hash } from 'lucide-react';

interface ControlsProps {
    isPlaying: boolean;
    currentFrame: number;
    maxFrame: number;
    onTogglePlay: () => void;
    onReset: () => void;
    onPrevFrame: () => void;
    onNextFrame: () => void;
    onFrameChange: (frame: number) => void;
    onSpeedChange: (speed: number) => void;
    onRunOptimization: () => void;
    populationSize: number;
    onPopulationSizeChange: (size: number) => void;
    maxIterations: number;
    onMaxIterationsChange: (count: number) => void;
}

export function Controls({
    isPlaying,
    currentFrame,
    maxFrame,
    onTogglePlay,
    onReset,
    onPrevFrame,
    onNextFrame,
    onFrameChange,
    onSpeedChange,
    onRunOptimization,
    populationSize,
    onPopulationSizeChange,
    maxIterations,
    onMaxIterationsChange
}: ControlsProps) {
    return (
        <div className="controls-panel">
            <div className="control-group">
                <label className="control-label">
                    <Users size={12} /> POPULATION SIZE
                </label>
                <div className="frame-control">
                    <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={populationSize}
                        onChange={(e) => onPopulationSizeChange(parseInt(e.target.value))}
                    />
                    <span className="control-value">{populationSize}</span>
                </div>
            </div>

            <div className="control-group">
                <label className="control-label">
                    <Hash size={12} /> ITERATIONS
                </label>
                <div className="frame-control">
                    <input
                        type="range"
                        min={50}
                        max={500}
                        step={25}
                        value={maxIterations}
                        onChange={(e) => onMaxIterationsChange(parseInt(e.target.value))}
                    />
                    <span className="control-value">{maxIterations}</span>
                </div>
            </div>

            <div className="control-group">
                <button id="btn-run" className="btn-run" onClick={onRunOptimization}>
                    Run Optimization
                </button>
            </div>

            <div className="control-group">
                <label className="control-label">PLAYBACK</label>
                <div className="playback-controls">
                    <button id="btn-reset" onClick={onReset}><SkipBack size={16} /></button>
                    <button id="btn-prev" onClick={onPrevFrame}><Rewind size={16} /></button>
                    <button id="btn-play" onClick={onTogglePlay}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button id="btn-next" onClick={onNextFrame}><FastForward size={16} /></button>
                </div>
            </div>

            <div className="control-group">
                <label className="control-label">FRAME</label>
                <div className="frame-control">
                    <input
                        type="range"
                        id="frame-slider"
                        min={0}
                        max={maxFrame}
                        value={currentFrame}
                        onChange={(e) => onFrameChange(parseInt(e.target.value))}
                    />
                    <span id="frame-display">{currentFrame + 1}/{maxFrame + 1}</span>
                </div>
            </div>

            <div className="control-group">
                <label className="control-label">SPEED</label>
                <input
                    type="range"
                    id="speed-slider"
                    min={1}
                    max={100}
                    defaultValue={50}
                    onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                />
            </div>
        </div>
    );
}
