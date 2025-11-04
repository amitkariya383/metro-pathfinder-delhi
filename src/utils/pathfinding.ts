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
      routes.push(shortestPath);
    } else {
      console.warn('No shortest path found');
    }

    // Find alternative paths (different transfer points)
    if (shortestPath && shortestPath.transfers > 0) {
      const altPath = this.findAlternativePath(originId, destinationId, shortestPath);
      if (altPath) {
        routes.push(altPath);
      }
    }

    return routes;
  }

  private dijkstra(originId: string, destinationId: string): Route | null {
    const originNode = this.nodes.get(originId);
    const destNode = this.nodes.get(destinationId);
    
    if (!originNode || !destNode) {
      console.error('Origin or destination station not found');
      return null;
    }

    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: { stationId: string; line: string } | null } = {};
    const unvisited: Set<string> = new Set();

    // Initialize all distances to infinity
    this.nodes.forEach((_, stationId) => {
      distances[stationId] = Infinity;
      previous[stationId] = null;
      unvisited.add(stationId);
    });

    // Starting point has distance 0
    distances[originId] = 0;

    while (unvisited.size > 0) {
      // Find the unvisited node with smallest distance
      let currentId: string | null = null;
      let smallestDistance = Infinity;

      for (const id of unvisited) {
        if (distances[id] < smallestDistance) {
          smallestDistance = distances[id];
          currentId = id;
        }
      }

      // If no node found or we reached destination, break
      if (currentId === null || smallestDistance === Infinity) {
        break;
      }

      if (currentId === destinationId) {
        break;
      }

      // Remove current from unvisited
      unvisited.delete(currentId);

      const currentNode = this.nodes.get(currentId);
      if (!currentNode) continue;

      // Check all neighbors
      currentNode.neighbors.forEach((neighbor, neighborId) => {
        if (!unvisited.has(neighborId)) return;

        // Calculate distance to neighbor through current node
        const currentDistance = distances[currentId!];
        const edgeWeight = neighbor.time;
        
        // Add transfer penalty if changing lines
        const prevLine = previous[currentId!]?.line;
        const transferPenalty = prevLine && prevLine !== neighbor.line ? 3 : 0;
        
        const newDistance = currentDistance + edgeWeight + transferPenalty;

        // If this path is shorter, update it
        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = {
            stationId: currentId!,
            line: neighbor.line
          };
        }
      });
    }

    // Build the route from the previous map
    return this.buildRoute(originId, destinationId, previous);
  }

  private findAlternativePath(
    originId: string, 
    destinationId: string, 
    avoidRoute: Route
  ): Route | null {
    // Simple alternative: prefer different transfer stations
    if (avoidRoute.transfers === 0) return null;

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
    const originNode = this.nodes.get(originId);
    const destNode = this.nodes.get(destinationId);
    
    if (!originNode || !destNode) return null;

    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: { stationId: string; line: string } | null } = {};
    const unvisited: Set<string> = new Set();

    this.nodes.forEach((_, stationId) => {
      if (!avoidStations.has(stationId) || stationId === originId || stationId === destinationId) {
        distances[stationId] = Infinity;
        previous[stationId] = null;
        unvisited.add(stationId);
      }
    });

    distances[originId] = 0;

    while (unvisited.size > 0) {
      let currentId: string | null = null;
      let smallestDistance = Infinity;

      for (const id of unvisited) {
        if (distances[id] < smallestDistance) {
          smallestDistance = distances[id];
          currentId = id;
        }
      }

      if (currentId === null || smallestDistance === Infinity || currentId === destinationId) {
        break;
      }

      unvisited.delete(currentId);

      const currentNode = this.nodes.get(currentId);
      if (!currentNode) continue;

      currentNode.neighbors.forEach((neighbor, neighborId) => {
        if (!unvisited.has(neighborId)) return;

        const currentDistance = distances[currentId!];
        const edgeWeight = neighbor.time;
        const prevLine = previous[currentId!]?.line;
        const transferPenalty = prevLine && prevLine !== neighbor.line ? 3 : 0;
        const newDistance = currentDistance + edgeWeight + transferPenalty;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = {
            stationId: currentId!,
            line: neighbor.line
          };
        }
      });
    }

    return this.buildRoute(originId, destinationId, previous);
  }

  private buildRoute(
    originId: string,
    destinationId: string,
    previous: { [key: string]: { stationId: string; line: string } | null }
  ): Route | null {
    const path: { stationId: string; line: string }[] = [];
    let current = destinationId;

    // Trace back from destination to origin
    while (current !== originId) {
      const prev = previous[current];
      if (!prev) {
        // No path found
        return null;
      }
      
      path.unshift({ stationId: current, line: prev.line });
      current = prev.stationId;
    }

    // Add origin with the first segment's line
    if (path.length > 0) {
      path.unshift({ stationId: originId, line: path[0].line });
    } else {
      return null;
    }

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
