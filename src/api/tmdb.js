const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const fetchShowDetails = async (id, type = 'tv') => {
  const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} details`);
  }
  
  const data = await response.json();

  return {
    id: data.id,
    title: data.name || data.title,
    posterPath: data.poster_path,
    synopsis: data.overview,
    genres: data.genres,
    genreId: data.genres && data.genres.length > 0 ? data.genres[0].id : null,
    language: data.original_language,
    mainCast: data.credits?.cast?.slice(0, 5) || []
  };
};

export const fetchShowRecommendations = async (id, type = 'tv') => {
  const response = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  const data = await response.json();

  return data.results.map(item => ({
    id: item.id,
    title: item.name || item.title,
    posterPath: item.poster_path,
    genreId: item.genre_ids && item.genre_ids.length > 0 ? item.genre_ids[0] : null
  }));
};

export const searchShow = async (query, type = 'tv') => {
  const response = await fetch(`${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search ${type}`);
  }
  
  const data = await response.json();
  
  if (data.results.length === 0) {
    throw new Error('No results found');
  }
  
  return data.results[0].id;
};