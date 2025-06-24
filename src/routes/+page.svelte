<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index.js";

  import GraphView from "$lib/components/GraphView.svelte";
  import Editor from "$lib/components/Editor.svelte";
</script>

<Resizable.PaneGroup direction="horizontal">
  <Resizable.Pane defaultSize={25}><Editor></Editor></Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane><GraphView /></Resizable.Pane>
</Resizable.PaneGroup>
