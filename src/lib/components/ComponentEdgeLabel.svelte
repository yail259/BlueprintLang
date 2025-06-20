<!-- ContractEdge.svelte (Component layer) -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="contract-edge p-2 rounded border bg-white shadow-sm text-xs">
  <div><strong>Role:</strong> {data.semanticRole as string}</div>
  <div><strong>Request Schema:</strong> {data.schemaRef as string}</div>
  {#if data.responseSchemaRef}
    <div>
      <strong>Response Schema:</strong>
      {data.responseSchemaRef as string}
    </div>
  {/if}
  <div><strong>Sync:</strong> {(data.sync as boolean) ? "yes" : "no"}</div>
  <div><strong>Delivery:</strong> {data.delivery as string}</div>
  <div>
    <strong>Idempotent:</strong>
    {(data.idempotent as boolean) ? "yes" : "no"}
  </div>
  {#if data.timeout}
    <div><strong>Timeout:</strong> {data.timeout as number} ms</div>
  {/if}
  <div><strong>Version:</strong> {data.version as string}</div>
</div>

<style>
  .contract-edge div {
    margin-bottom: 0.25rem;
  }
</style>
