import { useState } from 'react';
import { Settings, HelpCircle, RotateCcw } from 'lucide-react';
import { HyperparameterDef, NumericHyperparameterDef, EnumHyperparameterDef } from '../core/types';

interface HyperparameterPanelProps {
    hyperparameters: HyperparameterDef[];
    values: Record<string, string | number>;
    onChange: (key: string, value: string | number) => void;
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

function isEnumParam(param: HyperparameterDef): param is EnumHyperparameterDef {
    return param.type === 'enum';
}

function NumericControl({
    param,
    value,
    onChange
}: {
    param: NumericHyperparameterDef;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <>
            <div className="hyperparam-label">
                <span className="hyperparam-name">
                    {param.name}
                    <Tooltip content={param.description}>
                        <HelpCircle size={14} className="help-icon" />
                    </Tooltip>
                </span>
                <span className="hyperparam-value">
                    {value.toFixed(2)}
                </span>
            </div>
            <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="hyperparam-slider"
            />
            <div className="hyperparam-range">
                <span>{param.min}</span>
                <span>{param.max}</span>
            </div>
        </>
    );
}

function EnumControl({
    param,
    value,
    onChange
}: {
    param: EnumHyperparameterDef;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <>
            <div className="hyperparam-label">
                <span className="hyperparam-name">
                    {param.name}
                    <Tooltip content={param.description}>
                        <HelpCircle size={14} className="help-icon" />
                    </Tooltip>
                </span>
            </div>
            <select
                className="hyperparam-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {param.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </>
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
                            {isEnumParam(param) ? (
                                <EnumControl
                                    param={param}
                                    value={String(values[param.key] ?? param.defaultValue)}
                                    onChange={(val) => onChange(param.key, val)}
                                />
                            ) : (
                                <NumericControl
                                    param={param}
                                    value={Number(values[param.key] ?? param.defaultValue)}
                                    onChange={(val) => onChange(param.key, val)}
                                />
                            )}
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
