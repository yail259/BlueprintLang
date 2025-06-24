<!-- ProtocolEdge.svelte  –  C4-Flow “protocol” label -->
<script lang="ts">
  let { data }: { data: Record<string, unknown> } = $props();

  const kind = (data.kind ?? "") as string;
  const tech = (data.tech ?? "") as string;
  const syncLabel = (data.sync ? "sync" : "async") as string;

  const auth = (data.auth ?? "none") as string;
  const encryption = (data.encryption ?? "none") as string;
  const endPoint = (data.endPoint ?? "") as string;
  const throughput = data.throughput as string | number | undefined;
  const timeout = data.timeout as string | number | undefined;
  const retries = data.retries as number | undefined;
  const qosTier = (data.qosTier ?? "") as string;
</script>

<details
  class="protocol-edge max-w-max rounded border shadow-sm
         text-xs bg-white select-none"
>
  <summary
    class="flex items-center gap-1 px-2 py-1 cursor-pointer
           hover:bg-slate-100 rounded"
  >
    <span class="font-semibold">{tech}</span>
    <span class="opacity-60">{kind}</span>
    <span class="uppercase tracking-wide opacity-60 text-[10px]">
      {syncLabel}
    </span>
  </summary>

  <div class="p-2 space-y-[0.15rem] leading-snug">
    {#if endPoint}<div><strong>Endpoint:</strong> {endPoint}</div>{/if}
    {#if timeout}<div><strong>Timeout:</strong> {timeout}</div>{/if}
    {#if retries !== undefined}<div>
        <strong>Retries:</strong>
        {retries}
      </div>{/if}
    {#if auth}<div><strong>Auth:</strong> {auth}</div>{/if}
    {#if encryption}<div><strong>Encryption:</strong> {encryption}</div>{/if}
    {#if throughput}<div><strong>Throughput:</strong> {throughput}</div>{/if}
    {#if qosTier}<div><strong>QoS:</strong> {qosTier}</div>{/if}
  </div>
</details>

<style>
  details > summary {
    list-style: none;
  }
</style>
