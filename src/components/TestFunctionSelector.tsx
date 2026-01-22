import { useState } from 'react';
import { FlaskConical, ChevronDown } from 'lucide-react';
import { testFunctions } from '../core/test-functions';

interface TestFunctionSelectorProps {
    currentFunction: string;
    onChange: (functionId: string) => void;
}

export function TestFunctionSelector({ currentFunction, onChange }: TestFunctionSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentFunc = testFunctions[currentFunction];
    const functionList = Object.entries(testFunctions);

    return (
        <div className="function-selector">
            <div
                className="function-selector-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FlaskConical size={16} />
                <div className="function-info">
                    <span className="function-name">{currentFunc?.name || 'Select Function'}</span>
                    <span className="function-desc">{currentFunc?.description}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </div>

            {isOpen && (
                <div className="function-dropdown">
                    {functionList.map(([id, func]) => (
                        <button
                            key={id}
                            className={`function-option ${id === currentFunction ? 'active' : ''}`}
                            onClick={() => {
                                onChange(id);
                                setIsOpen(false);
                            }}
                        >
                            <div className="function-option-header">
                                <span className="function-option-name">{func.name}</span>
                                <span className="function-bounds">
                                    [{func.bounds.min}, {func.bounds.max}]
                                </span>
                            </div>
                            <div className="function-option-desc">{func.description}</div>
                            <div className="function-optimal">
                                Optimal: ({func.globalMinimum.x.join(', ')}) = {func.globalMinimum.f}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
