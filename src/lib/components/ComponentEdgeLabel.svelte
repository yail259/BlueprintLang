<!-- ContractEdge.svelte -->
<script lang="ts">
  // receives the edge’s semantic data
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="contract-edge p-2 rounded border bg-white shadow-sm text-xs">
  <!-- always-visible essentials -->
  <div><strong>Kind:</strong> {data.kind as string}</div>
  <div><strong>Sync:</strong> {(data.sync as boolean) ? "yes" : "no"}</div>

  <!-- opt-in details -->
  <details class="mt-1">
    <summary class="cursor-pointer select-none">More</summary>
    <div class="mt-1 space-y-1 pl-4">
      <div><strong>Schema:</strong> {data.schema as string}</div>
      <div>
        <strong>Idempotent:</strong>
        {(data.idempotent as boolean) ? "yes" : "no"}
      </div>
      <div><strong>Version:</strong> {data.version as string}</div>
    </div>
  </details>
</div>

<style>
  .contract-edge div {
    margin-bottom: 0.25rem;
  }
</style>
