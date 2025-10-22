import { Road } from '../mapTypes/map';

type NodeId = string;

interface Node {
  id: NodeId;
  coord: [number, number];
}

interface Edge {
  to: NodeId;
  weight: number;
  roadId: string;
}

interface Graph {
  nodes: Record<NodeId, Node>;
  adj: Record<NodeId, Edge[]>;
}

const keyFor = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function buildGraph(roads: Road[]): Graph {
  const nodes: Record<NodeId, Node> = {};
  const adj: Record<NodeId, Edge[]> = {};

  for (const road of roads) {
    const coords = road.coordinates;
    for (let i = 0; i < coords.length; i++) {
      const [lat, lng] = coords[i];
      const id = keyFor(lat, lng);
      if (!nodes[id]) {
        nodes[id] = { id, coord: [lat, lng] };
        adj[id] = [];
      }
      if (i > 0) {
        const [plat, plng] = coords[i-1];
        const pid = keyFor(plat, plng);
        const w = haversine(lat, lng, plat, plng);
        // add both directions
        adj[id].push({ to: pid, weight: w, roadId: road.id });
        adj[pid].push({ to: id, weight: w, roadId: road.id });
      }
    }
  }

  return { nodes, adj };
}

function findNearestNodeId(graph: Graph, point: [number, number]): NodeId | null {
  let best: NodeId | null = null;
  let bestDist = Infinity;
  const [lat, lng] = point;
  for (const id in graph.nodes) {
    const n = graph.nodes[id];
    const d = haversine(lat, lng, n.coord[0], n.coord[1]);
    if (d < bestDist) { bestDist = d; best = id; }
  }
  return best;
}

export function shortestPath(graph: Graph, startId: NodeId, endId: NodeId): { path: NodeId[]; distance: number } | null {
  const dist: Record<NodeId, number> = {};
  const prev: Record<NodeId, NodeId | null> = {};
  const pq: Set<NodeId> = new Set(Object.keys(graph.nodes));

  for (const id of pq) { dist[id] = Infinity; prev[id] = null; }
  dist[startId] = 0;

  while (pq.size > 0) {
    // extract min
    let u: NodeId | null = null;
    let min = Infinity;
    for (const id of pq) {
      if (dist[id] < min) { min = dist[id]; u = id; }
    }
    if (u === null) break;
    pq.delete(u);
    if (u === endId) break;
    const edges = graph.adj[u] || [];
    for (const e of edges) {
      const alt = dist[u] + e.weight;
      if (alt < dist[e.to]) {
        dist[e.to] = alt;
        prev[e.to] = u;
      }
    }
  }

  if (dist[endId] === Infinity) return null;
  const path: NodeId[] = [];
  let cur: NodeId | null = endId;
  while (cur) { path.push(cur); cur = prev[cur]; }
  path.reverse();
  return { path, distance: dist[endId] };
}

export function routeAlongRoads(start: [number, number], dest: [number, number], roads: Road[]) {
  if (!roads || roads.length === 0) return null;
  const graph = buildGraph(roads);
  const startId = findNearestNodeId(graph, start);
  const endId = findNearestNodeId(graph, dest);
  if (!startId || !endId) return null;
  const res = shortestPath(graph, startId, endId);
  if (!res) return null;
  // convert node ids to coords
  const waypoints = res.path.map(id => graph.nodes[id].coord);
  return { waypoints, distance: res.distance };
}
