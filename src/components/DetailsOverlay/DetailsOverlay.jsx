import './DetailsOverlay.css';

export default function DetailsOverlay({ show, onClose, onExplore }) {
  if (!show) return null;

  return (
    <div className="overlay-container">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      
      {show.posterPath && (
        <img 
          className="overlay-poster" 
          src={`https://image.tmdb.org/t/p/w500${show.posterPath}`} 
          alt={show.title} 
        />
      )}
      
      <h2 className="overlay-title">{show.title}</h2>
      
      <div className="overlay-meta">
        <span>{show.language}</span>
        <span>•</span>
        <span>{show.genres?.map(g => g.name).join(', ')}</span>
      </div>
      
      <p className="overlay-synopsis">{show.synopsis}</p>
      
      <div className="overlay-cast">
        <strong>Starring: </strong>
        <span>{show.mainCast?.map(c => c.name).join(', ')}</span>
      </div>

      <button className="explore-button" onClick={() => onExplore(show.id)}>
        Explore This Web
      </button>
    </div>
  );
}