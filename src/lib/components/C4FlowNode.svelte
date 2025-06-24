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

  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  let { id, width, height, data = $bindable(), selected }: NodeProps = $props();

  const { updateNodeData } = useSvelteFlow();
  const nodes = useNodes();

  let label = $state(data.label);

  let currName = $state("");
  let exists = $derived(nodes.current.some((node) => node.id === currName));

  let open = $state(false);

  function addSubNode(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    const nameViaFD = new FormData(form).get("name") as string;

    const nextLayer =
      data.type === "context"
        ? "container"
        : data.type === "container"
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
        type: nextLayer,
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
  <!-- {#if data}
    {#if data.type === "code"}
      <small class="nodrag" style="opacity:0.7;">
        {data.role}
        {#if data.tags?.length}
          — {data.tags?.join(", ")}
        {/if}
      </small>
    {:else}
      <small class="nodrag" style="opacity:0.7;">{data.role}</small>
    {/if}
  {/if} -->

  <!-- plus button rendered only when selected -->
  {#if selected}
    <Dialog.Root bind:open>
      <Dialog.Trigger>
        <!-- Replace the existing circle with a styled Button component -->
        <Button
          class="nodrag absolute -top-6 -right-3 px-3 text-xs
                bg-primary text-white hover:bg-primary/90"
          title="Add child node"
        >
          + Child
        </Button>
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
            <Dialog.Title class="text-xl font-semibold">
              Name your new child node!
            </Dialog.Title>

            <!-- field + hint + submit, all in one grid  -->
            <div class="grid grid-cols-4 gap-3 items-start">
              <Label
                for="name"
                class="col-span-1 text-right text-sm font-medium"
              >
                Label
              </Label>

              <Input
                id="name"
                name="name"
                class="col-span-3"
                bind:value={currName}
              />

              {#if exists}
                <p class="col-span-4 -mt-2 text-xs text-red-600">
                  A node with this ID already exists.
                </p>
              {/if}

              <!-- full-width button aligned under inputs -->
              <Button
                class="col-span-4 mt-4 w-full"
                disabled={exists}
                type="submit"
              >
                Create
              </Button>
            </div>
          </form>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root>
  {/if}
</div>

<!-- Node body -->

<Handle type="source" position={Position.Right} />
