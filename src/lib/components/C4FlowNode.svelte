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
  import { Baby } from "lucide-svelte";
  import { nanoid } from "nanoid";

  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  let { id, width, height, data = $bindable(), selected }: NodeProps = $props();

  const { updateNodeData } = useSvelteFlow();
  const nodes = useNodes();

  let label = $state(data.label);

  // function wait(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  let open = $state(false);

  function addSubNode(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    const nameViaFD = new FormData(form).get("name") as string;

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
      id: nameViaFD,
      type: "c4FlowNode",
      parentId: id,
      extent: "parent",
      position,
      width: (width ?? 140) * 0.5,
      height: (height ?? 80) * 0.5,
      data: {
        label: nameViaFD,
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
          — {data.tags?.join(", ")}
        {/if}
      </small>
    {:else}
      <small class="nodrag" style="opacity:0.7;">{data.role}</small>
    {/if}
  {/if}

  <!-- plus button rendered only when selected -->
  {#if selected}
    <Dialog.Root bind:open>
      <Dialog.Trigger
        ><button
          class="
        nodrag absolute -top-2 -right-2 /* ⭢ -10 px */
        w-8 h-8 rounded-full /* 24 px circle */
        bg-primary hover:bg-ring /* “primary” tint + hover */
        text-white flex items-center justify-center
        cursor-pointer
      "
          title="Add child node"
        >
          <Baby class="w-4 h-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Header>
          <!-- compact, centered panel -->
          <form
            class="flex flex-col gap-6 w-full max-w-md mx-auto"
            onsubmit={(e) => {
              addSubNode(e);
              open = false;
            }}
          >
            <Dialog.Title class="text-xl font-semibold"
              >Name your new child node!</Dialog.Title
            >

            <!-- field row: label + input in a simple grid -->
            <div class="grid grid-cols-4 items-center gap-3">
              <!-- Input keeps its own styling, just fills remaining space -->
              <Input id="name" name="name" class="col-span-3" />
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root>
  {/if}
</div>

<!-- Node body -->

<Handle type="source" position={Position.Right} />
