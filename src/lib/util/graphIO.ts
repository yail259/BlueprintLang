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
import { type Node, type Edge } from "@xyflow/svelte";

/* ---------- visual shapes ---------- */
export interface NodeView {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex?: number;
}

export interface EdgeView {
  id: string;
  source: string;
  target: string;
  zIndex?: number;
  markerEnd?: Record<string, unknown>;
  points?: [number, number][];
}

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

export async function loadGraph(
  yamlFile: File,
  jsonFile: File | null
): Promise<MergedGraph> {
  const sem = parse(await yamlFile.text());

  const view = jsonFile
    ? JSON.parse(await jsonFile.text())
    : { nodes: [], edges: [] };

  const defaultPos = { x: 40, y: 40 };

  const Nodes: Node[] = Object.entries(sem.nodes).map(([id, semNode]) => {
    const v = view.nodes.find((n: { id: string }) => n.id === id);
    return {
      id,
      data: semNode,
      position: v?.position ?? defaultPos,
      width: v?.width ?? 150,
      height: v?.height ?? 40,
      zIndex: v?.zIndex ?? 0,
    } as Node;
  });

  const Edges: Edge[] = Object.entries(sem.edges).map(([id, semEdge]) => {
    const v = view.edges.find((e: { id: string }) => e.id === id);

    const { source, target } = semEdge as EdgeSem;

    return {
      id,
      type: "c4FlowEdge",
      source: source,
      target: target,
      data: semEdge as EdgeSem,
      zIndex: v?.zIndex ?? 1,
      markerEnd: v?.markerEnd ?? { type: "arrow" },
    } satisfies Edge;
  });

  return { nodes: Nodes, edges: Edges };
}

function toMarkerObj(
  m?: string | Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!m) return undefined;
  return typeof m === "string" ? { type: m } : m;
}

export function saveGraphView(merged: MergedGraph): void {
  /* ---------- view JSON ---------- */
  const viewOut: GraphViewJSON = {
    nodes: merged.nodes.map(
      ({ id, position, width, height, zIndex }): NodeView => ({
        id,
        position,
        width: width ?? 150, // 👈 default
        height: height ?? 40, // 👈 default
        zIndex: zIndex ?? 0,
      })
    ),

    edges: merged.edges.map(
      ({ id, source, target, zIndex, markerEnd }): EdgeView => ({
        id,
        source,
        target,
        zIndex: zIndex ?? 1,
        markerEnd: toMarkerObj(markerEnd) ?? { type: "arrow" },
      })
    ),
  };

  const viewBlob = new Blob([JSON.stringify(viewOut, null, 2)], {
    type: "application/json",
  });

  triggerDownload(viewBlob, DEFAULT_VIEW);
}

export function saveGraphSemantic(merged: MergedGraph): void {
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
      ...(semEdge as EdgeSem),
    };
  });

  const yamlBlob = new Blob([stringify({ nodes: outNodes, edges: outEdges })], {
    type: "text/yaml",
  });

  triggerDownload(yamlBlob, DEFAULT_SEMANTIC);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
