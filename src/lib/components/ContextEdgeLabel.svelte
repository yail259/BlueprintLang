<!-- ContextEdge.svelte -->
<script lang="ts">
  import { useSvelteFlow } from "@xyflow/svelte";
  let { id, data }: { id: string; data: Record<string, unknown> } = $props();

  const { updateEdge } = useSvelteFlow();

  let kind = $derived((data.kind ?? "") as string);
  let sync = $derived((data.sync ?? true) as boolean);
  let trustBoundary = $derived((data.trustBoundary ?? "internal") as string);
  let confidentiality = $derived((data.confidentiality ?? "public") as string);
  let channel = $derived((data.channel ?? "web") as string);
  let freq = $derived((data.freq ?? "interactive") as string);

  function commit() {
    updateEdge(id, (edge) => {
      return {
        ...edge,
        data: {
          ...edge.data,
          kind,
          sync,
          trustBoundary,
          confidentiality,
          channel,
          freq,
        },
      };
    });
  }
</script>

<details
  class="context-edge max-w-max rounded border shadow-sm text-xs bg-white select-none"
>
  <summary
    class="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-100 rounded"
  >
    <input
      type="text"
      bind:value={kind}
      onchange={commit}
      class="font-semibold bg-transparent border-none focus:outline-none"
    />
    <span class="uppercase tracking-wide opacity-60 text-[10px]">
      {sync ? "SYNC" : "ASYNC"}
    </span>
  </summary>

  <div class="p-2 space-y-1 leading-snug">
    <label class="flex items-center gap-1 text-[10px]">
      <input type="checkbox" bind:checked={sync} onblur={commit} />
      synchronous
    </label>
    <div class="text-[10px]">
      <strong>Trust Boundary</strong>
      <input
        type="text"
        bind:value={trustBoundary}
        onblur={commit}
        class="ml-1 w-20 bg-transparent border-b border-slate-300 text-xs focus:outline-none"
      />
    </div>
    <div class="text-[10px]">
      <strong>Confidentiality</strong>
      <input
        type="text"
        bind:value={confidentiality}
        onblur={commit}
        class="ml-1 w-20 bg-transparent border-b border-slate-300 text-xs focus:outline-none"
      />
    </div>
    <div class="text-[10px]">
      <strong>Channel</strong>
      <input
        type="text"
        bind:value={channel}
        onblur={commit}
        class="ml-1 w-20 bg-transparent border-b border-slate-300 text-xs focus:outline-none"
      />
    </div>
    <div class="text-[10px]">
      <strong>Frequency</strong>
      <input
        type="text"
        bind:value={freq}
        onblur={commit}
        class="ml-1 w-20 bg-transparent border-b border-slate-300 text-xs focus:outline-none"
      />
    </div>
  </div>
</details>

<style>
  details > summary {
    list-style: none;
  }
</style>
