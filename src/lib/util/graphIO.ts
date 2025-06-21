/* ───────────────────────── graphIO.ts ────────────────────────────
   Visual-only JSON  ✚  C4-Flow YAML semantics
   ---------------------------------------------------------------
   yarn add yaml nanoid            #  or npm i …

   * The YAML file owns **ALL semantic fields** (c4Type, roles, etc.).
   * The JSON view file stores **ONLY layout data** (pos/size/z).
   * Loader merges them for the canvas.
   * Saver writes the YAML first (overwriting semantics),
     then extracts the pure-view slice and rewrites the JSON file.
-----------------------------------------------------------------*/

import { parse, stringify } from "yaml";
import { type NodeSem, type EdgeSem } from "./graphType.ts";
import {
  type Node,
  type Edge,
  type EdgeMarkerType,
  MarkerType,
} from "@xyflow/svelte";

/* ---------- semantic container as in YAML ---------- */
export interface GraphSemYAML {
  nodes: Record<string, Omit<NodeSem, "id">>;
  edges: Record<
    string,
    Omit<EdgeSem, "id" | "source" | "target"> & {
      source: string;
      target: string;
    }
  >;
}

export type NodeView = Omit<Node, "data">;
export type EdgeView = Omit<Edge, "data">;

export interface GraphViewJSON {
  nodes: NodeView[];
  edges: EdgeView[];
}

export interface MergedGraph {
  nodes: Node[];
  edges: Edge[];
}

const DEFAULT_SEMANTIC = "graph.bpl.yaml";
const DEFAULT_VIEW = "graph.sfv.json";
/* ───────────────────── Loader ───────────────────────── */

export function loadGraph(yamlText: string, viewText: string): MergedGraph {
  const sem = parse(yamlText) as GraphSemYAML;
  const view = (viewText ? JSON.parse(viewText) : {}) as Partial<GraphViewJSON>;

  const nodes: Node[] = Object.entries(sem.nodes ?? {}).map(([id, semNode]) => {
    const v = view.nodes?.find((n) => n.id === id);
    return {
      id,
      type: "c4FlowNode",
      data: { ...(semNode as NodeSem) },
      position: v?.position ?? { x: 40, y: 40 },
      width: v?.width ?? 150,
      height: v?.height ?? 40,
      zIndex: v?.zIndex ?? 0,
    };
  });

  const edges: Edge[] = Object.entries(sem.edges ?? {}).map(([id, semEdge]) => {
    const v = view.edges?.find((e) => e.id === id);
    const { source, target } = semEdge as EdgeSem;
    return {
      id,
      type: "c4FlowEdge",
      source,
      target,
      data: { ...(semEdge as EdgeSem) },
      zIndex: v?.zIndex ?? 1,
      markerEnd: v?.markerEnd ?? { type: "arrow" },
    };
  });

  return { nodes, edges };
}

export function saveGraphView(merged: MergedGraph): string {
  /* ---------- view JSON ---------- */
  const viewOut: GraphViewJSON = {
    nodes: merged.nodes.map(
      ({ id, type, position, width, height, zIndex }): NodeView => ({
        id,
        position,
        type: type ?? "c4FlowNode",
        width: width ?? 150,
        height: height ?? 40,
        zIndex: zIndex ?? 0,
      })
    ),

    edges: merged.edges.map(
      ({ id, source, target, zIndex, markerEnd }): EdgeView => ({
        id,
        source,
        target,
        zIndex: zIndex ?? 1,
        markerEnd: markerEnd,
      })
    ),
  };

  const viewStr = JSON.stringify(viewOut, null, 2);

  return viewStr;

  // const viewBlob = new Blob([], {
  //   type: "application/json",
  // });

  // triggerDownload(viewBlob, DEFAULT_VIEW);
}

export function saveGraphSemantic(merged: MergedGraph): string {
  const outNodes: GraphSemYAML["nodes"] = {};
  const outEdges: GraphSemYAML["edges"] = {};

  /** NODES */
  merged.nodes.forEach((n) => {
    const { id, data: semNode } = n;
    const { id: _, ...props } = semNode as NodeSem;
    outNodes[id] = props;
  });

  /** EDGES */
  merged.edges.forEach((e) => {
    const { id, source, target, data: semEdge } = e;
    // YAML wants source/target plus semantic props
    outEdges[id] = {
      source,
      target,
      ...(semEdge as EdgeSem),
    };
  });

  const yamlStr = stringify({ nodes: outNodes, edges: outEdges });

  return yamlStr;

  // const yamlBlob = new Blob([], {
  //   type: "text/yaml",
  // });

  // triggerDownload(yamlBlob, DEFAULT_SEMANTIC);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
