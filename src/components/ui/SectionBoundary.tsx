import { Component, type ReactNode } from 'react';
import { sourcePath } from '@/lib/format';
export class SectionBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="load-error" role="alert">
        <h2>The atlas sections could not be displayed.</h2>
        <p>Reload the page to try again. The data exports remain available.</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
        <p>
          <a href={sourcePath('manifest', 'json')}>Open the data manifest</a>
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
