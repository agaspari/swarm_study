interface StatsProps {
    iteration: number;
    bestFitness: number;
    bestPosition: [number, number];
    functionName: string;
}

export function Stats({ iteration, bestFitness, bestPosition, functionName }: StatsProps) {
    const formatFitness = (f: number) =>
        f < 0.0001 || f > 9999 ? f.toExponential(2) : f.toFixed(4);

    return (
        <div className="stats-panel">
            <div className="stats-header">Statistics</div>
            <div className="stat-row">
                <span className="stat-label">Iteration:</span>
                <span className="stat-value" id="stat-iteration">{iteration}</span>
            </div>
            <div className="stat-row">
                <span className="stat-label">Best Fitness:</span>
                <span className="stat-value" id="stat-fitness">{formatFitness(bestFitness)}</span>
            </div>
            <div className="stat-row">
                <span className="stat-label">Best Position:</span>
                <span className="stat-value" id="stat-position">
                    ({bestPosition[0].toFixed(3)}, {bestPosition[1].toFixed(3)})
                </span>
            </div>
            <div className="stat-row">
                <span className="stat-label">Function:</span>
                <span className="stat-value" id="stat-function">{functionName}</span>
            </div>
        </div>
    );
}
