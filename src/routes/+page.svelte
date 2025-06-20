<script lang="ts">
  import {
    SvelteFlow,
    Background,
    MiniMap,
    Controls,
    Panel,
    type Node,
    type Edge,
    type NodeTypes,
  } from "@xyflow/svelte";

  import data from "../fullExample.json";
  import LayerSelector from "$lib/components/LayerSelector.svelte";
  import C4FlowNode from "$lib/components/C4FlowNode.svelte";
  import C4FlowEdge from "$lib/components/C4FlowEdge.svelte";

  import { UploadCloud, PlayCircle, Play, FilePlus } from "lucide-svelte";

  import {
    loadGraph,
    saveGraphSemantic,
    saveGraphView,
  } from "$lib/util/graphIO";
  import Button from "$lib/components/ui/button/button.svelte";

  let nodes: Node[] = $state.raw([]);
  let edges: Edge[] = $state.raw([]);

  function loadDemo() {
    console.log(data["nodes"]);
    // @ts-ignore
    nodes = data["nodes"];
    // @ts-ignore
    edges = data["edges"];
  }

  const edgeTypes = {
    c4FlowEdge: C4FlowEdge,
  };

  const nodeTypes: NodeTypes = { c4FlowNode: C4FlowNode };

  function downloadJSON() {
    console.log("lols");
    const payload = {
      nodes: nodes, // or whatever your store is called
      edges: edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "c4flow-graph.json";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  let yamlInput: HTMLInputElement = $state();
  let viewInput: HTMLInputElement = $state();

  /** the two files we need */
  let yamlFile: File | null = $state(null);
  let viewFile: File | null = $state(null);

  $inspect(yamlFile);

  /* ───────── drag-and-drop helpers ───────── */
  function prevent(
    e: DragEvent | (DragEvent & { dataTransfer: DataTransfer })
  ) {
    e.preventDefault();
    e.stopPropagation();
  }

  /** handle drop OR programmatic selection */
  function handleFiles(list: FileList | null) {
    if (!list) return;
    for (const f of Array.from(list)) {
      if (f.name.endsWith(".bpl.yaml")) yamlFile = f;
      else if (f.name.endsWith(".sfv.json")) viewFile = f;
      else alert("File extension not supported");
    }
  }

  function handleDrop(e: DragEvent) {
    prevent(e);
    handleFiles(e.dataTransfer?.files ?? null);
  }

  /* your existing loader */
  async function renderGraph() {
    if (!yamlFile) {
      alert("Missing *.gfl.yaml");
      return;
    }

    const graph = await loadGraph(yamlFile, viewFile);
    console.log(graph);
    nodes = graph["nodes"];
    edges = graph["edges"];
  }
</script>

<main>
  {#if nodes.length === 0}
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-slate-50"
    >
      <div
        class="flex flex-col items-center justify-center gap-4
         rounded-xl border-4 border-dashed border-slate-300/80 bg-white
         hover:bg-slate-100 transition-colors w-[min(90vw,42rem)] h-72
         cursor-pointer select-none p-8"
        ondragover={prevent}
        ondrop={handleDrop}
        role="region"
      >
        <!-- icon -->
        <UploadCloud size="80" class="text-slate-400" />

        <!-- headline -->
        <p class="text-lg md:text-xl font-semibold text-slate-600">
          Drop <code class="font-mono">*.bpl.yaml</code>
          <span class="hidden md:inline">and</span><br class="md:hidden" />
          <code class="font-mono">*.sfv.json(optional)</code> here
        </p>

        <span class="text-sm text-slate-500">or use the buttons below</span>

        <!-- action row -->
        <div class="flex flex-wrap gap-4 mt-4 w-full justify-center">
          <!-- YAML picker -->
          <button
            class="inline-flex items-center gap-2 rounded-md px-4 py-2
             transition-colors
             {yamlFile
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-white hover:bg-slate-700'}"
            onclick={() => yamlInput.click()}
          >
            <FilePlus size="18" />
            {yamlFile ? "✓ YAML loaded" : "YAML"}
          </button>

          <!-- JSON picker -->
          <button
            class="inline-flex items-center gap-2 rounded-md px-4 py-2
             transition-colors
             {viewFile
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-white hover:bg-slate-700'}"
            onclick={() => viewInput.click()}
          >
            <FilePlus size="18" />
            {viewFile ? "✓ View JSON loaded" : "View JSON"}
          </button>

          <!-- Render -->
          <button
            class="inline-flex items-center gap-2 rounded-md px-4 py-2
             transition-colors
             bg-emerald-600 text-white hover:bg-emerald-500
             disabled:bg-slate-300 disabled:text-slate-500"
            disabled={!yamlFile}
            onclick={renderGraph}
          >
            <Play size="18" />
            Render
          </button>
        </div>

        <!-- file names preview -->
        {#if yamlFile || viewFile}
          <div class="mt-4 w-full text-sm text-center space-y-1">
            {#if yamlFile}
              <div class="text-emerald-700">📄 {yamlFile.name}</div>
            {/if}
            {#if viewFile}
              <div class="text-emerald-700">📄 {viewFile.name}</div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- hidden real inputs -->
      <input
        type="file"
        accept=".bpl.yaml,.yaml"
        bind:this={yamlInput}
        class="hidden"
        onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
      />

      <input
        type="file"
        accept=".sfv.json,.json"
        bind:this={viewInput}
        class="hidden"
        onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
      />

      <!-- Demo button -->
      <button
        onclick={loadDemo}
        class="mt-8 inline-flex items-center gap-2
            bg-emerald-600 hover:bg-emerald-700 text-white
            font-semibold py-3 px-6 rounded-lg shadow-lg
            focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <PlayCircle size="20" />
        Load Demo Graph
      </button>
    </div>
  {:else}
    <SvelteFlow bind:nodes bind:edges fitView {nodeTypes} {edgeTypes}>
      <Background />

      <Panel position="top-left">
        <LayerSelector />
      </Panel>

      <Panel position="top-center">
        <!-- <NodeCreator /> -->
      </Panel>

      <Panel position="top-right">
        <!-- <Button variant="outline" onclick={() => downloadJSON()}
          >Save Graph JSON
        </Button> -->
        <Button
          variant="outline"
          onclick={() => saveGraphSemantic({ nodes, edges })}
          >Save Graph Semantic
        </Button>
        <Button
          variant="outline"
          onclick={() => saveGraphView({ nodes, edges })}
          >Save Graph View</Button
        >
      </Panel>

      <Controls />
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case "input":
              return "#6ede87";
            case "output":
              return "#6865A5";
            default:
              return "#ff0072";
          }
        }}
        zoomable
        pannable
      />
    </SvelteFlow>
  {/if}
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column-reverse;
  }
</style>
