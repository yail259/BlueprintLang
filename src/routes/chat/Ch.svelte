<script>
  import { tick } from "svelte";

  // import { PUBLIC_DEBUG } from "$env/static/public";

  import Qa from "./Qa.svelte";

  // import { getMessages } from "$lib/post/messages";

  /** @type {{ currID: number, allConvs: Map<number, Conv>, stars: number[]}} */
  let { currID, allConvs = $bindable(), stars = $bindable() } = $props();

  let ch = $derived(allConvs.get(currID)?.qas ?? []);

  /**
   * @type {HTMLDivElement | undefined}
   */
  let chDiv = $state();

  // autoscroll if new messages and reading last message
  $effect.pre(() => {
    if (!ch[ch.length - 1]?.responses) return;
    for (const res of ch[ch.length - 1].responses) {
      res.content;
    }

    if (!chDiv) return;

    const autoscroll =
      chDiv.offsetHeight + chDiv.scrollTop > chDiv.scrollHeight - 50;

    if (autoscroll) {
      tick().then(() => {
        // @ts-ignore
        chDiv.scrollTo(0, chDiv.scrollHeight);
      });
    }
  });

  async function getMoreMessages() {
    if (!chDiv) {
      return;
    }

    const getMoreMessages = chDiv.scrollTop < 50;

    if (getMoreMessages && ch.length > 0) {
      const scrollHeightBefore = chDiv.scrollHeight;
      const scrollTopBefore = chDiv.scrollTop;

      // if (PUBLIC_DEBUG === "true") console.log("Getting more messages");
      const moreMessages = await getMessages(currID, ch[0].ts);

      if (moreMessages.length === 0) {
        return;
      }

      ch.unshift(...moreMessages);

      // Maintain the scroll position relative to the new height
      tick().then(() => {
        // @ts-ignore
        const scrollHeightAfter = chDiv.scrollHeight;
        const heightDifference = scrollHeightAfter - scrollHeightBefore;
        // @ts-ignore
        chDiv.scrollTo(0, scrollTopBefore + heightDifference);
      });
    }
  }
</script>

<div bind:this={chDiv} onscroll={getMoreMessages} class="conversationDisplay">
  {#if ch.length == 0}
    Hey man
  {/if}
  {#each ch as _, qaIndex}
    <div class="oneQABlock">
      <Qa bind:qa={ch[qaIndex]} {qaIndex} />
    </div>
  {/each}
</div>

<style>
  .conversationDisplay {
    padding: 0px 20px;
    flex: 1;
    overflow-y: auto;
    word-break: break-word;
    background-color: var(--background);
  }

  .oneQABlock {
    display: grid;
  }

  @keyframes glowing-button-85 {
    0% {
      filter: blur(5px);
      -webkit-filter: blur(5px);
    }
    50% {
      filter: blur(25px);
      -webkit-filter: blur(25px);
    }
    100% {
      filter: blur(5px);
      -webkit-filter: blur(5px);
    }
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
