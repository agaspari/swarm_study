/**
 * Swarm Canvas - High-performance canvas rendering for swarm visualization
 */

import { rastrigin2D, ObjectiveFunction2D } from '../core/test-functions';

export class SwarmCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 0;
    private height: number = 0;
    private bounds: [number, number] = [-5.12, 5.12];
    private landscapeImage: ImageData | null = null;
    private func: ObjectiveFunction2D = rastrigin2D;

    // Trail for global best
    private trailPoints: Array<{ x: number, y: number }> = [];
    private maxTrailLength = 50;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        this.ctx = ctx;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Update the test function and regenerate landscape
     */
    public setFunction(func: ObjectiveFunction2D, bounds: { min: number; max: number }): void {
        this.func = func;
        this.bounds = [bounds.min, bounds.max];
        this.generateLandscape();
        this.clearTrail();
    }

    private resize(): void {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (!rect) return;

        const size = Math.min(rect.width - 32, rect.height - 32, 700);
        this.canvas.width = size;
        this.canvas.height = size;
        this.width = size;
        this.height = size;

        // Regenerate landscape
        this.generateLandscape();
    }

    private generateLandscape(): void {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        const [min, max] = this.bounds;
        const range = max - min;

        // Calculate min/max for normalization
        let minVal = Infinity, maxVal = -Infinity;
        const values: number[] = [];

        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                const x = min + (px / this.width) * range;
                const y = min + ((this.height - py) / this.height) * range;
                const val = Math.log1p(this.func(x, y));
                values.push(val);
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            }
        }

        // Create colorful gradient
        for (let i = 0; i < values.length; i++) {
            const normalized = (values[i] - minVal) / (maxVal - minVal);
            const [r, g, b] = this.viridisColor(normalized);
            const idx = i * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }

        this.landscapeImage = imageData;
    }

    private viridisColor(t: number): [number, number, number] {
        // Improved colormap: Dark blue (optimal) -> Cyan -> Yellow -> Red (worst)
        // t=0 is best (dark blue), t=1 is worst (red)
        if (t < 0.25) {
            const s = t / 0.25;
            return [20, Math.floor(20 + s * 60), Math.floor(80 + s * 100)];
        } else if (t < 0.5) {
            const s = (t - 0.25) / 0.25;
            return [Math.floor(20 + s * 30), Math.floor(80 + s * 100), Math.floor(180 - s * 30)];
        } else if (t < 0.75) {
            const s = (t - 0.5) / 0.25;
            return [Math.floor(50 + s * 150), Math.floor(180 + s * 50), Math.floor(150 - s * 100)];
        } else {
            const s = (t - 0.75) / 0.25;
            return [Math.floor(200 + s * 55), Math.floor(230 - s * 100), Math.floor(50 - s * 30)];
        }
    }

    private worldToScreen(x: number, y: number): [number, number] {
        const [min, max] = this.bounds;
        const range = max - min;
        const sx = ((x - min) / range) * this.width;
        const sy = this.height - ((y - min) / range) * this.height;
        return [sx, sy];
    }

    public render(state: { bats: Array<{ x: number, y: number, vx: number, vy: number }>, bestX: number, bestY: number, iteration: number }, showVelocities: boolean = true): void {
        const ctx = this.ctx;

        // Clear and draw landscape
        if (this.landscapeImage) {
            ctx.putImageData(this.landscapeImage, 0, 0);
        }

        // Add slight darkening overlay for better particle visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Update and draw trail
        this.trailPoints.push({ x: state.bestX, y: state.bestY });
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }

        if (this.trailPoints.length > 1) {
            ctx.beginPath();
            const [sx0, sy0] = this.worldToScreen(this.trailPoints[0].x, this.trailPoints[0].y);
            ctx.moveTo(sx0, sy0);

            for (let i = 1; i < this.trailPoints.length; i++) {
                const [sx, sy] = this.worldToScreen(this.trailPoints[i].x, this.trailPoints[i].y);
                ctx.lineTo(sx, sy);
            }

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw bats
        for (const p of state.bats) {
            const [sx, sy] = this.worldToScreen(p.x, p.y);

            // Velocity arrow
            if (showVelocities) {
                const scale = 50;
                const vx = p.vx * scale;
                const vy = -p.vy * scale; // Flip y for screen coords

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + vx, sy + vy);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Particle dot
            ctx.beginPath();
            ctx.arc(sx, sy, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Draw global best (star)
        const [gx, gy] = this.worldToScreen(state.bestX, state.bestY);
        this.drawStar(gx, gy, 5, 15, 7);

        // Iteration label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 120, 30);
        ctx.fillStyle = '#f0f0f0';
        ctx.font = '14px Consolas, monospace';
        ctx.fillText(`Iteration: ${state.iteration}`, 20, 30);
    }

    private drawStar(cx: number, cy: number, spikes: number, outerR: number, innerR: number): void {
        const ctx = this.ctx;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);

        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerR;
            let y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();

        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    public clearTrail(): void {
        this.trailPoints = [];
    }

    /**
     * Render an interpolated (tweened) state for smooth animation
     */
    public renderTweened(state: {
        particles: Array<{ x: number; y: number; vx: number; vy: number }>;
        gbestX: number;
        gbestY: number;
        gbestFitness: number;
        iteration: number;
    }, showVelocities: boolean = true): void {
        const ctx = this.ctx;

        // Clear and draw landscape
        if (this.landscapeImage) {
            ctx.putImageData(this.landscapeImage, 0, 0);
        }

        // Slight darkening overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw trail (but don't add new points during tweening - add only at frame boundaries)
        if (this.trailPoints.length > 1) {
            ctx.beginPath();
            const [sx0, sy0] = this.worldToScreen(this.trailPoints[0].x, this.trailPoints[0].y);
            ctx.moveTo(sx0, sy0);

            for (let i = 1; i < this.trailPoints.length; i++) {
                const [sx, sy] = this.worldToScreen(this.trailPoints[i].x, this.trailPoints[i].y);
                ctx.lineTo(sx, sy);
            }

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw particles with glow effect
        for (const p of state.particles) {
            const [sx, sy] = this.worldToScreen(p.x, p.y);

            // Velocity arrow
            if (showVelocities && (p.vx !== 0 || p.vy !== 0)) {
                const scale = 50;
                const vx = p.vx * scale;
                const vy = -p.vy * scale;

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + vx, sy + vy);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Particle glow
            const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.beginPath();
            ctx.arc(sx, sy, 12, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Particle core
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw global best (star)
        const [gx, gy] = this.worldToScreen(state.gbestX, state.gbestY);
        this.drawStar(gx, gy, 5, 15, 7);

        // Iteration label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 120, 30);
        ctx.fillStyle = '#f0f0f0';
        ctx.font = '14px Consolas, monospace';
        ctx.fillText(`Iteration: ${state.iteration}`, 20, 30);
    }

    /**
     * Add a point to the global best trail (call at frame boundaries only)
     */
    public addTrailPoint(x: number, y: number): void {
        this.trailPoints.push({ x, y });
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }
    }
}
