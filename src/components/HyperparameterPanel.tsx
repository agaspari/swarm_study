import { useState } from 'react';
import { Settings, HelpCircle, RotateCcw } from 'lucide-react';
import { HyperparameterDef } from '../core/types';

interface HyperparameterPanelProps {
    hyperparameters: HyperparameterDef[];
    values: Record<string, number>;
    onChange: (key: string, value: number) => void;
    onReset: () => void;
}

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span
            className="tooltip-wrapper"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="tooltip-content">
                    {content}
                </div>
            )}
        </span>
    );
}

export function HyperparameterPanel({
    hyperparameters,
    values,
    onChange,
    onReset
}: HyperparameterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (hyperparameters.length === 0) {
        return null;
    }

    return (
        <div className="hyperparameter-panel">
            <div
                className="hyperparameter-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Settings size={16} />
                <span>Hyperparameters</span>
                <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
            </div>

            {isExpanded && (
                <div className="hyperparameter-content">
                    {hyperparameters.map(param => (
                        <div key={param.key} className="hyperparam-control">
                            <div className="hyperparam-label">
                                <span className="hyperparam-name">
                                    {param.name}
                                    <Tooltip content={param.description}>
                                        <HelpCircle size={14} className="help-icon" />
                                    </Tooltip>
                                </span>
                                <span className="hyperparam-value">
                                    {values[param.key]?.toFixed(2) ?? param.defaultValue.toFixed(2)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={values[param.key] ?? param.defaultValue}
                                onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
                                className="hyperparam-slider"
                            />
                            <div className="hyperparam-range">
                                <span>{param.min}</span>
                                <span>{param.max}</span>
                            </div>
                        </div>
                    ))}
                    <button className="btn-reset-params" onClick={onReset}>
                        <RotateCcw size={14} />
                        Reset to Defaults
                    </button>
                </div>
            )}
        </div>
    );
}
