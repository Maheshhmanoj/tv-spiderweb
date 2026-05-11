import './NavigationBar.css';

export default function NavigationBar({ onBack, onForward, canGoBack, canGoForward }) {
  return (
    <div className="nav-bar-container">
      <button className="nav-btn" onClick={onBack} disabled={!canGoBack}>
        &larr; Back
      </button>
      <button className="nav-btn" onClick={onForward} disabled={!canGoForward}>
        Forward &rarr;
      </button>
    </div>
  );
}