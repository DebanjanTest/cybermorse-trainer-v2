import { useState, useEffect, useMemo } from 'react';
import { MORSE_CODE_MAP } from '../morse';
import { motion } from 'motion/react';

interface TreeNode {
  char: string;
  path: string; // The dot/dash path to reach this node (e.g., '.-')
  x: number;
  y: number;
}

interface TreeLink {
  from: TreeNode;
  to: TreeNode;
  type: 'dot' | 'dash';
}

export function MorseTreeSvg({ currentPath }: { currentPath: string }) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const svgWidth = isPortrait ? 800 : 2400;
  const svgHeight = isPortrait ? 1800 : 1000;

  const { nodes, links } = useMemo(() => {
    const nodes: TreeNode[] = [];
    const links: TreeLink[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Helper to calculate positions based on depth and index
    const getPosition = (path: string): { x: number; y: number } => {
      const depth = path.length;

      const layerSpacing = isPortrait ? 140 : 160; // Distance between depth levels
      const breadthSpacing = isPortrait ? svgHeight * 0.9 : svgWidth * 0.9;

      if (depth === 0) {
        return isPortrait
          ? { x: 50, y: svgHeight / 2 }
          : { x: svgWidth / 2, y: 50 }; // Root at top center (or left center)
      }

      // Max breadth we want to use at this depth
      // How many possible nodes at this depth (2^depth)
      const numNodes = Math.pow(2, depth);
      
      // Calculate breadth index
      // path -> binary string -> number. e.g. '.' -> 0, '-' -> 1
      const binaryStr = path.replace(/\./g, '0').replace(/-/g, '1');
      const index = parseInt(binaryStr, 2);

      // Distribute nodes evenly across the breadth
      const spacing = breadthSpacing / numNodes;

      if (isPortrait) {
        const x = 50 + depth * layerSpacing;
        const y = (svgHeight - breadthSpacing) / 2 + spacing / 2 + index * spacing;
        return { x, y };
      } else {
        const x = (svgWidth - breadthSpacing) / 2 + spacing / 2 + index * spacing;
        const y = 50 + depth * layerSpacing;
        return { x, y };
      }
    };

    // Add Root Node
    const rootNode: TreeNode = { char: 'Ω', path: '', ...getPosition('') };
    nodes.push(rootNode);
    nodeMap.set('', rootNode);

    // Build paths up to length 5
    const generatePaths = (path: string, depth: number) => {
      if (depth > 5) return;

      if (path !== '') {
        const char = Object.entries(MORSE_CODE_MAP).find(([, p]) => p === path)?.[0] || '';
        const hasDescendant = Object.values(MORSE_CODE_MAP).some(p => p.startsWith(path));

        if (!char && !hasDescendant) return; // Prune dead ends

        const node: TreeNode = { char, path, ...getPosition(path) };
        nodes.push(node);
        nodeMap.set(path, node);

        // Link from parent
        const parentPath = path.slice(0, -1);
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          links.push({
            from: parentNode,
            to: node,
            type: path.endsWith('.') ? 'dot' : 'dash'
          });
        }
      }

      generatePaths(path + '.', depth + 1);
      generatePaths(path + '-', depth + 1);
    };

    generatePaths('', 0);

    return { nodes, links };
  }, [isPortrait, svgWidth, svgHeight]);

  return (
    <div className="relative w-full h-full flex justify-center items-center pointer-events-none">
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[1200px] h-auto drop-shadow-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <g className="links">
          {links.map((link, idx) => {
            const isActive = currentPath.startsWith(link.to.path);

            let pathData;
            let labelX;
            let labelY;

            if (isPortrait) {
              const midX = link.from.x + (link.to.x - link.from.x) / 2;
              pathData = `M ${link.from.x + 20} ${link.from.y}
                          L ${midX} ${link.from.y}
                          L ${midX} ${link.to.y}
                          L ${link.to.x - 20} ${link.to.y}`;
              labelX = midX - 10;
              labelY = link.from.y + (link.to.y - link.from.y) * 0.5 + 5;
            } else {
              const midY = link.from.y + (link.to.y - link.from.y) / 2;
              pathData = `M ${link.from.x} ${link.from.y + 20}
                          L ${link.from.x} ${midY}
                          L ${link.to.x} ${midY}
                          L ${link.to.x} ${link.to.y - 20}`;
              labelX = link.from.x + (link.to.x - link.from.x) * 0.5;
              labelY = midY - 5;
            }

            return (
              <g key={`link-${idx}`}>
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke={isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-colors duration-200"
                />
                {/* Link Labels (Dot/Dash) */}
                <text 
                  x={labelX}
                  y={labelY + 2}
                  fill={isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)'}
                  fontSize="28"
                  fontWeight="bold"
                  fontFamily="mono"
                  textAnchor="middle"
                  className="transition-colors duration-200"
                >
                  {link.type === 'dot' ? '●' : '▬'}
                </text>
              </g>
            );
          })}
        </g>

        <g className="nodes">
          {nodes.map((node, idx) => {
            const isActive = currentPath === node.path || (node.path === '' && currentPath === '');
            const isRoot = node.path === '';
            const rectSize = isRoot ? 50 : 40;
            const displayPath = node.path.replace(/\./g, '●').replace(/-/g, '▬');

            return (
              <g key={`node-${idx}`} transform={`translate(${node.x}, ${node.y})`}>
                <motion.rect 
                  x={-rectSize/2} 
                  y={-rectSize/2} 
                  width={rectSize} 
                  height={rectSize} 
                  fill="var(--color-background)"
                  stroke={isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)'}
                  strokeWidth={isActive ? 3 : 2}
                  animate={{
                    filter: isActive ? 'drop-shadow(0 0 8px var(--color-primary))' : 'drop-shadow(0 0 0px transparent)'
                  }}
                  transition={{ duration: 0.2 }}
                  className="transition-colors duration-200"
                />
                <motion.text 
                  x="0" 
                  y="6" 
                  fill={isActive ? 'var(--color-primary)' : (node.char ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)')}
                  fontSize={isRoot ? "24" : "18"}
                  fontFamily="mono"
                  textAnchor="middle"
                  animate={{
                    textShadow: isActive ? '0 0 8px var(--color-primary)' : 'none'
                  }}
                  className="transition-colors duration-200 font-bold"
                >
                  {node.char || '?'}
                </motion.text>
                <text
                  x="0"
                  y="34"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="12"
                  fontFamily="mono"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isRoot ? 'START' : displayPath}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
