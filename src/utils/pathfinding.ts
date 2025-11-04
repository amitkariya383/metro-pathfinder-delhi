import { Station, Line, Route, RouteSegment } from '@/types/metro';

interface GraphNode {
  station: Station;
  neighbors: Map<string, { station: Station; time: number; line: string }>;
}

class MetroGraph {
  private nodes: Map<string, GraphNode> = new Map();

  constructor(stations: Station[], lines: Line[]) {
    console.log('Building metro graph with', stations.length, 'stations and', lines.length, 'lines');
    
    // Create nodes for all stations
    stations.forEach(station => {
      this.nodes.set(station.id, {
        station,
        neighbors: new Map()
      });
    });

    console.log('Created nodes for', this.nodes.size, 'stations');

    // Build connections based on lines
    lines.forEach(line => {
      console.log(`Building connections for ${line.name} (${line.id}) with ${line.stations.length} stations`);
      for (let i = 0; i < line.stations.length - 1; i++) {
        const from = line.stations[i];
        const to = line.stations[i + 1];
        
        // Average time between stations: 2-3 minutes
        const time = 2.5;
        
        // Add bidirectional edges
        const fromNode = this.nodes.get(from);
        const toNode = this.nodes.get(to);
        
        if (fromNode && toNode) {
          fromNode.neighbors.set(to, { 
            station: toNode.station, 
            time, 
            line: line.id 
          });
          toNode.neighbors.set(from, { 
            station: fromNode.station, 
            time, 
            line: line.id 
          });
        } else {
          console.warn(`Missing station node: ${from} or ${to} on line ${line.id}`);
        }
      }
    });

    // Log some key interchange stations for debugging
    const ndNode = this.nodes.get('ND');
    const cpNode = this.nodes.get('CP');
    const nanNode = this.nodes.get('NAN');
    
    console.log('ND (New Delhi) neighbors:', ndNode ? Array.from(ndNode.neighbors.keys()) : 'NOT FOUND');
    console.log('CP (Rajiv Chowk) neighbors:', cpNode ? Array.from(cpNode.neighbors.keys()) : 'NOT FOUND');
    console.log('NAN (New Ashok Nagar) neighbors:', nanNode ? Array.from(nanNode.neighbors.keys()) : 'NOT FOUND');
  }

  findRoutes(originId: string, destinationId: string): Route[] {
    console.log(`Finding routes from ${originId} to ${destinationId}`);
    const routes: Route[] = [];
    
    // Find shortest path using Dijkstra's algorithm
    const shortestPath = this.dijkstra(originId, destinationId);
    if (shortestPath) {
      console.log('Found shortest path:', shortestPath);
      routes.push(shortestPath);
    } else {
      console.warn('No shortest path found');
    }

    // Find alternative paths (different transfer points)
    const altPath = this.findAlternativePath(originId, destinationId, shortestPath);
    if (altPath) {
      console.log('Found alternative path:', altPath);
      routes.push(altPath);
    }

    return routes;
  }

  private dijkstra(originId: string, destinationId: string): Route | null {
    console.log(`🔍 Dijkstra: Finding path from ${originId} to ${destinationId}`);
    
    const originNode = this.nodes.get(originId);
    const destNode = this.nodes.get(destinationId);
    
    if (!originNode) {
      console.error(`❌ Origin station ${originId} not found in graph`);
      return null;
    }
    if (!destNode) {
      console.error(`❌ Destination station ${destinationId} not found in graph`);
      return null;
    }
    
    console.log(`✅ Both stations found. Origin neighbors: ${originNode.neighbors.size}, Dest neighbors: ${destNode.neighbors.size}`);
    console.log(`Origin (${originId}) neighbors:`, Array.from(originNode.neighbors.entries()).map(([id, data]) => `${id} (${data.line})`));
    console.log(`Destination (${destinationId}) neighbors:`, Array.from(destNode.neighbors.entries()).map(([id, data]) => `${id} (${data.line})`));
    
    const distances = new Map<string, number>();
    const previous = new Map<string, { stationId: string; line: string } | null>();
    const unvisited = new Set<string>();

    this.nodes.forEach((_, id) => {
      distances.set(id, Infinity);
      previous.set(id, null);
      unvisited.add(id);
    });
    distances.set(originId, 0);
    
    console.log(`Initial setup: Total nodes: ${this.nodes.size}, Unvisited: ${unvisited.size}`);
    console.log(`Origin ${originId} distance:`, distances.get(originId));
    console.log(`Is origin in unvisited?`, unvisited.has(originId));
    console.log(`First 5 unvisited stations:`, Array.from(unvisited).slice(0, 5));
    
    let iterations = 0;

    while (unvisited.size > 0) {
      iterations++;
      
      // Find unvisited node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      if (iterations === 1) {
        console.log(`🔎 First iteration - finding minimum distance node from ${unvisited.size} unvisited nodes`);
        let sampledNodes = 0;
        unvisited.forEach(id => {
          const dist = distances.get(id) || Infinity;
          if (sampledNodes < 5) {
            console.log(`  Node ${id}: distance = ${dist}`);
            sampledNodes++;
          }
          if (dist < minDistance) {
            minDistance = dist;
            current = id;
          }
        });
        console.log(`  Selected: ${current} with distance ${minDistance}`);
      } else {
        unvisited.forEach(id => {
          const dist = distances.get(id) || Infinity;
          if (dist < minDistance) {
            minDistance = dist;
            current = id;
          }
        });
      }

      if (current === null) {
        console.warn(`⚠️ No reachable nodes found after ${iterations} iterations. Remaining unvisited: ${unvisited.size}`);
        break;
      }
      
      if (current === destinationId) {
        console.log(`✅ Reached destination in ${iterations} iterations!`);
        break;
      }
      
      unvisited.delete(current);

      const currentNode = this.nodes.get(current);
      if (!currentNode) {
        console.warn(`⚠️ Node ${current} not found in graph`);
        continue;
      }

      const currentDistance = distances.get(current) || 0;
      
      if (iterations <= 5 || current === originId) {
        console.log(`Iteration ${iterations}: Processing ${current} (dist: ${currentDistance}, neighbors: ${currentNode.neighbors.size})`);
        if (iterations === 1) {
          console.log(`  Neighbors of ${current}:`, Array.from(currentNode.neighbors.keys()));
        }
      }

      let updatedCount = 0;
      currentNode.neighbors.forEach((neighbor, neighborId) => {
        if (!unvisited.has(neighborId)) {
          if (iterations === 1) {
            console.log(`  ⚠️ Neighbor ${neighborId} already visited`);
          }
          return;
        }

        // Add transfer penalty if changing lines
        const prevLine = previous.get(current)?.line;
        const transferPenalty = prevLine && prevLine !== neighbor.line ? 3 : 0;
        
        const distance = currentDistance + neighbor.time + transferPenalty;
        const oldDistance = distances.get(neighborId) || Infinity;

        if (distance < oldDistance) {
          distances.set(neighborId, distance);
          previous.set(neighborId, { stationId: current, line: neighbor.line });
          updatedCount++;
          
          if (iterations <= 5 || neighborId === destinationId) {
            console.log(`  → Updated ${neighborId}: ${oldDistance} → ${distance} (via ${neighbor.line})`);
          }
        }
      });
      
      if (iterations === 1) {
        console.log(`  ✅ Updated ${updatedCount} neighbors in first iteration`);
      }
    }
    
    const finalDistance = distances.get(destinationId);
    console.log(`Final destination distance: ${finalDistance === Infinity ? 'INFINITY (unreachable)' : finalDistance}`);

    return this.buildRoute(originId, destinationId, previous);
  }

  private findAlternativePath(
    originId: string, 
    destinationId: string, 
    avoidRoute: Route | null
  ): Route | null {
    // Simple alternative: prefer different transfer stations
    // This is a simplified approach; a full implementation would use k-shortest paths
    
    if (!avoidRoute || avoidRoute.transfers === 0) return null;

    // Try finding a path that avoids the first transfer station
    const avoidStations = new Set<string>();
    if (avoidRoute.segments.length > 1) {
      const firstTransfer = avoidRoute.segments[0].stations[avoidRoute.segments[0].stations.length - 1];
      avoidStations.add(firstTransfer);
    }

    return this.dijkstraWithAvoid(originId, destinationId, avoidStations);
  }

  private dijkstraWithAvoid(
    originId: string, 
    destinationId: string, 
    avoidStations: Set<string>
  ): Route | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, { stationId: string; line: string } | null>();
    const unvisited = new Set<string>();

    this.nodes.forEach((_, id) => {
      if (!avoidStations.has(id) || id === originId || id === destinationId) {
        distances.set(id, Infinity);
        previous.set(id, null);
        unvisited.add(id);
      }
    });
    distances.set(originId, 0);

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDistance = Infinity;
      unvisited.forEach(id => {
        const dist = distances.get(id) || Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          current = id;
        }
      });

      if (current === null || current === destinationId) break;
      unvisited.delete(current);

      const currentNode = this.nodes.get(current);
      if (!currentNode) continue;

      const currentDistance = distances.get(current) || 0;

      currentNode.neighbors.forEach((neighbor, neighborId) => {
        if (!unvisited.has(neighborId)) return;

        const prevLine = previous.get(current)?.line;
        const transferPenalty = prevLine && prevLine !== neighbor.line ? 3 : 0;
        
        const distance = currentDistance + neighbor.time + transferPenalty;

        if (distance < (distances.get(neighborId) || Infinity)) {
          distances.set(neighborId, distance);
          previous.set(neighborId, { stationId: current, line: neighbor.line });
        }
      });
    }

    return this.buildRoute(originId, destinationId, previous);
  }

  private buildRoute(
    originId: string,
    destinationId: string,
    previous: Map<string, { stationId: string; line: string } | null>
  ): Route | null {
    const path: { stationId: string; line: string }[] = [];
    let current = destinationId;

    while (current !== originId) {
      const prev = previous.get(current);
      if (!prev) return null; // No path found
      
      path.unshift({ stationId: current, line: prev.line });
      current = prev.stationId;
    }
    path.unshift({ stationId: originId, line: path[0]?.line || '' });

    // Group by line segments
    const segments: RouteSegment[] = [];
    let currentSegment: RouteSegment | null = null;

    path.forEach(({ stationId, line }) => {
      if (!currentSegment || currentSegment.line !== line) {
        if (currentSegment) segments.push(currentSegment);
        currentSegment = {
          line,
          stations: [stationId],
          color: this.getLineColor(line)
        };
      } else {
        currentSegment.stations.push(stationId);
      }
    });
    if (currentSegment) segments.push(currentSegment);

    const totalStops = path.length - 1;
    const transfers = segments.length - 1;
    const totalTime = Math.ceil(totalStops * 2.5 + transfers * 3);
    const walkingTime = transfers * 3;
    const fare = this.calculateFare(totalStops);

    return {
      segments,
      totalStops,
      totalTime,
      transfers,
      fare,
      walkingTime
    };
  }

  private getLineColor(lineId: string): string {
    const colorMap: Record<string, string> = {
      'Red': 'metro-red',
      'Yellow': 'metro-yellow',
      'Blue': 'metro-blue',
      'Green': 'metro-green',
      'Violet': 'metro-violet',
      'Orange': 'metro-orange',
      'Pink': 'metro-pink',
      'Magenta': 'metro-magenta',
      'Grey': 'metro-grey',
      'Aqua': 'metro-aqua'
    };
    return colorMap[lineId] || 'primary';
  }

  private calculateFare(stops: number): number {
    // Simplified fare calculation based on distance
    if (stops <= 2) return 10;
    if (stops <= 5) return 20;
    if (stops <= 12) return 30;
    if (stops <= 21) return 40;
    return 50;
  }
}

export function findMetroRoutes(
  stations: Station[],
  lines: Line[],
  originId: string,
  destinationId: string
): Route[] {
  const graph = new MetroGraph(stations, lines);
  return graph.findRoutes(originId, destinationId);
}
