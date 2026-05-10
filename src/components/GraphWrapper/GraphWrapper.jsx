import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchShowDetails, fetchShowRecommendations } from '../../api/tmdb';

export default function GraphWrapper() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const loadSeedData = async () => {
      try {
        const seedId = 66732;
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
      } catch (error) {
        console.error(error);
      }
    };

    loadSeedData();
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(120);
    }
  }, [graphData]);

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      nodeLabel="name"
      nodeAutoColorBy="id"
      nodeRelSize={6}
    />
  );
}