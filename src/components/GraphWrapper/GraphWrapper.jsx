import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphWrapper() {
  const [graphData] = useState({
    nodes: [
      { id: '1', name: 'Stranger Things' },
      { id: '2', name: 'The Witcher' },
      { id: '3', name: 'Dark' },
      { id: '4', name: 'Black Mirror' },
      { id: '5', name: 'Mindhunter' }
    ],
    links: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '3', target: '4' },
      { source: '1', target: '5' }
    ]
  });

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeAutoColorBy="id"
    />
  );
}