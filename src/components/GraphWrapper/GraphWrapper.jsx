import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchShowDetails, fetchShowRecommendations, searchShow } from '../../api/tmdb';
import DetailsOverlay from '../DetailsOverlay/DetailsOverlay';
import SearchBar from '../SearchBar/SearchBar';

export default function GraphWrapper() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedShow, setSelectedShow] = useState(null);

  const loadGraphData = useCallback(async (seedId) => {
    try {
      const seedShow = await fetchShowDetails(seedId);
      const recommendations = await fetchShowRecommendations(seedId);

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
    }
  }, []);

  useEffect(() => {
    loadGraphData(66732);
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
      const fullDetails = await fetchShowDetails(node.id);
      setSelectedShow(fullDetails);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSelectedShow(null);
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  }, []);

  const handleSearch = useCallback(async (query) => {
    try {
      const newSeedId = await searchShow(query);
      await loadGraphData(newSeedId);
      if (fgRef.current) {
        fgRef.current.zoomToFit(1000, 50);
      }
    } catch (error) {
      console.error(error);
      alert('Show not found. Please try another search.');
    }
  }, [loadGraphData]);

  const renderNode = useCallback((node, ctx, globalScale) => {
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
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, node.x, node.y);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SearchBar onSearch={handleSearch} />
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={renderNode}
        onNodeClick={handleNodeClick}
      />
      <DetailsOverlay show={selectedShow} onClose={handleCloseOverlay} />
    </div>
  );
}