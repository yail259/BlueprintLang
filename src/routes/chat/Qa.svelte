<script>
  import MdRenderer from "./MDRenderer.svelte";

  /** @type {{ qaIndex: number, stars: number[], qa: QA }} */
  let { qaIndex, stars = $bindable(), qa = $bindable() } = $props();

  $inspect(stars);

  let hide = $state(false);

  $effect(() => {
    qa.responses.sort((a, b) => a.role.localeCompare(b.role));
  });

  /**
   * @param {number} respIndex
   */
  function makeSelection(respIndex) {
    if (stars[qaIndex] === respIndex) {
      stars[qaIndex] = -1;
      return;
    }
    stars[qaIndex] = respIndex;
  }

  let expandedInputMsg = $state(false);

  /**
   * @type {HTMLPreElement | null}
   */
  let userInputMsg = $state(null);
</script>

<div class="inputMsgBlock">
  <div class="uploadedFiles"></div>
    {#if userInputMsg && userInputMsg.scrollHeight > 92}
      <pre
        bind:this={userInputMsg}
        class:expanded={expandedInputMsg}
        class="hasExpandbtn">
        <p>{qa.question.trim()}</p>
      </pre>
      <button
        aria-label="expand input"
        class="expandInputMsg"
        class:expanded={expandedInputMsg}
        onclick={() => (expandedInputMsg = !expandedInputMsg)}
      ></button>
    {:else}
      <pre bind:this={userInputMsg} class:expanded={expandedInputMsg}>
        <p>{qa.question.trim()}</p>
      </pre>
    {/if}
</div>

<div class="allResponses">
  {#each qa.responses as response, index}
    {stars}

    {index}
    {index === stars[qaIndex]}

    <!-- {starSelections} -->
    <!-- {#if selected[qaIndex] === -1 || index === selected[qaIndex]} -->
    <div
      class="oneResponseBlock"
      class:first={index === 0}
      class:last={index === qa.responses.length - 1}
      class:selected={index === stars[qaIndex]}
      class:notSelected={index !== stars[qaIndex]}
      class:hasSelection={stars[qaIndex] !== -1 &&
        typeof stars[qaIndex] !== "undefined"}
      class:hide
      class:moreThanOne={qa.responses.length > 1}
    >
      <MdRenderer
        hideOthers={() => (hide = !hide)}
        {response}
        clickSelect={() => makeSelection(index)}
        {qaIndex}
      />
    </div>
    <!-- {/if} -->
  {/each}
</div>

<style>
  .allResponses {
    display: flex;
    margin: auto;
    background-color: var(--background);
    width: 100%;
  }

  .oneResponseBlock {
    position: relative;
    border-left: 0.5px solid grey;
    padding: 15px 30px;
    margin: 10px auto 20px auto;
    width: 100%;
    max-width: 700px;
    flex: 1;
    transition: all 0.5 ease-in-out;
    overflow: clip;
    background-color: var(--background);
  }

  .oneResponseBlock.hasSelection {
    border-left: 0.5px solid rgba(128, 128, 128, 0.8);
    border-right: 0.5px solid rgba(128, 128, 128, 0.8);
  }

  .oneResponseBlock.hasSelection.notSelected {
    opacity: 0.4;
  }

  .oneResponseBlock.hasSelection.notSelected.hideNonSelectedResponse {
    display: none;
  }

  .oneResponseBlock.hasSelection.hideNonSelectedResponse {
    border: none;
  }

  .oneResponseBlock.first {
    border-left: none;
  }

  .oneResponseBlock.last {
    border-right: none;
  }

  .inputMsgBlock {
    border-radius: 10px;
    max-width: 70%;
    background-color: var(--primary3);
    padding: 5px 30px 0px 30px;
    margin: 20px 0px 30px auto;
    position: relative;
  }

  .inputMsgBlock pre {
    height: 50px;
    overflow-y: hidden;
    scrollbar-width: 0px;
    margin: 0px 0px 5px 0px;
  }

  .inputMsgBlock pre.expanded {
    height: fit-content;
    overflow-y: auto;
  }

  .inputMsgBlock pre.hasExpandbtn {
    margin-right: 30px;
  }

  .inputMsgBlock pre p {
    margin-block-start: 0px;
    margin-block-end: 0px;
  }

  button.expandInputMsg {
    background-image: url("/svgs/chevron.down.svg");
    background-position: center;
    background-repeat: no-repeat;

    transform: rotate(0.25turn);

    position: absolute;
    top: 12.5px;
    right: 10px;

    background-size: 20px;
    padding: 0;
    height: 40px;
    width: 40px;
    background-color: transparent;
    box-shadow: none;

    filter: opacity(0.6);
    transition: 0.3s all;
  }

  button.expandInputMsg:hover {
    filter: opacity(1);
  }

  button.expandInputMsg.expanded {
    transform: rotate(0turn);
  }
</style>
