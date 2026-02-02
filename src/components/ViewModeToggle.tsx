import { Monitor, Columns } from 'lucide-react';

export type ViewMode = 'single' | 'compare';

interface ViewModeToggleProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
    return (
        <div className="view-mode-toggle">
            <button
                className={`toggle-btn ${mode === 'single' ? 'active' : ''}`}
                onClick={() => onChange('single')}
                title="Single Algorithm View"
            >
                <Monitor size={16} />
                <span>Single</span>
            </button>
            <button
                className={`toggle-btn ${mode === 'compare' ? 'active' : ''}`}
                onClick={() => onChange('compare')}
                title="Compare Two Algorithms"
            >
                <Columns size={16} />
                <span>Compare</span>
            </button>
        </div>
    );
}
