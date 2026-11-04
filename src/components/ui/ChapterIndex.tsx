import { chapters } from '@/lib/chapters';

export function ChapterIndex() {
  return (
    <details className="chapter-index">
      <summary>Browse all chapters</summary>
      <nav aria-label="All atlas chapters">
        <ul>
          {chapters.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
