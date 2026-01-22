import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { AlgorithmDefinition } from '../core/types';

interface AlgorithmInfoProps {
    algorithm: AlgorithmDefinition | undefined;
}

export function AlgorithmInfo({ algorithm }: AlgorithmInfoProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!algorithm) {
        return null;
    }

    return (
        <>
            <button
                className="algo-info-toggle"
                onClick={() => setIsOpen(true)}
                title="View algorithm details"
            >
                <Info size={18} />
                <span className="algo-name">{algorithm.name}</span>
                <span className="algo-section">§{algorithm.section}</span>
            </button>

            {isOpen && (
                <div className="algo-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="algo-modal" onClick={e => e.stopPropagation()}>
                        <div className="algo-modal-header">
                            <h2>{algorithm.name}</h2>
                            <button
                                className="algo-modal-close"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="algo-modal-content">
                            <p className="algo-section-tag">Section {algorithm.section}</p>
                            <p className="algo-description">{algorithm.description}</p>
                            <div className="algo-details">
                                <h3>How it works</h3>
                                <p>{algorithm.details}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
