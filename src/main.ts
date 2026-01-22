/**
 * Swarm Intelligence Visualizer
 * 
 * Based on "Swarm Intelligence: Principles, Advances, and Applications"
 * by Hassanien & Emary
 */

import './styles.css';
import { registry, getAlgorithm, getDefaultConfig } from './core/registry';
import { Optimizer, IterationState, ContinuousSolution, AlgorithmDefinition } from './core/types';
import { SwarmCanvas } from './visualization/SwarmCanvas';

class App {
    private canvas: SwarmCanvas;
    private currentAlgoId: string = 'bat-standard';
    private optimizer: Optimizer<ContinuousSolution> | null = null;
    private history: IterationState<ContinuousSolution>[] = [];
    private currentFrame = 0;
    private isPlaying = false;
    private animationId: number | null = null;

    // Tweening
    private tweenProgress = 0;
    private lastTimestamp = 0;
    private tweenDuration = 300;

    // DOM elements
    private btnPlay!: HTMLButtonElement;
    private frameSlider!: HTMLInputElement;
    private frameDisplay!: HTMLSpanElement;
    private statIteration!: HTMLElement;
    private statFitness!: HTMLElement;
    private statPosition!: HTMLElement;
    private algoInfo!: HTMLElement;
    private sidebar!: HTMLElement;

    constructor() {
        const canvasEl = document.getElementById('swarm-canvas') as HTMLCanvasElement;
        this.canvas = new SwarmCanvas(canvasEl);

        this.bindElements();
        this.buildSidebar();
        this.bindEvents();
        this.runOptimization();
    }

    private bindElements(): void {
        this.btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
        this.frameSlider = document.getElementById('frame-slider') as HTMLInputElement;
        this.frameDisplay = document.getElementById('frame-display') as HTMLSpanElement;
        this.statIteration = document.getElementById('stat-iteration')!;
        this.statFitness = document.getElementById('stat-fitness')!;
        this.statPosition = document.getElementById('stat-position')!;
        this.algoInfo = document.getElementById('algo-info')!;
        this.sidebar = document.getElementById('sidebar')!;
    }

    /**
     * Build sidebar from registry
     */
    private buildSidebar(): void {
        // Preserve the about section
        const aboutSection = document.getElementById('sidebar-about');
        this.sidebar.innerHTML = '';

        for (const chapter of registry) {
            const chapterEl = document.createElement('div');
            chapterEl.className = 'chapter-group';

            const header = document.createElement('div');
            header.className = 'chapter-header';
            header.innerHTML = `📖 ${chapter.name}`;
            header.onclick = () => chapterEl.classList.toggle('collapsed');
            chapterEl.appendChild(header);

            const list = document.createElement('div');
            list.className = 'variant-list';

            // Regular variants
            for (const variant of chapter.variants) {
                const btn = this.createVariantButton(variant);
                list.appendChild(btn);
            }

            // Hybridizations
            if (chapter.hybridizations && chapter.hybridizations.length > 0) {
                const hybridHeader = document.createElement('div');
                hybridHeader.className = 'hybrid-header';
                hybridHeader.textContent = 'Hybridizations';
                list.appendChild(hybridHeader);

                for (const hybrid of chapter.hybridizations) {
                    const btn = this.createVariantButton(hybrid);
                    list.appendChild(btn);
                }
            }

            chapterEl.appendChild(list);
            this.sidebar.appendChild(chapterEl);
        }

        // Re-append the about section at the bottom
        if (aboutSection) {
            this.sidebar.appendChild(aboutSection);
        }
    }

    private createVariantButton(variant: AlgorithmDefinition): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'variant-btn' + (variant.id === this.currentAlgoId ? ' active' : '');
        btn.dataset.algo = variant.id;
        btn.innerHTML = `<span class="section">${variant.section}</span> ${variant.name}`;
        btn.onclick = () => this.selectAlgorithm(variant.id);
        return btn;
    }

    private selectAlgorithm(id: string): void {
        this.currentAlgoId = id;

        // Update button states
        document.querySelectorAll('.variant-btn').forEach(btn => {
            btn.classList.toggle('active', (btn as HTMLElement).dataset.algo === id);
        });

        // Update info panel and legend
        const algo = getAlgorithm(id);
        if (algo) {
            this.algoInfo.innerHTML = `
        <p><strong>${algo.name}</strong></p>
        <p class="info-section">Section ${algo.section}</p>
        <p class="info-desc">${algo.description}</p>
        <p class="info-details">${algo.details}</p>
      `;
            // Update dynamic legend
            const legendAgent = document.getElementById('legend-agent-name');
            if (legendAgent) legendAgent.textContent = algo.agentName;

            const statFunction = document.getElementById('stat-function');
            if (statFunction) statFunction.textContent = algo.objectiveName;
        }

        this.runOptimization();
    }

    private bindEvents(): void {
        // Playback controls
        document.getElementById('btn-reset')!.addEventListener('click', () => this.reset());
        document.getElementById('btn-prev')!.addEventListener('click', () => this.prevFrame());
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-next')!.addEventListener('click', () => this.nextFrame());

        // Speed slider
        document.getElementById('speed-slider')!.addEventListener('input', (e) => {
            const speed = parseInt((e.target as HTMLInputElement).value);
            this.tweenDuration = 650 - (speed * 6);
        });

        // Frame slider
        this.frameSlider.addEventListener('input', (e) => {
            this.pause();
            this.currentFrame = parseInt((e.target as HTMLInputElement).value);
            this.tweenProgress = 1;
            this.render();
        });

        // Run button
        document.getElementById('btn-run')!.addEventListener('click', () => this.runOptimization());
    }

    private runOptimization(): void {
        this.pause();

        const algo = getAlgorithm(this.currentAlgoId);
        if (!algo) return;

        // Create optimizer with default config
        const config = getDefaultConfig();
        this.optimizer = algo.create(config);
        this.optimizer.run(100);
        this.history = this.optimizer.getHistory();

        this.currentFrame = 0;
        this.tweenProgress = 1;
        this.frameSlider.max = (this.history.length - 1).toString();
        this.frameSlider.value = '0';
        this.canvas.clearTrail();
        this.render();
        this.play();
    }

    private interpolateState(
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

    private render(): void {
        if (this.history.length === 0) return;

        let state: any;

        if (this.tweenProgress >= 1 || this.currentFrame === 0) {
            const current = this.history[this.currentFrame];
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
            const from = this.history[Math.max(0, this.currentFrame - 1)];
            const to = this.history[this.currentFrame];
            state = this.interpolateState(from, to, this.tweenProgress);
        }

        this.canvas.renderTweened(state, true);

        const targetState = this.history[this.currentFrame];
        this.statIteration.textContent = targetState.iteration.toString();
        // Format fitness appropriately
        const fitness = targetState.globalBestFitness;
        this.statFitness.textContent = fitness < 0.0001 || fitness > 9999
            ? fitness.toExponential(2)
            : fitness.toFixed(4);
        this.statPosition.textContent = `(${targetState.globalBest[0].toFixed(3)}, ${targetState.globalBest[1].toFixed(3)})`;
        this.frameDisplay.textContent = `${this.currentFrame + 1}/${this.history.length}`;
        this.frameSlider.value = this.currentFrame.toString();
    }

    private play(): void {
        this.isPlaying = true;
        this.btnPlay.textContent = '⏸';
        this.lastTimestamp = performance.now();
        this.tweenProgress = 0;
        this.animate(performance.now());
    }

    private pause(): void {
        this.isPlaying = false;
        this.btnPlay.textContent = '▶';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    private togglePlay(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    private animate(timestamp: number): void {
        if (!this.isPlaying) return;

        const delta = timestamp - this.lastTimestamp;
        this.tweenProgress += delta / this.tweenDuration;

        if (this.tweenProgress >= 1) {
            this.tweenProgress = 0;
            this.currentFrame++;

            if (this.currentFrame >= this.history.length) {
                this.currentFrame = this.history.length - 1;
                this.pause();
                return;
            }
        }

        this.lastTimestamp = timestamp;
        this.render();
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }

    private reset(): void {
        this.pause();
        this.currentFrame = 0;
        this.tweenProgress = 1;
        this.canvas.clearTrail();
        this.render();
    }

    private prevFrame(): void {
        this.pause();
        if (this.currentFrame > 0) {
            this.currentFrame--;
            this.tweenProgress = 1;
            this.render();
        }
    }

    private nextFrame(): void {
        this.pause();
        if (this.currentFrame < this.history.length - 1) {
            this.currentFrame++;
            this.tweenProgress = 1;
            this.render();
        }
    }
}

// Start the app
new App();
