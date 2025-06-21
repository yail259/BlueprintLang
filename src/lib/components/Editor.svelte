<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";

  import CodeMirror from "svelte-codemirror-editor";
  import { keymap } from "@codemirror/view";
  import type { Extension } from "@codemirror/state";
  import { yaml } from "@codemirror/lang-yaml";

  import { saveGraphSemantic, saveGraphView } from "$lib/util/graphIO";

  import { exampleJSON, exampleYaml } from "$lib/example";

  import { graph } from "$lib/state/graph.svelte";

  let semDerived = $derived(saveGraphSemantic(graph));
  let viewDerived = $derived(saveGraphView(graph));

  $inspect(semDerived);

  import Button from "./ui/button/button.svelte";
  import { loadGraph } from "$lib/util/graphIO";
  import { onMount } from "svelte";

  onMount(() => {
    const newMerged = loadGraph(exampleYaml, exampleJSON);
    graph.nodes = newMerged.nodes;
    graph.edges = newMerged.edges;

    semDerived = exampleYaml;
    viewDerived = exampleJSON;
  });

  const saveKey: Extension = keymap.of([
    {
      key: "Mod-s", // “Mod” = Ctrl on Win/Linux, ⌘ on macOS
      preventDefault: true,
      run() {
        updateGraph();
        return true; // signals “handled”
      },
    },
  ]);

  function updateGraph() {
    console.log("changed");

    const newMerged = loadGraph(semDerived, viewDerived);
    graph.nodes = newMerged.nodes;
    graph.edges = newMerged.edges;
    console.log(newMerged);
    // setGraph();
  }
</script>

<!-- ——— Tabs -------------------------------------------------------- -->
<Tabs.Root value="graphVal" class="flex flex-col h-screen w-[400px]">
  <!-- Tab bar -->
  <Tabs.List class="flex-none border-b border-slate-200">
    <Tabs.Trigger value="graphVal">Graph</Tabs.Trigger>
    <Tabs.Trigger value="viewVal">View</Tabs.Trigger>
  </Tabs.List>

  <!-- YAML editor pane -->
  <Tabs.Content value="graphVal" class="flex-1 overflow-auto">
    <div class="editor-shell">
      <CodeMirror
        bind:value={semDerived}
        lang={yaml()}
        on:change={() => updateGraph()}
      />
    </div>
  </Tabs.Content>

  <!-- View-only pane -->
  <Tabs.Content value="viewVal" class="flex-1 overflow-auto">
    <CodeMirror
      bind:value={viewDerived}
      lang={yaml()}
      on:change={() => updateGraph()}
    />
  </Tabs.Content>
</Tabs.Root>

<style>
  /* Now the shell just fills its flex-parent */
  .editor-shell {
    height: 100%; /* full height of Tabs.Content */
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
  }
  .editor-shell .cm-editor {
    height: 100%; /* let CodeMirror stretch */
  }
</style>
