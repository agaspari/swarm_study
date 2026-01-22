import { useState, useRef, useCallback, useEffect } from 'react';
import { IterationState, ContinuousSolution } from '../core/types';

interface UsePlaybackReturn {
    currentFrame: number;
    isPlaying: boolean;
    tweenProgress: number;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    reset: () => void;
    prevFrame: () => void;
    nextFrame: () => void;
    setFrame: (frame: number) => void;
    setSpeed: (speed: number) => void;
}

export function usePlayback(history: IterationState<ContinuousSolution>[]): UsePlaybackReturn {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tweenProgress, setTweenProgress] = useState(1);
    const [tweenDuration, setTweenDuration] = useState(300);

    const animationRef = useRef<number | null>(null);
    const lastTimestampRef = useRef(0);

    const maxFrame = Math.max(0, history.length - 1);

    const play = useCallback(() => {
        setIsPlaying(true);
        lastTimestampRef.current = performance.now();
        setTweenProgress(0);
    }, []);

    const pause = useCallback(() => {
        setIsPlaying(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, pause, play]);

    const reset = useCallback(() => {
        pause();
        setCurrentFrame(0);
        setTweenProgress(1);
    }, [pause]);

    const prevFrame = useCallback(() => {
        pause();
        setCurrentFrame(f => Math.max(0, f - 1));
        setTweenProgress(1);
    }, [pause]);

    const nextFrame = useCallback(() => {
        pause();
        setCurrentFrame(f => Math.min(maxFrame, f + 1));
        setTweenProgress(1);
    }, [pause, maxFrame]);

    const setFrame = useCallback((frame: number) => {
        pause();
        setCurrentFrame(Math.max(0, Math.min(maxFrame, frame)));
        setTweenProgress(1);
    }, [pause, maxFrame]);

    const setSpeed = useCallback((speed: number) => {
        setTweenDuration(650 - (speed * 6));
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isPlaying) return;

        const animate = (timestamp: number) => {
            const delta = timestamp - lastTimestampRef.current;
            const newProgress = tweenProgress + delta / tweenDuration;

            if (newProgress >= 1) {
                setTweenProgress(0);
                setCurrentFrame(f => {
                    if (f >= maxFrame) {
                        pause();
                        return f;
                    }
                    return f + 1;
                });
                lastTimestampRef.current = timestamp;
            } else {
                setTweenProgress(newProgress);
            }

            lastTimestampRef.current = timestamp;
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, tweenProgress, tweenDuration, maxFrame, pause]);

    // Reset when history changes
    useEffect(() => {
        setCurrentFrame(0);
        setTweenProgress(1);
        play();
    }, [history, play]);

    return {
        currentFrame,
        isPlaying,
        tweenProgress,
        play,
        pause,
        togglePlay,
        reset,
        prevFrame,
        nextFrame,
        setFrame,
        setSpeed
    };
}
