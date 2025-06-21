<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index.js";

  import GraphView from "$lib/components/GraphView.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import { loadGraph } from "$lib/util/graphIO";

  let graphVal = $state("");
  let viewVal = $state("{ nodes: [], edges: [] }");

  let graph = $derived(loadGraph(graphVal, viewVal));

  import { basicSetup } from "codemirror";
  import { EditorView } from "@codemirror/view";

  // let doc = $state("");

  // const view = new EditorView({
  //   doc: doc,
  //   parent: document.body,
  //   extensions: [basicSetup],
  // });

  // $inspect(doc);
</script>

<Resizable.PaneGroup direction="horizontal">
  <Resizable.Pane defaultSize={25}
    ><Editor {graphVal} {viewVal}></Editor></Resizable.Pane
  >
  <Resizable.Handle withHandle />
  <Resizable.Pane><GraphView {graph} /></Resizable.Pane>
</Resizable.PaneGroup>
