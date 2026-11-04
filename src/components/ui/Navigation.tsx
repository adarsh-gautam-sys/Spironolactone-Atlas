import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
const links = [
  ['story', 'The story'],
  ['reporting', 'Reporting data'],
  ['evidence', 'Evidence'],
  ['methods', 'Methods'],
  ['sources', 'Sources'],
] as const;
export function Navigation() {
  const [active, setActive] = useState('');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let selected = '';
      for (const section of document.querySelectorAll<HTMLElement>(
        '[data-chapter]',
      ))
        if (section.getBoundingClientRect().top < 220)
          selected = section.dataset.chapter ?? '';
      setActive(selected);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <header className="site-header page-width">
      <a className="wordmark" href="#top">
        Spironolactone Atlas
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
          >
            {label}
            {id === 'sources' && <ArrowUpRight size={20} />}
          </a>
        ))}
      </nav>
      <details className="mobile-navigation">
        <summary>
          Chapters <ChevronDown size={18} />
        </summary>
        <nav aria-label="Mobile chapters">
          {[
            ...links.slice(0, 3),
            ['research', 'Research activity'],
            ['interactions', 'Interactions'],
            ...links.slice(3),
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'location' : undefined}
              onClick={(event) => {
                event.currentTarget.closest('details')?.removeAttribute('open');
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </details>
    </header>
  );
}
