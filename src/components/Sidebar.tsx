import { BookOpen, ExternalLink } from 'lucide-react';
import { registry } from '../core/registry';
import { AlgorithmDefinition } from '../core/types';

interface SidebarProps {
    currentAlgoId: string;
    onSelectAlgorithm: (id: string) => void;
}

export function Sidebar({ currentAlgoId, onSelectAlgorithm }: SidebarProps) {
    return (
        <aside className="sidebar" id="sidebar">
            {registry.map(chapter => (
                <div key={chapter.id} className="chapter-group">
                    <div className="chapter-header">
                        <BookOpen size={16} /> {chapter.name}
                    </div>
                    <div className="variant-list">
                        {chapter.variants.map(variant => (
                            <VariantButton
                                key={variant.id}
                                variant={variant}
                                isActive={variant.id === currentAlgoId}
                                onClick={() => onSelectAlgorithm(variant.id)}
                            />
                        ))}
                        {chapter.hybridizations && chapter.hybridizations.length > 0 && (
                            <>
                                <div className="hybrid-header">Hybridizations</div>
                                {chapter.hybridizations.map(hybrid => (
                                    <VariantButton
                                        key={hybrid.id}
                                        variant={hybrid}
                                        isActive={hybrid.id === currentAlgoId}
                                        onClick={() => onSelectAlgorithm(hybrid.id)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            ))}
            <div className="sidebar-about" id="sidebar-about">
                <h3>About</h3>
                <p>
                    Based on <em>"Swarm Intelligence: Principles, Advances, and Applications"</em>
                    by Hassanien & Emary.
                </p>
                <a
                    href="https://www.routledge.com/Swarm-Intelligence-Principles-Advances-and-Applications/Hassanien-Emary/p/book/9781498741064"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-book-link"
                >
                    <ExternalLink size={14} />
                    Buy the Book
                </a>
            </div>
        </aside>
    );
}

interface VariantButtonProps {
    variant: AlgorithmDefinition;
    isActive: boolean;
    onClick: () => void;
}

function VariantButton({ variant, isActive, onClick }: VariantButtonProps) {
    return (
        <button
            className={`variant-btn${isActive ? ' active' : ''}`}
            onClick={onClick}
        >
            <span className="section">{variant.section}</span> {variant.name}
        </button>
    );
}
