import { type MergedGraph } from "$lib/util/graphIO";

import { type Node, type Edge } from "@xyflow/svelte";

export let nodes = $state.raw<Node[]>([]);
export let edges = $state.raw<Edge[]>([]);

export let graph = $state<MergedGraph>({
  nodes: nodes,
  edges: edges,
});

// export function getGraph() {
//   return graphState;
// }

// export function setGraph(newGraphState: MergedGraph) {
//   graphState.nodes = newGraphState.nodes;
//   graphState.edges = newGraphState.edges;
// }
