function findNearestPointOnSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): { point: [number, number]; dist: number } {
  const [px, py] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;

  if (l2 === 0) {
    return { point: a, dist: haversine(px, py, x1, y1) };
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));

  const closestPoint: [number, number] = [x1 + t * dx, y1 + t * dy];
  const dist = haversine(px, py, closestPoint[0], closestPoint[1]);
  return { point: closestPoint, dist };
}

export function findNearestRoadAndSegment(
  point: [number, number],
  roads: Road[]
): {
  road: Road;
  point: [number, number];
  distance: number;
  segment: [[number, number], [number, number]];
} | null {
  let bestMatch: {
    road: Road;
    point: [number, number];
    distance: number;
    segment: [[number, number], [number, number]];
  } | null = null;

  for (const road of roads) {
    for (let i = 0; i < road.coordinates.length - 1; i++) {
      const p1 = road.coordinates[i];
      const p2 = road.coordinates[i + 1];
      const { point: closestPoint, dist } = findNearestPointOnSegment(
        point,
        p1,
        p2
      );

      if (bestMatch === null || dist < bestMatch.distance) {
        bestMatch = {
          road,
          point: closestPoint,
          distance: dist,
          segment: [p1, p2],
        };
      }
    }
  }
  return bestMatch;
}

import { Road } from "../mapTypes/map";

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

const keyFor = (lat: number, lng: number) =>
  `${lat.toFixed(6)},${lng.toFixed(6)}`;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getLineIntersection(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): [number, number] | null {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [x4, y4] = p4;

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) {
    return null; // Parallel
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  if (t > 0 && t < 1 && u > 0 && u < 1) {
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    return [x, y];
  }

  return null;
}

export function buildGraph(roads: Road[]): Graph {
  const nodes: Record<NodeId, Node> = {};
  const adj: Record<NodeId, Edge[]> = {};

  const addNode = (coord: [number, number]): NodeId => {
    const id = keyFor(coord[0], coord[1]);
    if (!nodes[id]) {
      nodes[id] = { id, coord };
      adj[id] = [];
    }
    return id;
  };

  const addEdge = (n1Id: NodeId, n2Id: NodeId, roadId: string) => {
    const w = haversine(
      nodes[n1Id].coord[0],
      nodes[n1Id].coord[1],
      nodes[n2Id].coord[0],
      nodes[n2Id].coord[1]
    );

    if (!adj[n1Id].some((edge) => edge.to === n2Id)) {
      adj[n1Id].push({ to: n2Id, weight: w, roadId: roadId });
    }
    if (!adj[n2Id].some((edge) => edge.to === n1Id)) {
      adj[n2Id].push({ to: n1Id, weight: w, roadId: roadId });
    }
  };

  // 1. Add all road coordinates as initial nodes
  roads.forEach((road) => {
    road.coordinates.forEach((coord) => addNode(coord));
  });

  // 2. Find and add intersection points
  for (let i = 0; i < roads.length; i++) {
    for (let j = i + 1; j < roads.length; j++) {
      const r1 = roads[i];
      const r2 = roads[j];
      for (let k = 0; k < r1.coordinates.length - 1; k++) {
        for (let l = 0; l < r2.coordinates.length - 1; l++) {
          const intersection = getLineIntersection(
            r1.coordinates[k],
            r1.coordinates[k + 1],
            r2.coordinates[l],
            r2.coordinates[l + 1]
          );
          if (intersection) {
            addNode(intersection);
          }
        }
      }
    }
  }

  // 3. Build edges by splitting segments at all nodes
  roads.forEach((road) => {
    for (let i = 0; i < road.coordinates.length - 1; i++) {
      const p1 = road.coordinates[i];
      const p2 = road.coordinates[i + 1];

      const pointsOnSegment: [number, number][] = [p1];
      Object.values(nodes).forEach((node) => {
        // Check if node is on the segment p1-p2
        const d1 = haversine(p1[0], p1[1], node.coord[0], node.coord[1]);
        const d2 = haversine(node.coord[0], node.coord[1], p2[0], p2[1]);
        const dTotal = haversine(p1[0], p1[1], p2[0], p2[1]);
        if (Math.abs(d1 + d2 - dTotal) < 1e-6) {
          // Tolerance for float precision
          pointsOnSegment.push(node.coord);
        }
      });
      pointsOnSegment.push(p2);

      // Remove duplicate points
      const uniquePoints = pointsOnSegment.filter(
        (p, index, self) =>
          index ===
          self.findIndex((p2) => keyFor(p[0], p[1]) === keyFor(p2[0], p2[1]))
      );

      // Sort points along the segment
      uniquePoints.sort(
        (a, b) =>
          haversine(p1[0], p1[1], a[0], a[1]) -
          haversine(p1[0], p1[1], b[0], b[1])
      );

      // Add edges
      for (let k = 0; k < uniquePoints.length - 1; k++) {
        const n1Id = keyFor(uniquePoints[k][0], uniquePoints[k][1]);
        const n2Id = keyFor(uniquePoints[k + 1][0], uniquePoints[k + 1][1]);
        if (n1Id !== n2Id) {
          addEdge(n1Id, n2Id, road.id);
        }
      }
    }
  });

  return { nodes, adj };
}

function findNearestNodeId(
  graph: Graph,
  point: [number, number]
): NodeId | null {
  let best: NodeId | null = null;
  let bestDist = Infinity;
  const [lat, lng] = point;
  for (const id in graph.nodes) {
    const n = graph.nodes[id];
    const d = haversine(lat, lng, n.coord[0], n.coord[1]);
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

export function shortestPath(
  graph: Graph,
  startId: NodeId,
  endId: NodeId
): { path: NodeId[]; distance: number } | null {
  const dist: Record<NodeId, number> = {};
  const prev: Record<NodeId, NodeId | null> = {};
  const pq: Set<NodeId> = new Set(Object.keys(graph.nodes));

  for (const id of pq) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[startId] = 0;

  while (pq.size > 0) {
    // extract min
    let u: NodeId | null = null;
    let min = Infinity;
    for (const id of pq) {
      if (dist[id] < min) {
        min = dist[id];
        u = id;
      }
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
  while (cur) {
    path.push(cur);
    cur = prev[cur];
  }
  path.reverse();
  return { path, distance: dist[endId] };
}

export function routeAlongRoads(
  start: [number, number],
  dest: [number, number],
  roads: Road[]
) {
  if (!roads || roads.length === 0) return null;
  const graph = buildGraph(roads);

  const startRoadInfo = findNearestRoadAndSegment(start, roads);
  const destRoadInfo = findNearestRoadAndSegment(dest, roads);

  if (!startRoadInfo || !destRoadInfo) return null;

  const { point: snappedStart, segment: startSegment } = startRoadInfo;
  const { point: snappedDest, segment: destSegment } = destRoadInfo;

  const startNode1Id = keyFor(startSegment[0][0], startSegment[0][1]);
  const startNode2Id = keyFor(startSegment[1][0], startSegment[1][1]);
  const destNode1Id = keyFor(destSegment[0][0], destSegment[0][1]);
  const destNode2Id = keyFor(destSegment[1][0], destSegment[1][1]);

  const startNodes = [
    { id: startNode1Id, point: startSegment[0] },
    { id: startNode2Id, point: startSegment[1] },
  ];
  const destNodes = [
    { id: destNode1Id, point: destSegment[0] },
    { id: destNode2Id, point: destSegment[1] },
  ];

  let bestRoute: { waypoints: [number, number][]; distance: number } | null =
    null;

  for (const sNode of startNodes) {
    for (const dNode of destNodes) {
      const pathResult = shortestPath(graph, sNode.id, dNode.id);
      if (pathResult) {
        const distToStartNode = haversine(
          snappedStart[0],
          snappedStart[1],
          sNode.point[0],
          sNode.point[1]
        );
        const distFromDestNode = haversine(
          dNode.point[0],
          dNode.point[1],
          snappedDest[0],
          snappedDest[1]
        );

        const totalDistance =
          distToStartNode + pathResult.distance + distFromDestNode;

        if (bestRoute === null || totalDistance < bestRoute.distance) {
          const waypoints = pathResult.path.map((id) => graph.nodes[id].coord);

          const finalWaypoints = [
            snappedStart,
            ...waypoints,
            snappedDest,
          ].reduce((acc: [number, number][], wp) => {
            if (
              acc.length === 0 ||
              !(
                acc[acc.length - 1][0] === wp[0] &&
                acc[acc.length - 1][1] === wp[1]
              )
            ) {
              acc.push(wp);
            }
            return acc;
          }, []);
          bestRoute = { waypoints: finalWaypoints, distance: totalDistance };
        }
      }
    }
  }

  // Handle case where start and end are on the same segment
  const distOnSameSegment = haversine(
    snappedStart[0],
    snappedStart[1],
    snappedDest[0],
    snappedDest[1]
  );
  if (
    startRoadInfo.road.id === destRoadInfo.road.id &&
    keyFor(startSegment[0][0], startSegment[0][1]) ===
      keyFor(destSegment[0][0], destSegment[0][1]) &&
    keyFor(startSegment[1][0], startSegment[1][1]) ===
      keyFor(destSegment[1][0], destSegment[1][1])
  ) {
    if (bestRoute === null || distOnSameSegment < bestRoute.distance) {
      bestRoute = {
        waypoints: [snappedStart, snappedDest],
        distance: distOnSameSegment,
      };
    }
  }

  if (!bestRoute) return null;

  // Clean up waypoints to remove duplicates
  const cleanedWaypoints = bestRoute.waypoints.filter((wp, i) => {
    if (i === 0) return true;
    const prev = bestRoute!.waypoints[i - 1];
    return !(wp[0] === prev[0] && wp[1] === prev[1]);
  });

  return { ...bestRoute, waypoints: cleanedWaypoints };
}
