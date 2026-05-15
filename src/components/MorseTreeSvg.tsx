import { useMemo } from 'react';
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

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 800;

export function MorseTreeSvg({ currentPath }: { currentPath: string }) {
  const { nodes, links } = useMemo(() => {
    const nodes: TreeNode[] = [];
    const links: TreeLink[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Helper to calculate positions based on depth and index
    const getPosition = (path: string): { x: number; y: number } => {
      const depth = path.length;
      if (depth === 0) {
        return { x: SVG_WIDTH / 2, y: 50 }; // Root at top center
      }

      // Max width we want to use at this depth
      const maxWidth = SVG_WIDTH * 0.9;
      // How many possible nodes at this depth (2^depth)
      const numNodes = Math.pow(2, depth);
      
      // Calculate horizontal index
      // path -> binary string -> number. e.g. '.' -> 0, '-' -> 1
      const binaryStr = path.replace(/\./g, '0').replace(/-/g, '1');
      const index = parseInt(binaryStr, 2);

      // Distribute nodes evenly across the width
      const spacing = maxWidth / numNodes;
      const x = (SVG_WIDTH - maxWidth) / 2 + spacing / 2 + index * spacing;
      const y = 50 + depth * 120; // 120px vertical spacing

      return { x, y };
    };

    // Add Root Node
    const rootNode: TreeNode = { char: 'Ω', path: '', ...getPosition('') };
    nodes.push(rootNode);
    nodeMap.set('', rootNode);

    // Build paths from known letters up to length 4 (since alphabet is max 4, mostly)
    // To ensure a full binary tree structure visually up to depth 4, 
    // let's generate all paths up to depth 4, and map the char if it exists
    const generatePaths = (path: string, depth: number) => {
      if (depth > 4) return;

      if (path !== '') {
        const char = Object.entries(MORSE_CODE_MAP).find(([_, p]) => p === path)?.[0] || '';
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
  }, []);

  return (
    <div className="relative w-full h-full flex justify-center items-center pointer-events-none">
      <svg 
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
        className="w-full max-w-[1200px] h-auto drop-shadow-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <g className="links">
          {links.map((link, idx) => {
            // L-shaped orthogonal connection
            // From bottom of parent to top of child
            const midY = link.from.y + (link.to.y - link.from.y) / 2;
            const pathData = `M ${link.from.x} ${link.from.y + 20} 
                              L ${link.from.x} ${midY} 
                              L ${link.to.x} ${midY} 
                              L ${link.to.x} ${link.to.y - 20}`;
                              
            // Determine if this link is part of the current active path
            const isActive = currentPath.startsWith(link.to.path);

            return (
              <g key={`link-${idx}`}>
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke={isActive ? 'var(--color-primary)' : 'var(--color-border)'} 
                  strokeWidth={isActive ? 3 : 2}
                  className="transition-colors duration-200"
                />
                {/* Link Labels (Dot/Dash) */}
                <text 
                  x={link.from.x + (link.to.x - link.from.x) * 0.5} 
                  y={midY - 5} 
                  fill={isActive ? 'var(--color-primary)' : 'var(--color-border)'}
                  fontSize="16"
                  fontFamily="mono"
                  textAnchor="middle"
                  className="transition-colors duration-200"
                >
                  {link.type === 'dot' ? '·' : '−'}
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

            return (
              <g key={`node-${idx}`} transform={`translate(${node.x}, ${node.y})`}>
                <motion.rect 
                  x={-rectSize/2} 
                  y={-rectSize/2} 
                  width={rectSize} 
                  height={rectSize} 
                  fill="var(--color-background)"
                  stroke={isActive ? 'var(--color-primary)' : 'var(--color-border)'}
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
                  fill={isActive ? 'var(--color-primary)' : (node.char ? 'rgba(255,255,255,0.7)' : 'transparent')}
                  fontSize={isRoot ? "24" : "18"}
                  fontFamily="mono"
                  textAnchor="middle"
                  animate={{
                    textShadow: isActive ? '0 0 8px var(--color-primary)' : 'none'
                  }}
                  className="transition-colors duration-200 font-bold"
                >
                  {node.char}
                </motion.text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
