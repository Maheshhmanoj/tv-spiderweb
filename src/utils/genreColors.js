export const genreColorMap = {
  28: '#ef5350', 
  12: '#ffa726', 
  16: '#42a5f5', 
  35: '#ffee58', 
  80: '#8d6e63', 
  99: '#9e9e9e', 
  18: '#ab47bc', 
  10751: '#66bb6a', 
  14: '#ce93d8', 
  36: '#d4e157', 
  27: '#d32f2f', 
  10402: '#ec407a', 
  9648: '#5c6bc0', 
  10749: '#f48fb1', 
  878: '#26c6da', 
  10770: '#78909c', 
  53: '#ff7043', 
  10752: '#8d6e63', 
  37: '#d7ccc8', 
  10759: '#ef5350', 
  10762: '#42a5f5', 
  10765: '#26c6da', 
  10766: '#f48fb1', 
  10767: '#26a69a', 
  10768: '#8d6e63', 
  default: '#ffffff'
};

export const getGenreColor = (genreId) => {
  return genreColorMap[genreId] || genreColorMap.default;
};