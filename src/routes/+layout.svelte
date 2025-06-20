<script lang="ts">
  import "../app.css";
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import DnDProvider from "$lib/components/DnDProvider.svelte";
  import "@xyflow/svelte/dist/style.css";
  
  let { children } = $props();
</script>

<SvelteFlowProvider>
  <!-- <DnDProvider> -->
  {@render children()}
  <!-- </DnDProvider> -->
</SvelteFlowProvider>
