import { useEffect, useRef } from 'react';
import { IterationState, ContinuousSolution } from '../core/types';

interface ConvergenceChartProps {
    history: IterationState<ContinuousSolution>[];
    currentFrame: number;
    yMin?: number;
    yMax?: number;
}

export function ConvergenceChart({ history, currentFrame, yMin, yMax }: ConvergenceChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || history.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get dimensions
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.fillStyle = '#252542';
        ctx.fillRect(0, 0, width, height);

        // Extract fitness data
        // Extract fitness data
        const fitnessData = history.map(h => h.globalBestFitness);
        const dataMax = Math.max(...fitnessData);
        const dataMin = Math.min(...fitnessData);

        // Use props overrides if available, else local data range
        const maxFitness = yMax !== undefined ? yMax : dataMax;
        const minFitness = yMin !== undefined ? yMin : dataMin;

        const range = maxFitness - minFitness || 1;

        // Draw axes
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // Draw Y-axis labels
        ctx.fillStyle = '#a0a0b0';
        ctx.font = '10px Consolas, monospace';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight * i) / 4;
            const value = maxFitness - (range * i) / 4;
            ctx.fillText(value.toFixed(2), padding.left - 5, y + 3);

            // Grid line
            ctx.strokeStyle = '#3a3a5a';
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Draw X-axis labels
        ctx.textAlign = 'center';
        const step = Math.ceil(history.length / 5);
        for (let i = 0; i < history.length; i += step) {
            const x = padding.left + (chartWidth * i) / (history.length - 1 || 1);
            ctx.fillText(String(i), x, height - padding.bottom + 15);
        }

        // Draw fitness line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        fitnessData.forEach((fitness, i) => {
            const x = padding.left + (chartWidth * i) / (history.length - 1 || 1);
            const y = padding.top + chartHeight * (1 - (maxFitness - fitness) / range);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw current frame marker
        if (currentFrame < history.length) {
            const x = padding.left + (chartWidth * currentFrame) / (history.length - 1 || 1);
            const fitness = fitnessData[currentFrame];
            const y = padding.top + chartHeight * (1 - (maxFitness - fitness) / range);

            // Vertical line
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();

            // Point
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Value label
            ctx.fillStyle = '#f0f0f0';
            ctx.font = 'bold 11px Consolas, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${fitness.toFixed(4)}`, x + 8, y - 5);
        }

        // Title
        ctx.fillStyle = '#f0f0f0';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Best Fitness', padding.left, 14);

    }, [history, currentFrame, yMin, yMax]);

    return (
        <div className="convergence-chart">
            <canvas
                ref={canvasRef}
                width={280}
                height={120}
            />
        </div>
    );
}
