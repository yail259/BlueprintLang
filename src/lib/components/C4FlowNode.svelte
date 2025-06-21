<script lang="ts">
  import {
    Handle,
    NodeResizer,
    Position,
    useSvelteFlow,
    useNodes,
    type NodeProps,
    type Node,
  } from "@xyflow/svelte";
  import { nanoid } from "nanoid";

  let { id, width, height, data = $bindable(), selected }: NodeProps = $props();

  const { updateNodeData } = useSvelteFlow();
  const nodes = useNodes();

  let label = $state(data.label);

  function addSubNode(e: MouseEvent) {
    e.stopPropagation();

    console.log("here");
    const nextLayer =
      data.c4Type === "context"
        ? "container"
        : data.c4Type === "container"
          ? "component"
          : "code";

    // drop it 30 px from parent’s top-left
    const localPos = { x: 30, y: 30 };
    // convert to canvas coords (parent’s position is already relative for extent:'parent')
    const position = localPos;

    const newNode: Node = {
      id: nanoid(),
      type: "c4FlowNode",
      parentId: id,
      extent: "parent",
      position,
      width: 140,
      height: 40,
      data: {
        label: "New node",
        c4Type: nextLayer,
        role: "function",
      },
    };

    nodes.update((curr) => {
      return [...curr, newNode];
    });
  }
</script>

<NodeResizer
  minWidth={100}
  minHeight={30}
  isVisible={selected}
  color="rgb(255, 64, 0)"
/>

<Handle type="target" position={Position.Left} />

<!-- Node body -->
<div
  style={`
    width: ${width}px;
    height: ${height}px;
    padding: 10px;
    border: 2px solid #333;
    border-radius: 4px;
    background: white;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    position: relative;    /* so the + button can be absolutely positioned */
  `}
>
  <!-- editable label -->
  <input
    class="nodrag"
    style="
      width: 90%;
      text-align: center;
      font-weight: 600;
      border: none;
      outline: none;
      background: transparent;
    "
    bind:value={label}
    onchange={() => {
      // console.log(label);
      updateNodeData(id, { label: label });
    }}
  />

  <!-- custom details (inline, no separate components) -->
  {#if data}
    {#if data.c4Type === "code"}
      <small class="nodrag" style="opacity:0.7;">
        {data.role}
        {#if data.tags?.length}
          — {data.tags.join(", ")}
        {/if}
      </small>
    {:else}
      <small class="nodrag" style="opacity:0.7;">{data.role}</small>
    {/if}
  {/if}

  <!-- plus button rendered only when selected -->
  {#if selected}
    <button
      class="nodrag"
      style="
        position: absolute;
        top: -10px;
        right: -10px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #0d9488;
        color: white;
        border: none;
        cursor: pointer;
        font-weight: 700;
      "
      onclick={(e) => addSubNode(e)}
      title="Add child node"
    >
      +
    </button>
  {/if}
</div>

<Handle type="source" position={Position.Right} />
