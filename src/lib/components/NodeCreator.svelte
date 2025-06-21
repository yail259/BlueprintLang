<!-- <script lang="ts">
  import { useDnD } from "./DnDProvider.svelte";

  const type = useDnD();

  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (!event.dataTransfer) {
      return null;
    }

    type.current = nodeType;

    event.dataTransfer.effectAllowed = "move";
  };
</script>

<aside>
  <div class="nodes-container"></div>
</aside>

<div
  class="input-node node"
  on:dragstart={(event) => onDragStart(event, "input")}
  draggable={true}
>
  Input Node
</div>
<div
  class="default-node node"
  on:dragstart={(event) => onDragStart(event, "default")}
  draggable={true}
>
  Default Node
</div>
<div
  class="output-node node"
  on:dragstart={(event) => onDragStart(event, "output")}
  draggable={true}
>
  Output Node
</div>

<style>
  aside {
    width: 100%;
    background: #fff;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .nodes-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node {
    margin: 0.5rem;
    border: 1px solid #111;
    padding: 0.5rem 1rem;
    font-weight: 700;
    border-radius: 5px;
    cursor: grab;
  }
</style> -->
