import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('tv');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), type);
      setQuery('');
    }
  };

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <select 
        className="type-select" 
        value={type} 
        onChange={(e) => setType(e.target.value)}
      >
        <option value="tv">TV Show</option>
        <option value="movie">Movie</option>
      </select>
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}