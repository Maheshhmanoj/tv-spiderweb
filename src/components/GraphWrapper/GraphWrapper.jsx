import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchShowDetails, fetchShowRecommendations, searchShow } from '../../api/tmdb';
import DetailsOverlay from '../DetailsOverlay/DetailsOverlay';
import SearchBar from '../SearchBar/SearchBar';
import Loader from '../Loader/Loader';
import NavigationBar from '../NavigationBar/NavigationBar';
import Starfield from '../Starfield/Starfield';
import { getGenreColor } from '../../utils/genreColors';

export default function GraphWrapper() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedShow, setSelectedShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);
  const [currentMediaType, setCurrentMediaType] = useState('tv');
  
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const loadGraphData = useCallback(async (seedId, mediaType) => {
    setIsLoading(true);
    setCurrentMediaType(mediaType);
    try {
      const seedShow = await fetchShowDetails(seedId, mediaType);
      const recommendations = await fetchShowRecommendations(seedId, mediaType);

      const nodes = [
        { 
          id: seedShow.id, 
          name: seedShow.title, 
          posterPath: seedShow.posterPath,
          genreId: seedShow.genreId,
          val: 2
        },
        ...recommendations.map(show => ({
          id: show.id,
          name: show.title,
          posterPath: show.posterPath,
          genreId: show.genreId,
          val: 1
        }))
      ];

      const links = recommendations.map(show => ({
        source: seedShow.id,
        target: show.id
      }));

      setGraphData({ nodes, links });
      setSelectedShow(null);
      
      if (fgRef.current) {
        setTimeout(() => {
          fgRef.current.zoomToFit(1000, 50);
        }, 100);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await loadGraphData(66732, 'tv');
      setHistory([{ id: 66732, type: 'tv' }]);
      setHistoryIndex(0);
    };
    initializeApp();
  }, [loadGraphData]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(120);
    }
  }, [graphData]);

  const handleNodeClick = useCallback(async (node) => {
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(6, 1000);
    }

    try {
      const fullDetails = await fetchShowDetails(node.id, currentMediaType);
      setSelectedShow(fullDetails);
    } catch (error) {
      console.error(error);
    }
  }, [currentMediaType]);

  const handleCloseOverlay = useCallback(() => {
    setSelectedShow(null);
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  }, []);

  const addToHistory = useCallback((id, type) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ id, type });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleSearch = useCallback(async (query, type) => {
    try {
      const newSeedId = await searchShow(query, type);
      await loadGraphData(newSeedId, type);
      addToHistory(newSeedId, type);
    } catch (error) {
      console.error(error);
      alert('Media not found. Please try another search.');
    }
  }, [loadGraphData, addToHistory]);

  const handleExploreWeb = useCallback(async (id) => {
    await loadGraphData(id, currentMediaType);
    addToHistory(id, currentMediaType);
  }, [currentMediaType, loadGraphData, addToHistory]);

  const handleGoBack = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      loadGraphData(prev.id, prev.type);
    }
  }, [history, historyIndex, loadGraphData]);

  const handleGoForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      loadGraphData(next.id, next.type);
    }
  }, [history, historyIndex, loadGraphData]);

  const handleNodeHover = useCallback((node) => {
    setHoverNode(node ? node.id : null);
  }, []);

  const renderNode = useCallback((node, ctx, globalScale) => {
    const isDimmed = hoverNode !== null && hoverNode !== node.id;
    ctx.globalAlpha = isDimmed ? 0.2 : 1;

    const label = node.name;
    const fontSize = 14 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8);

    ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
    ctx.beginPath();
    ctx.roundRect(
      node.x - bckgDimensions[0] / 2, 
      node.y - bckgDimensions[1] / 2, 
      bckgDimensions[0], 
      bckgDimensions[1], 
      4 / globalScale
    );
    ctx.fill();

    const nodeColor = getGenreColor(node.genreId);
    
    ctx.strokeStyle = nodeColor;
    
    if (hoverNode === node.id) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 / globalScale;
    } else {
      ctx.lineWidth = (node.val === 2 ? 3 : 1.5) / globalScale;
    }
    
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, node.x, node.y);

    ctx.globalAlpha = 1;
  }, [hoverNode]);

  const renderPointerArea = useCallback((node, color, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 14 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.8);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(
      node.x - bckgDimensions[0] / 2, 
      node.y - bckgDimensions[1] / 2, 
      bckgDimensions[0], 
      bckgDimensions[1], 
      4 / globalScale
    );
    ctx.fill();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
      <Starfield />
      {isLoading && <Loader />}
      <NavigationBar 
        onBack={handleGoBack} 
        onForward={handleGoForward} 
        canGoBack={historyIndex > 0} 
        canGoForward={historyIndex < history.length - 1} 
      />
      <SearchBar onSearch={handleSearch} />
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={renderNode}
        nodePointerAreaPaint={renderPointerArea}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
      />
      <DetailsOverlay 
        show={selectedShow} 
        onClose={handleCloseOverlay} 
        onExplore={handleExploreWeb}
      />
    </div>
  );
}