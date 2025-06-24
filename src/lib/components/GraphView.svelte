<script lang="ts">
  import {
    SvelteFlow,
    Background,
    MiniMap,
    Controls,
    Panel,
    type NodeTypes,
    ConnectionLineType,
    type Connection,
    type Edge,
    type EdgeMarkerType,
  } from "@xyflow/svelte";

  import LayerSelector from "$lib/components/LayerSelector.svelte";
  import C4FlowNode from "$lib/components/C4FlowNode.svelte";
  import C4FlowEdge from "$lib/components/C4FlowEdge.svelte";

  import { graph } from "$lib/state/graph.svelte";
  import NodeCreator from "./NodeCreator.svelte";
  import { DEFAULT_MARKEREND } from "$lib/util/graphIO";

  const edgeTypes = {
    c4FlowEdge: C4FlowEdge,
  };

  const nodeTypes: NodeTypes = { c4FlowNode: C4FlowNode };

  function onConnect(c: Connection): Edge {
    console.log(c);
    // const id = `${source}-${target}-${Date.now()}`;
    // graph.edges = [
    //   ...graph.edges,
    // return false;
    return {
      id: "test",
      source: c.source,
      target: c.target,
      type: "c4FlowEdge",
      animated: true,
      markerEnd: DEFAULT_MARKEREND as EdgeMarkerType,
      data: {
        type: "interaction",
        trustBoundary: "external",
        confidentiality: "secret",
        channel: "web",
        frequency: "interactive",
        /* whatever defaults you want */
      },
    };
    // ];
  }
</script>

<main>
  <SvelteFlow
    bind:nodes={graph.nodes}
    bind:edges={graph.edges}
    fitView
    {nodeTypes}
    {edgeTypes}
    connectionLineType={ConnectionLineType.Straight}
    onbeforeconnect={(d) => {
      // return false;
      return onConnect(d);
    }}
  >
    <Background />

    <Panel position="top-right">
      <LayerSelector />
    </Panel>

    <Panel position="top-left">
      <NodeCreator />
    </Panel>

    <Controls />
    <MiniMap
      nodeColor={(node) => {
        switch (node.data.type) {
          case "context":
            return "#6ede87";
          case "container":
            return "#6865A5";
          default:
            return "#ff0072";
        }
      }}
      zoomable
      pannable
    />
  </SvelteFlow>
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column-reverse;
  }
</style>
