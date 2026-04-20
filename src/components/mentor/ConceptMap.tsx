import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
}

interface ConceptMapProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
}

export function ConceptMap({ data }: ConceptMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Add Zoom behavior
    const g = svg.append('g');
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }) as any);

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#3b82f6')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', d => Math.sqrt(d.value || 1) * 2);

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node-group')
      .call(drag(simulation) as any);

    // Glowing circle
    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => d.group === 1 ? '#3b82f6' : '#10b981')
      .style('filter', 'drop-shadow(0 0 5px currentColor)');

    node.append('text')
      .text(d => d.id)
      .attr('x', 14)
      .attr('y', 4)
      .style('font-size', '11px')
      .style('fill', '#f8fafc')
      .style('font-weight', '700')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="professional-card border-accent-blue/20 bg-accent-blue/5 overflow-hidden">
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
         <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Knowledge Neural Path</span>
         <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-blue" /><span className="text-[9px] text-text-dim uppercase">Core</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-green" /><span className="text-[9px] text-text-dim uppercase">Related</span></div>
         </div>
      </div>
      <svg ref={svgRef} className="w-full h-[400px] cursor-move" />
    </div>
  );
}
