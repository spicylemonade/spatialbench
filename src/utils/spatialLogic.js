// --- Constants ---
export const BLOCK_COLOR = 0xd1d5db; // Light gray
export const EDGE_COLOR = 0x1f2937;  // Dark gray
export const NUM_BLOCKS = 10;        

// --- 3D Voxel Generation Logic (Shepard-Metzler Style) ---
export const calculateCenter = (voxels) => {
  let sumX = 0, sumY = 0, sumZ = 0;
  voxels.forEach(v => { sumX += v[0]; sumY += v[1]; sumZ += v[2]; });
  return [sumX / voxels.length, sumY / voxels.length, sumZ / voxels.length];
};

export const checkConnectivity = (voxels) => {
  if (voxels.length === 0) return true;
  // Use string keys for easy set lookup
  const voxelSet = new Set(voxels.map(v => v.map(n => Math.round(n)).join(',')));
  const startKey = voxels[0].map(n => Math.round(n)).join(',');
  
  const stack = [startKey];
  const visited = new Set([startKey]);
  
  while (stack.length > 0) {
    const currentKey = stack.pop();
    const [cx, cy, cz] = currentKey.split(',').map(Number);
    
    const neighbors = [
      [cx+1, cy, cz], [cx-1, cy, cz],
      [cx, cy+1, cz], [cx, cy-1, cz],
      [cx, cy, cz+1], [cx, cy, cz-1]
    ];
    
    for (const n of neighbors) {
      const key = n.join(',');
      if (voxelSet.has(key) && !visited.has(key)) {
        visited.add(key);
        stack.push(key);
      }
    }
  }
  return visited.size === voxels.length;
};

export const mutateVoxelStructure = (originalVoxels, mutationCount = 2) => {
    // Clone deep and round to integers to avoid floating point drift during mutation logic
    // (Though we subtract center at the end, intermediate steps should be grid-aligned)
    // We assume originalVoxels are somewhat grid aligned relative to each other.
    // Best to work with relative integers.
    
    // 1. Snap to grid relative to first voxel to ensure integer math works
    const v0 = originalVoxels[0];
    let current = originalVoxels.map(v => [
        Math.round(v[0] - v0[0]), 
        Math.round(v[1] - v0[1]), 
        Math.round(v[2] - v0[2])
    ]);

    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

    for (let i = 0; i < mutationCount; i++) {
        // A. Remove a block that maintains connectivity
        const removableIndices = [];
        for (let j = 0; j < current.length; j++) {
            const temp = current.filter((_, idx) => idx !== j);
            if (checkConnectivity(temp)) {
                removableIndices.push(j);
            }
        }
        
        if (removableIndices.length > 0) {
            const removeIdx = removableIndices[Math.floor(Math.random() * removableIndices.length)];
            current.splice(removeIdx, 1);
        }

        // B. Add a block
        let added = false;
        let attempts = 0;
        const existingSet = new Set(current.map(v => v.join(',')));
        
        while (!added && attempts < 50) {
            const source = current[Math.floor(Math.random() * current.length)];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const newPos = [source[0] + dir[0], source[1] + dir[1], source[2] + dir[2]];
            const key = newPos.join(',');
            
            if (!existingSet.has(key)) {
                current.push(newPos);
                existingSet.add(key);
                added = true;
            }
            attempts++;
        }
    }
    
    // Re-center
    const center = calculateCenter(current);
    return current.map(v => [v[0] - center[0], v[1] - center[1], v[2] - center[2]]);
};

export const generateVoxelStructure = () => {
  const voxels = new Set();
  voxels.add('0,0,0');
  const currentVoxels = [[0, 0, 0]];
  const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

  while (currentVoxels.length < NUM_BLOCKS) {
    const sourceIndex = Math.floor(Math.random() * currentVoxels.length);
    const source = currentVoxels[sourceIndex];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const newPos = [source[0] + dir[0], source[1] + dir[1], source[2] + dir[2]];
    const key = newPos.join(',');
    if (!voxels.has(key)) {
      voxels.add(key);
      currentVoxels.push(newPos);
    }
  }
  const center = calculateCenter(currentVoxels);
  return currentVoxels.map(v => [v[0] - center[0], v[1] - center[1], v[2] - center[2]]);
};

// --- 2D Path Generation Logic ---
export const generatePathData = (width, height) => {
  const NODE_COUNT = 20; 
  const NODE_RADIUS = 16; // Circle radius
  const nodes = [];
  
  // 1. Generate Nodes (Circles)
  for(let i=0; i<NODE_COUNT; i++) {
      let x, y, valid = false;
      let attempts = 0;
      while(!valid && attempts < 200) {
          x = Math.random() * (width - 100) + 50;
          y = Math.random() * (height - 100) + 50;
          valid = true;
          // Strict collision detection
          for(const n of nodes) {
              const dx = n.x - x;
              const dy = n.y - y;
              if (Math.sqrt(dx*dx + dy*dy) < 60) valid = false; 
          }
          attempts++;
      }
      nodes.push({ id: i, x, y });
  }

  // 2. Generate Connections with Smooth Bezier Logic
  const availableTargets = [...nodes.map(n => n.id)];
  // Simple shuffle
  for (let i = availableTargets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableTargets[i], availableTargets[j]] = [availableTargets[j], availableTargets[i]];
  }

  const edges = nodes.map((node, idx) => {
      let targetId = availableTargets[idx];
      if (targetId === node.id) {
          targetId = availableTargets[(idx + 1) % NODE_COUNT];
      }
      
      const target = nodes.find(n => n.id === targetId);
      const start = node;
      
      const dx = target.x - start.x;
      const dy = target.y - start.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const nx = -dy / dist;
      const ny = dx / dist;

      // Randomize "Swing"
      const swingMagnitude = Math.max(60, dist * 0.6); 
      const side = Math.random() > 0.5 ? 1 : -1;
      
      // Control Point 1
      const cp1x = start.x + (dx * 0.2) + (nx * swingMagnitude * side);
      const cp1y = start.y + (dy * 0.2) + (ny * swingMagnitude * side);

      // Control Point 2
      const cp2x = target.x - (dx * 0.2) + (nx * swingMagnitude * side);
      const cp2y = target.y - (dy * 0.2) + (ny * swingMagnitude * side);

      // --- Arrow Connection Logic ---
      // We want the line to stop exactly at the circle edge.
      // The angle of approach is determined by the vector from CP2 to Target.
      const vecX = target.x - cp2x;
      const vecY = target.y - cp2y;
      const vecLen = Math.sqrt(vecX*vecX + vecY*vecY);
      
      // Normalize and scale by radius to find the edge point
      const offsetX = (vecX / vecLen) * NODE_RADIUS;
      const offsetY = (vecY / vecLen) * NODE_RADIUS;
      
      const endX = target.x - offsetX;
      const endY = target.y - offsetY;

      return {
        from: node.id,
        to: targetId,
        // Curve ends at the calculated edge point
        d: `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        color: '#374151', // Uniform dark gray
        width: 3, 
      };
  });

  return { nodes, edges, targetId: 0, answerId: edges.find(e => e.from === 0).to };
};
