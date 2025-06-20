<!-- DataflowEdge.svelte (Code layer) -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="dataflow-edge p-2 rounded border bg-white shadow-sm text-xs">
  <div><strong>Operation:</strong> {data.operation as string}</div>
  <div><strong>Datatype:</strong> {data.datatype as string}</div>
  <div><strong>Async:</strong> {(data.async as boolean) ? "yes" : "no"}</div>
  <div><strong>Scope:</strong> {data.scope as string}</div>
  <div>
    <strong>Mutates State:</strong>
    {(data.mutatesState as boolean) ? "yes" : "no"}
  </div>
  {#if data.returns !== undefined}
    <div><strong>Returns:</strong> {data.returns as string | null}</div>
  {/if}
</div>

<style>
  .dataflow-edge div {
    margin-bottom: 0.25rem;
  }
</style>
