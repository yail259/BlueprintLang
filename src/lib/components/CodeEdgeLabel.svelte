<!-- DataflowEdge.svelte -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="dataflow-edge p-2 rounded border bg-white shadow-sm text-xs">
  <!-- essentials -->
  <div><strong>Kind:</strong> {data.kind as string}</div>
  <div><strong>Sync:</strong> {(data.sync as boolean) ? "yes" : "no"}</div>

  <!-- optional details -->
  <details class="mt-1">
    <summary class="cursor-pointer select-none">More</summary>
    <div class="mt-1 space-y-1 pl-4">
      {#if data.datatype}
        <div><strong>Datatype:</strong> {data.datatype as string}</div>
      {/if}

      {#if data.scope}
        <div><strong>Scope:</strong> {data.scope as string}</div>
      {/if}

      {#if data.mutate !== undefined}
        <div>
          <strong>Mutate:</strong>
          {(data.mutate as boolean) ? "yes" : "no"}
        </div>
      {/if}

      {#if data.returns !== undefined}
        <div><strong>Returns:</strong> {data.returns as string}</div>
      {/if}
    </div>
  </details>
</div>

<style>
  .dataflow-edge div {
    margin-bottom: 0.25rem;
  }
</style>
