import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchShowDetails, fetchShowRecommendations, searchShow } from '../../api/tmdb';
import DetailsOverlay from '../DetailsOverlay/DetailsOverlay';
import SearchBar from '../SearchBar/SearchBar';
import Loader from '../Loader/Loader';

export default function GraphWrapper() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedShow, setSelectedShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);
  const [currentMediaType, setCurrentMediaType] = useState('tv');

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
          val: 2
        },
        ...recommendations.map(show => ({
          id: show.id,
          name: show.title,
          posterPath: show.posterPath,
          val: 1
        }))
      ];

      const links = recommendations.map(show => ({
        source: seedShow.id,
        target: show.id
      }));

      setGraphData({ nodes, links });
      setSelectedShow(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphData(66732, 'tv');
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

  const handleSearch = useCallback(async (query, type) => {
    try {
      const newSeedId = await searchShow(query, type);
      await loadGraphData(newSeedId, type);
      if (fgRef.current) {
        fgRef.current.zoomToFit(1000, 50);
      }
    } catch (error) {
      console.error(error);
      alert('Media not found. Please try another search.');
    }
  }, [loadGraphData]);

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

    ctx.strokeStyle = node.val === 2 ? '#ff4081' : '#4fc3f7';
    if (hoverNode === node.id) {
      ctx.strokeStyle = '#ffffff';
    }
    
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, node.x, node.y);

    ctx.globalAlpha = 1;
  }, [hoverNode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && <Loader />}
      <SearchBar onSearch={handleSearch} />
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={renderNode}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
      />
      <DetailsOverlay show={selectedShow} onClose={handleCloseOverlay} />
    </div>
  );
}