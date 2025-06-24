<script lang="ts">
  import {
    BaseEdge,
    EdgeLabel,
    getStraightPath,
    getBezierPath,
    getSmoothStepPath,
    type EdgeProps,
  } from "@xyflow/svelte";
  import ContextEdgeLabel from "./ContextEdgeLabel.svelte";
  import ComponentEdgeLabel from "./ComponentEdgeLabel.svelte";
  import CodeEdgeLabel from "./CodeEdgeLabel.svelte";
  import ContainerEdgeLabel from "./ContainerEdgeLabel.svelte";

  let { id, markerEnd, sourceX, sourceY, targetX, targetY, data }: EdgeProps =
    $props();

  let [edgePath, labelX, labelY] = $derived(
    getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    })
  );
</script>

<BaseEdge {id} path={edgePath} {markerEnd} />
<EdgeLabel x={labelX} y={labelY}>
  {#if data}
    {#if data.type === "interaction"}
      <ContextEdgeLabel {id} {data} />
    {:else if data.type === "protocol"}
      <ContainerEdgeLabel {data} />
    {:else if data.type === "contract"}
      <ComponentEdgeLabel {data} />
    {:else if data.type === "dataflow"}
      <CodeEdgeLabel {data} />
    {/if}
  {/if}

  <!-- <button
    class="nodrag nopan"
    onclick={() => {
      edges.update((eds) => eds.filter((edge) => edge.id !== id));
    }}
  >
    delete
  </button> -->
</EdgeLabel>
