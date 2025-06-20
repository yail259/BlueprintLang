<!-- ContextEdge.svelte (Context layer) -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="context-edge p-2 rounded border bg-white shadow-sm text-xs">
  <div><strong>Intent:</strong> {data.intent as string}</div>
  <div><strong>Direction:</strong> {data.direction as string}</div>
  <div><strong>Sync:</strong> {(data.sync as boolean) ? "yes" : "no"}</div>
  <div>
    <strong>Trust Boundary:</strong>
    {(data.trustBoundary as boolean) ? "crossed" : "internal"}
  </div>
  <div><strong>Data Class:</strong> {data.dataClass as string}</div>
  <div><strong>Channel:</strong> {data.channel as string}</div>
  <div><strong>Frequency:</strong> {data.freq as string}</div>
</div>

<style>
  .context-edge div {
    margin-bottom: 0.25rem;
  }
</style>
