<!-- ProtocolEdge.svelte (Container layer) -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();
</script>

<div class="protocol-edge p-2 rounded border bg-white shadow-sm text-xs">
  <div><strong>Tech:</strong> {data.tech as string}</div>
  <div><strong>Endpoint:</strong> {data.endpoint as string}</div>
  <div><strong>Method:</strong> {data.method as string}</div>
  <div><strong>Direction:</strong> {data.direction as string}</div>
  <div><strong>Timeout:</strong> {data.timeout as number} ms</div>
  <div><strong>Retries:</strong> {data.retries as number}</div>
  <div>
    <strong>Auth Required:</strong>
    {(data.authRequired as boolean) ? "yes" : "no"}
  </div>
  <div><strong>Encryption:</strong> {data.encryption as string}</div>
  {#if data.accessType}
    <div><strong>Access Type:</strong> {data.accessType as string}</div>
  {/if}
  {#if data.throughput}
    <div><strong>Throughput:</strong> {data.throughput as string | number}</div>
  {/if}
  {#if data.qosTier}
    <div><strong>QoS Tier:</strong> {data.qosTier as string}</div>
  {/if}
</div>

<style>
  .protocol-edge div {
    margin-bottom: 0.25rem;
  }
</style>
