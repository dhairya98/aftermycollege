import { useState, useEffect } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Ensure we're on the client side
        setIsClient(true);
        
        let observer: IntersectionObserver | null = null;
        let timeoutId: NodeJS.Timeout | null = null;
        
        // Wait for DOM to be fully ready
        const initTOC = () => {
            // Extract headings from the article
            const article = document.querySelector('article');
            if (!article) {
                // Retry after a short delay if article not found
                timeoutId = setTimeout(initTOC, 100);
                return;
            }

            const elements = article.querySelectorAll('h2, h3');
            const extractedHeadings: Heading[] = [];

            elements.forEach((el, index) => {
                // Generate ID if not present
                if (!el.id) {
                    el.id = `heading-${index}-${el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || index}`;
                }
                
                extractedHeadings.push({
                    id: el.id,
                    text: el.textContent || '',
                    level: parseInt(el.tagName[1]),
                });
            });

            setHeadings(extractedHeadings);

            // Set up Intersection Observer for scroll spy
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveId(entry.target.id);
                        }
                    });
                },
                {
                    rootMargin: '-80px 0px -80% 0px',
                    threshold: 0,
                }
            );

            elements.forEach((el) => observer?.observe(el));
        };

        // Initialize after a small delay to ensure DOM is ready
        timeoutId = setTimeout(initTOC, 0);
        
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (observer) {
                observer.disconnect();
            }
        };
    }, []);

    // Don't render until client-side is ready
    if (!isClient || headings.length === 0) {
        return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth',
            });
            setActiveId(id);
        }
    };

    return (
        <nav className="toc-nav">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                On This Page
            </h4>
            <ul className="space-y-2 text-sm">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}
                    >
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => handleClick(e, heading.id)}
                            className={`block py-1 border-l-2 pl-3 transition-all duration-200 hover:text-blue-600 ${
                                activeId === heading.id
                                    ? 'border-blue-600 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

