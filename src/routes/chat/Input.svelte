<script>
  import FInput from "./FInput.svelte";

  import { PUBLIC_BACKEND, PUBLIC_DEBUG } from "$env/static/public";
  import { protocol } from "$lib/secure";

  import { generating } from "$lib/stores/generating";
  import { adjustHeight, LLWS, sendMessage } from "./input";
  import { userStore } from "$lib/stores/user";
  import { createConv, renameConv } from "../left/sidebarPost";

  /**@type {{ currID: number, allConvs: Map<number, Conv>, privacy: boolean, stars: number[]}}*/
  const { allConvs = $bindable(), currID, privacy, stars } = $props();

  let ch = $derived(allConvs.get(currID)?.qas ?? []);

  const modes = ["Concise", "Tutor", "ELI5", "Expert"];
  // // $inspect(ch);

  // const ws = new LLWS(`ws${protocol}://${PUBLIC_BACKEND}/chat`, streamF);

  /**
   * @param {any} stream
   */
  async function streamF(stream) {
    let qa = ch[ch.length - 1];

    for await (const event of stream) {
      // console.log(event);
      switch (event.type) {
        case "response.output_text.delta":
          console.log(event.delta);
      }
    }

    // if (stream.role === "balance") {
    //   this.notif = stream.content;
    //   return;
    // } else if (stream.role === "star") {
    //   return;
    // }

    // let respExist = false;
    // for (const resp of qa.responses) {
    //   if (resp.role === stream.role) {
    //     respExist = true;

    //     if (stream.error !== "") {
    //       resp.error = stream.error;
    //     }
    //     resp.content += stream.content;
    //     break;
    //   }
    // }
  }

  //   if (!respExist) {
  //     qa.responses.push({
  //       role: stream.role,
  //       content: stream.content,
  //       error: stream.error,
  //     });
  //   }

  //   checkStop(qa);
  // }

  // /**
  //  * @param {QA} qa
  //  */
  // function checkStop(qa) {
  //   const allStopped = qa.responses.every(
  //     (/** @type {{ error: string; }} */ resp) => resp.error !== ""
  //   );

  //   if (allStopped) {
  //     // Assuming 'generating' is a writable store
  //     generating.set(false);
  //   }
  // }

  let currMode = $state("Concise");

  /**
   * @type {HTMLDivElement}
   */
  // @ts-ignore
  let imgPreview = $state();

  // function cancelGeneration() {
  //   ws.send("cancel");
  //   $generating = false;
  // }

  import OpenAI from "openai";
  import { PUBLIC_OPENAI} from "$env/static/public";

  const openai = new OpenAI({
    apiKey: PUBLIC_OPENAI,
    dangerouslyAllowBrowser: true
  });

  /**
   * @return {QA}
   */
  function newQA() {
    const n = {
      question: "",
      fileLinks: [],
      responses: [],
      ts: "",
      selected: [],
    };

    return n;
  }

  let inputQA = $state(newQA());

  let isFullScreen = $state(false);
  let showLLMSelection = $state(false);

  function toggleFullScreenMode() {
    isFullScreen = !isFullScreen;
  }

  /**
   * @param {string} string
   */
  function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * @type {HTMLTextAreaElement}
   */
  let messageTextarea;

  function resetTextarea() {
    messageTextarea.style.height = "inherit"; // Reset height to recalculate
  }

  async function sendQA() {
    const idToken = await $userStore?.getIdToken(true);
    if (!idToken) {
      if (PUBLIC_DEBUG === "true") console.log("No idToken");
      return;
    }

    inputQA.question = inputQA.question.trim();

    if (inputQA.question === "" && inputQA.fileLinks.length === 0) {
      if (PUBLIC_DEBUG === "true") console.log("Empty query");
      return;
    }

    // // inputQA.selected = latestSelected();
    // // starSelections = latestSelected();

    // $generating = true;
    // // if ($preferences.autoHideSidebar) $sidebarOpen = false;

    const sendQA = $state.snapshot(inputQA);

    const histQA = $state(sendQA);
    ch.push(histQA);
    inputQA = newQA();

    imgPreview.innerHTML = "";

    isFullScreen = false;

    const stream = await openai.responses.create({
      model: "gpt-4.1",
      input: inputQA.question,
      stream: true,
    });

    streamF(stream);

    resetTextarea();

    if (ch.length === 1 && !privacy) {
      let question = sendQA.question;
      if (question === "") {
        question = "Image/File Input";
      }

      question = cap(question);

      await renameConv(idToken, currID, question); // set curr conversation name as first question
      const target = allConvs.get(currID);
      if (target) target.name = question;

      const newID = await createConv(idToken, ""); // create new conversation as buffer
      const newConv = $state({ name: "", id: newID, qas: [], ts: "" });
      allConvs.set(newID, newConv);
    }
  }

  /**
   * @param {KeyboardEvent} event
   * @param {boolean} isFullScreen
   */
  export function handleKeyDown(event, isFullScreen) {
    switch (event.key) {
      case "Enter":
        if (!isFullScreen) {
          if (!event.shiftKey) {
            event.preventDefault(); // Prevent the default Enter behavior (newline)
            sendQA();
          }
          // If Shift is held, do nothing special: the default behavior will insert a newline
        } else {
          if (event.shiftKey) {
            event.preventDefault(); // Prevent the default Enter behavior (newline)
            sendQA();
          }
        }
        break;
    }
  }
</script>

<form
  class:floatingInputPanel-normal={!isFullScreen}
  class:floatingInputPanel-fullScreen={isFullScreen}
  onsubmit={() => {
    sendQA();
  }}
  id="userInputForm"
>
  <div class="LLMSelection" id="LLMSelection" class:hovered={showLLMSelection}>
    {#each modes as mode}
      <!-- <div id={model + "Tip"} role="tooltip" style="display: none;">
    Explanation for {model}
    </div> -->
      <label class="container {mode}" id={mode}>
        <input
          type="checkbox"
          name="model"
          value={mode}
          checked={currMode == mode}
          onclick={() => {
            currMode = mode;
          }}
        />

        <span class="checkmark" title={mode}>{mode}</span>
      </label>
    {/each}
  </div>

  <div class="coverForLLMSelectionAnimation"></div>

  <div
    class="lowerUserInputBlock"
    class:fullScreen={isFullScreen}
    class:generating={$generating}
  >
    <label
      for="file"
      title="Add Attchment"
      id="fileLabel"
      class:attach-normal={!isFullScreen}
      class:attach-fullScreen={isFullScreen}
    ></label>

    <div class="userInputMidSection" class:fullScreen={isFullScreen}>
      <FInput {inputQA} {isFullScreen} bind:imgPreview></FInput>

      <textarea
        class:fullscreen={isFullScreen}
        rows="1"
        bind:this={messageTextarea}
        bind:value={inputQA.question}
        oninput={(target) => {
          adjustHeight(target, isFullScreen);
        }}
        id="message"
        placeholder="Expand the input box by clicking ^"
        onkeydown={(event) => {
          handleKeyDown(event, isFullScreen);
        }}
        data-testid="chatInput"
      ></textarea>
    </div>

    <button
      aria-label="expand input area"
      id="expandInputArea"
      title="expand input area"
      onclick={toggleFullScreenMode}
      type="button"
      class:fullScreen={isFullScreen}
      class="fullScreenButton"
    >
      <div class="visualA"></div>
      <div class="visualB"></div>
    </button>

    <button
      aria-label="shrink input area"
      id="expandInputArea_second"
      title="minimize input area"
      onclick={toggleFullScreenMode}
      type="button"
      class:fullScreen={isFullScreen}
      class="fullScreenButton_secondary"
    ></button>

    {#if $generating}
      <button
        aria-label="cancel generation"
        class="submit-normal stopGenerating"
        onclick={cancelGeneration}
      ></button>
    {:else}
      <button
        id="chatSubmit"
        title="Send"
        class:submit-normal={!isFullScreen}
        class:submit-fullScreen={isFullScreen}
        type="submit"
        data-testid="chatSubmit"
        onclick={sendQA}
      >
        <!-- <img class="svgImg" src="/svgs/arrow.up.circle.svg" alt="Send Message" /> -->
      </button>
    {/if}
  </div>

  <div class="disclaimer">
    AI models can make mistakes. Consider checking important information.
  </div>
</form>

<style>
  button {
    color: var(--reverseBackground);
  }

  .main {
    flex: 3;
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: clip;
  }

  .notification {
    z-index: 999;
    padding: 15px 30px;
    border-radius: 0px 0px 20px 20px;
    position: absolute;
    background-color: var(--background);
    top: -89px;
    left: 50%;
    transform: translate(-50%);
    font-size: large;
    border-left: 2px solid var(--primary);
    border-right: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    transition: all 0.5s ease-in-out;
  }

  .notification.display {
    top: 0px;
  }

  /* Customize the label (the container) */
  .container {
    display: block;
    position: relative;
    margin-bottom: 5px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    text-align: center;
    padding: 15px 0px;
  }

  .container.gpt-4o-2024-08-06 {
    background-image: url("/LLM-Logos/GPT4o.png");
    background-size: 90%;
  }

  .container.gpt-4o-mini-2024-07-18 {
    background-image: url("/LLM-Logos/GPT4o_mini.png");
    background-size: 90%;
  }

  .container.gpt-4 {
    background-image: url("/LLM-Logos/GPT4.png");
    background-size: 90%;
    background-position: left;
  }

  .container.gpt-4-turbo {
    background-image: url("/LLM-Logos/GPT4_turbo.png");
    background-size: 90%;
  }

  .container.o1-preview-2024-09-12 {
    background-image: url("/LLM-Logos/o1.png");
    background-size: 90%;
  }

  .container.o1-mini-2024-09-12 {
    background-image: url("/LLM-Logos/o1-mini.png");
    background-size: 90%;
  }

  .container.claude-3-5-sonnet-20241022 {
    background-image: url("/LLM-Logos/claude35_sonnet.png");
    background-size: 90%;
  }

  .container.claude-3-5-sonnet-20240620 {
    background-image: url("/LLM-Logos/claude35_sonnet.png");
    background-size: 90%;
  }

  .container.claude-3-sonnet-20240229 {
    background-image: url("/LLM-Logos/claude3_sonnet.png");
    background-size: 90%;
  }

  .container.claude-3-haiku-20240307 {
    background-image: url("/LLM-Logos/claude3_haiku.png");
    background-size: 90%;
  }

  .container.claude-3-opus-20240229 {
    background-image: url("/LLM-Logos/claude3_opus.png");
    background-size: 90%;
  }

  .container.models\/gemini-1\.5-pro-002 {
    background-image: url("/LLM-Logos/gemini15_pro.png");
    background-size: 90%;
  }

  .container.models\/gemini-1\.5-flash-002 {
    background-image: url("/LLM-Logos/gemini15_flash.png");
    background-size: 90%;
  }

  .container.fusion {
    background-image: url("/LLM-Logos/new_Polly.png");
    background-size: 80%;
  }

  .container.Auto {
    background-image: url("/LLM-Logos/lunarlink_auto.png");
    background-size: 80%;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* Create a custom checkbox */
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 50px;
    background-color: transparent;
    transition: 0.2s;
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .container .checkmark:after {
    top: -3px;
    left: -3px;
    height: 100%;
    width: 100%;
    border-radius: 50px;
    background-color: transparent;
    border: 3px solid;
    border-color: var(--primary);
  }

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

  .floatingInputPanel-normal {
    margin: auto;
    width: 100%;
    max-width: 1200px;
    padding: 0px 15px;
    background-color: var(--background);

    /* background-color: rgba(255, 255, 255, 0.92); */
  }

  .floatingInputPanel-fullScreen {
    position: absolute;
    height: auto;
    top: 0px;
    right: 0px;
    left: 0px;
    bottom: 0px;
    width: 100%;
    max-width: 100vw;
    border-radius: 0px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 99;

    display: flex;
    flex-direction: column;
  }

  .lowerUserInputBlock {
    min-height: 40px;
    position: relative;
    box-shadow: 0px 0px 5px rgb(195, 195, 195);
    border-radius: 35px;
    margin: 0px auto 10px auto;
    transition: 0.2s;
    background-color: var(--background);
    z-index: 23;
  }

  .lowerUserInputBlock.fullScreen {
    margin: 70px auto 0px auto;
    height: 100%;
    border-radius: 15px;
    width: 100%;
  }

  .lowerUserInputBlock.generating {
    border: none;
    outline: none;
    color: var(--reverseBackground);
    background: var(--background);
    border-radius: 35px;
  }

  .lowerUserInputBlock.generating:before {
    content: "";
    background: var(--primary2);
    /* background: linear-gradient(transparent 0%, var(--primary2) 100%); */
    position: absolute;
    top: -2px;
    left: -2px;
    /* background-size: 400%; */
    z-index: 22;
    filter: blur(5px);
    -webkit-filter: blur(5px);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    animation: glowing-button-85 3s infinite;
    transition: opacity 0.3s ease-in-out;
    border-radius: 35px;
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

  .lowerUserInputBlock.generating:after {
    z-index: 22;
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--background);
    left: 0;
    top: 0;
    border-radius: 35px;
  }

  form {
    position: relative;
  }

  form div {
    display: flex;
    margin: 5px auto 5px auto;
    max-width: 700px;
  }

  .userInputMidSection {
    flex-direction: column;
    margin: auto;
    width: 100%;
    height: auto;
    z-index: 23;
  }

  .userInputMidSection {
    height: 100%;
  }

  form textarea#message {
    display: block;
    width: auto;
    flex-grow: 1;
    padding: 11px 0px;
    line-height: 28px;
    font-size: 16px;
    max-height: 100px;
    resize: none;
    border: 0px;
    background-color: transparent;
    height: 50px;
    color: var(--reverseBackground);
  }

  form textarea#message:focus {
    outline: none;
  }

  form textarea#message.fullscreen {
    max-height: 100%;
    height: 100%;
    padding: 20px 50px 20px 15px;
  }

  form button,
  form label {
    display: block;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 25px;
    background-color: transparent;
    box-shadow: none;
  }

  div.coverForLLMSelectionAnimation {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--background);
    width: 100%;
    height: 65px;
    z-index: 22;
  }

  .floatingInputPanel-fullScreen div.coverForLLMSelectionAnimation {
    display: none;
  }

  div.LLMSelection {
    position: absolute;
    width: 100%;
    height: 60px;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    opacity: 0;
    z-index: 21;
    padding: 10px 10px 30px 10px;
    display: block;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 30px 30px 0px 0px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    left: 50%;
    transform: translateX(-50%);
    scrollbar-width: 0px;

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  div.LLMSelection::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }

  .floatingInputPanel-normal:hover div.LLMSelection,
  div.LLMSelection.hovered {
    top: 25px;
    transform: translate(-50%, -100%);
    opacity: 100;
    height: auto;
    max-height: 150px;
    transition: all 0.4s ease-in-out;
    overflow-y: scroll;
  }

  @media only screen and (max-width: 730px) {
    div.LLMSelection {
      width: auto;
      left: 15px;
      right: 15px;
      transform: none;
    }

    .floatingInputPanel-normal:hover div.LLMSelection,
    div.LLMSelection.hovered {
      transform: translate(0%, -100%);
    }
  }

  .floatingInputPanel-fullScreen div.LLMSelection {
    top: 0px;
    height: 90px;
    overflow-y: scroll;
    opacity: 100;
  }

  form div.LLMSelection button,
  form label.container {
    margin-right: 15px;
    width: 100%;
    max-width: 120px;
    height: 45px;
    border-radius: 50px;
    box-shadow: 0px 0px 5px rgb(195, 195, 195);
    transition: 0.2s;
    /* IT SHOULD BE ALWAYS WHITE */
    background-color: white;
    filter: brightness(var(--filterBrightness));
    display: inline-block;
  }

  .lowerUserInputBlock:hover,
  form div.LLMSelection button:hover,
  .checkmark:hover {
    box-shadow: 0px 0px 8px rgb(161, 161, 161);
  }

  input[type="file"] {
    display: none;
  }

  .attach-normal {
    background-image: var(--paperclip);
    /* background-image: url("/svgs/document-outline.svg"); */

    width: 70px;
    margin-right: 2px;
    cursor: pointer;
    z-index: 23;
  }

  .attach-fullScreen {
    background-image: var(--paperclip);
    background-color: transparent;
    box-shadow: none;
    position: absolute;
    bottom: 20px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-size: 60%;
    cursor: pointer;
    z-index: 24;
  }

  .fullScreenButton {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translate(-50%);
    width: 90px;
    height: 18px;
    padding: 0px;
    background-color: transparent;
    box-shadow: none;
    border-radius: 0px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    z-index: 24;
  }

  .fullScreenButton div.visualA,
  .fullScreenButton div.visualB {
    position: absolute;
    top: 1px;
    width: 40px;
    height: 6px;
    padding: 0px;
    background-color: #b0b0b0;
    transition: 0.3s all ease-in-out;
  }

  .fullScreenButton div.visualA {
    right: 50%;
    border-radius: 50px 0px 0px 50px;
  }

  .fullScreenButton div.visualB {
    left: 50%;
    border-radius: 0px 50px 50px 0px;
  }

  .fullScreenButton:hover div.visualA {
    right: 48%;
    transform: rotateZ(-15deg);
  }

  .fullScreenButton:hover div.visualB {
    left: 48%;
    transform: rotateZ(15deg);
  }

  .floatingInputPanel-normal:hover .fullScreenButton {
    opacity: 1;
  }

  .lowerUserInputBlock.generating .fullScreenButton {
    display: none;
  }

  .fullScreenButton_secondary {
    display: none;

    /* background-image:url("/svgs/arrow.up.right.and.arrow.down.left.circle.svg"); */
    background-repeat: no-repeat;
    background-position: center;
    background-color: transparent;
    background-size: 70%;
    box-shadow: none;
    position: absolute;
    padding: 0px;
    border-radius: 0px;
    transition: opacity 0.3s ease-in-out;
    top: auto;
    left: auto;
    bottom: 120px;
    right: 10px;
    transform: none;
    width: 40px;
    height: 40px;
    z-index: 24;
  }

  .fullScreenButton_secondary.fullScreen {
    display: block;
  }

  .fullScreenButton.fullScreen {
    /* background-image:url("/svgs/arrow.up.right.and.arrow.down.left.circle.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  box-shadow: none;
  top:auto;
  left: auto;
  bottom:120px;
  right:10px;
  transform: none;
  width: 40px;
  height: 40px;
  display: block;
  background-size: 70%;*/
    opacity: 1;
    transform: rotateZ(180deg) translate(50%);
  }

  .svgImg {
    filter: var(--whiteFilter);
    width: 33px;
    height: 33px;
  }

  #chatSubmit {
    background-image: var(--send);
    background-size: 25px;
  }

  .submit-normal {
    /* background-image: url(/paperplane.fill.svg); */
    background-size: 50%;
    width: 70px;
    margin-left: 2px;
    z-index: 23;
  }

  .stopGenerating {
    background-image: var(--stop);
  }

  .submit-fullScreen {
    position: absolute;
    bottom: 70px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-size: 70%;
    /* background-image: url(/paperplane.fill.svg); */
    background-color: transparent;
    box-shadow: none;
    z-index: 24;
  }

  .uploded-file-display,
  .uploded-file-display-fullScreen {
    background-color: transparent;
    width: 100%;
    margin: 0px;
  }

  .disclaimer {
    display: block;
    width: 100%;
    height: 7px;
    text-align: center;
    font-size: 10px;
    font-weight: 300;
    z-index: 99;
  }

  .fileLoader {
    width: 48px;
    height: 48px;
    border: 5px solid #000000;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    position: absolute;
    margin: 11px 11px 0px 11px;
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
