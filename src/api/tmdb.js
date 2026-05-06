const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const fetchShowDetails = async (showId) => {
  const response = await fetch(`${BASE_URL}/tv/${showId}?api_key=${API_KEY}&append_to_response=credits`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch show details');
  }
  
  const data = await response.json();

  return {
    id: data.id,
    title: data.name,
    posterPath: data.poster_path,
    synopsis: data.overview,
    genres: data.genres,
    language: data.original_language,
    mainCast: data.credits.cast.slice(0, 5)
  };
};

export const fetchShowRecommendations = async (showId) => {
  const response = await fetch(`${BASE_URL}/tv/${showId}/recommendations?api_key=${API_KEY}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  const data = await response.json();

  return data.results.map(show => ({
    id: show.id,
    title: show.name,
    posterPath: show.poster_path
  }));
};