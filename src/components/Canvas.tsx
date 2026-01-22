import { useEffect, useRef, useCallback } from 'react';
import { SwarmCanvas } from '../visualization/SwarmCanvas';
import { IterationState, ContinuousSolution } from '../core/types';

interface CanvasProps {
    history: IterationState<ContinuousSolution>[];
    currentFrame: number;
    tweenProgress: number;
    onCanvasReady?: (canvas: SwarmCanvas) => void;
}

export function Canvas({ history, currentFrame, tweenProgress, onCanvasReady }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const swarmCanvasRef = useRef<SwarmCanvas | null>(null);

    // Initialize SwarmCanvas
    useEffect(() => {
        if (canvasRef.current && !swarmCanvasRef.current) {
            swarmCanvasRef.current = new SwarmCanvas(canvasRef.current);
            onCanvasReady?.(swarmCanvasRef.current);
        }
    }, [onCanvasReady]);

    // Render current state
    useEffect(() => {
        if (!swarmCanvasRef.current || history.length === 0) return;

        const canvas = swarmCanvasRef.current;
        let state: any;

        if (tweenProgress >= 1 || currentFrame === 0) {
            const current = history[currentFrame];
            if (!current) return;

            state = {
                particles: current.agents.map(a => ({
                    x: a.position[0],
                    y: a.position[1],
                    vx: a.velocity?.[0] || 0,
                    vy: a.velocity?.[1] || 0
                })),
                gbestX: current.globalBest[0],
                gbestY: current.globalBest[1],
                gbestFitness: current.globalBestFitness,
                iteration: current.iteration
            };
        } else {
            const from = history[Math.max(0, currentFrame - 1)];
            const to = history[currentFrame];
            if (!from || !to) return;

            state = interpolateState(from, to, tweenProgress);
        }

        canvas.renderTweened(state, true);
    }, [history, currentFrame, tweenProgress]);

    // Clear trail when history changes
    useEffect(() => {
        if (swarmCanvasRef.current) {
            swarmCanvasRef.current.clearTrail();
        }
    }, [history]);

    return (
        <canvas
            ref={canvasRef}
            id="swarm-canvas"
            className="swarm-canvas"
        />
    );
}

function interpolateState(
    from: IterationState<ContinuousSolution>,
    to: IterationState<ContinuousSolution>,
    t: number
): any {
    const eased = 1 - Math.pow(1 - t, 3);

    const particles = from.agents.map((a, i) => {
        const target = to.agents[i];
        return {
            x: a.position[0] + (target.position[0] - a.position[0]) * eased,
            y: a.position[1] + (target.position[1] - a.position[1]) * eased,
            vx: (a.velocity?.[0] || 0) + ((target.velocity?.[0] || 0) - (a.velocity?.[0] || 0)) * eased,
            vy: (a.velocity?.[1] || 0) + ((target.velocity?.[1] || 0) - (a.velocity?.[1] || 0)) * eased,
        };
    });

    return {
        particles,
        gbestX: from.globalBest[0] + (to.globalBest[0] - from.globalBest[0]) * eased,
        gbestY: from.globalBest[1] + (to.globalBest[1] - from.globalBest[1]) * eased,
        gbestFitness: to.globalBestFitness,
        iteration: to.iteration
    };
}
