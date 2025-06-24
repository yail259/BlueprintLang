import type { Node, Edge, Position } from "@xyflow/svelte";

//
// C4-specific node types
//
export type type =
  | "system"
  | "actor"
  | "container"
  | "component"
  | "file"
  | "class"
  | "function";

//
// C4-specific edge types
//
export type C4EdgeType =
  | "interaction" // Context layer
  | "protocol" // Container layer
  | "contract" // Component layer
  | "dataflow"; // Code layer

//
// Custom data that lives inside each node’s `.data` field
//
export interface C4FlowNodeData {
  label: string;
  type: type;
  parent?: string; // Optional for hierarchy
}

//
// Custom data that lives inside each edge’s `.data` field (optional)
//
export interface C4FlowEdgeData {
  type: C4EdgeType;
}

//
// C4-Flow node object
//
export type C4Node = Omit<Node<C4FlowNodeData>, "data"> & {
  data: C4FlowNodeData;
};

//
// C4-Flow edge object
//
export type C4Edge = Omit<Edge<C4FlowEdgeData>, "data"> & {
  data: C4FlowEdgeData;
};
