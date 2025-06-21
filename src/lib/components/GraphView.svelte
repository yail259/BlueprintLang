<script lang="ts">
  import {
    SvelteFlow,
    Background,
    MiniMap,
    Controls,
    Panel,
    type Node,
    type Edge,
    type NodeTypes,
  } from "@xyflow/svelte";

  import LayerSelector from "$lib/components/LayerSelector.svelte";
  import C4FlowNode from "$lib/components/C4FlowNode.svelte";
  import C4FlowEdge from "$lib/components/C4FlowEdge.svelte";

  import { graph } from "$lib/state/graph.svelte";

  $inspect(graph);

  const edgeTypes = {
    c4FlowEdge: C4FlowEdge,
  };

  const nodeTypes: NodeTypes = { c4FlowNode: C4FlowNode };
</script>

<main>
  <SvelteFlow
    bind:nodes={graph.nodes}
    bind:edges={graph.edges}
    fitView
    {nodeTypes}
    {edgeTypes}
  >
    <Background />

    <Panel position="top-right">
      <LayerSelector />
    </Panel>

    <Panel position="top-center">
      <!-- <NodeCreator /> -->
    </Panel>

    <Controls />
    <MiniMap
      nodeColor={(node) => {
        switch (node.data.c4Type) {
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
  <!-- {/if} -->
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column-reverse;
  }
</style>
