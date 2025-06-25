<script>
  import { Marked } from "marked";
  import { markedHighlight } from "marked-highlight";

  import markedKatex from "marked-katex-extension";
  import hljs from "highlight.js";


  const marked = new Marked(
    markedHighlight({
      langPrefix: "hljs language-",
      /**
       * @param {string} code
       * @param {string} lang
       */
      // @ts-ignore
      highlight(code, lang, _) {
        if (lang === "svelte") {
          lang = "javascript";
        }

        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  const options = {
    throwOnError: false,
  };

  marked.use(markedKatex(options));

  /** @type {{ response: ModelResponse, qaIndex: number, clickSelect: () => void, hideOthers: () => void }} */
  const { response, qaIndex, clickSelect, hideOthers } = $props();

  // @ts-ignore
  let parsed = $derived.by(() => {
    const replacedInline = replaceInlineDelimiters(response.content);
    const replacedBlock = replaceBlockDelimiters(replacedInline);

    // @ts-ignore
    const parsed = marked.parse(replacedBlock);
    return parsed;
  });

  // @ts-ignore
  let sections = $derived(splitCodeBlocks(parsed));

  /**
   * @param {string} text
   */
  function replaceBlockDelimiters(text) {
    const regex = /\\\[.*?\\\]/gs;
    const replaced = text.replace(regex, (match) => {
      return `\n\`\`\`tex\n${match}\n\`\`\`\n$$\n${match.slice(2, -2)}\n$$\n`;
    });
    return replaced;
  }

  /**
   * @param {string} text
   */
  function replaceInlineDelimiters(text) {
    const regex = /\\\(.*?\\\)/g;
    const replaced = text.replace(regex, (match) => {
      return `$${match.slice(2, -2)}$`;
    });
    return replaced;
  }

  /**
   * @param {string} text
   */
  function splitCodeBlocks(text) {
    const regex = /<pre[^>]*>[\s\S]*?<\/pre>/g;

    const nonCode = text.split(regex);
    const code = text.match(regex) ?? [];

    /**
     * @type {[string, string][]}
     */
    const newSections = [];

    for (let i = 0; i < nonCode.length; i++) {
      newSections.push(["text", nonCode[i]]);
      if (code[i]) {
        newSections.push(["code", code[i]]);
      }
    }

    return newSections;
  }

  /**
   * @param {string} html
   */
  // @ts-ignore
  function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  /**
   * @param {Event} event
   * @param {string | Promise<string>} str
   * @param {boolean} isCode
   */
  function copyToClipboard(event, str, isCode) {
    // str = stripHtml(str);
    const type = "text/html";
    // @ts-ignore
    const blob = new Blob([str], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard
      .write(data)
      .then(() => {
        alert("HTML content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error in copying text: ", err);
      });

    const btn = event.target;
    if (!btn) {
      return;
    }

    if (isCode) {
      // @ts-ignore
      btn.innerHTML =
        "<img src='/svgs/checkmark.circle.svg' class='copyCodeIcon' alt='clipboard icon' height='20px'> Copied!";

      setTimeout(() => {
        // @ts-ignore
        btn.innerHTML =
          "<img src='/svgs/list.clipboard.copyCode.svg' class='copyCodeIcon' alt='clipboard icon' height='20px'>Copy Code";
      }, 3000);
    } else {
      // @ts-ignore
      btn.style.backgroundImage = "url('/svgs/checkmark.circle.fill.blue.svg')";
      // @ts-ignore
      btn.style.backgroundSize = "20px";

      setTimeout(() => {
        // @ts-ignore
        btn.style.backgroundImage = "url('/svgs/document.on.document.svg')";
        // @ts-ignore
        btn.style.backgroundSize = "16px";
      }, 3000);
    }
  }
</script>

<div class="LLMbg">
  <div class="LLM {response.role}">{response.role}</div>
  <div class="eachResponseTools">
    <button
      id="copyButton"
      title="copy full response"
      class="copy"
      onclick={(event) => copyToClipboard(event, parsed, false)}
    >
      <!-- <img class="svgImg" src="/svgs/copy-outline.svg" alt="Copy" /> -->
    </button>
    <button
      id="starButton"
      title="star this response"
      class="changeConvoHisSelection"
      onclick={() => {
        console.log("hi");
        clickSelect();
      }}
    >
      <!-- <img class="svgImg" src="/svgs/star.svg" alt="Copy" /> -->
    </button>
    <button
      id="expandButton"
      title="expand this response"
      class="expandConvo"
      onclick={hideOthers}
    >
      <!-- <img class="svgImg" src="/svgs/expand.svg" alt="Copy" /> -->
    </button>
  </div>
</div>

<div class="wholeBlock">
  {#if response.error == "" && response.content == ""}
    <div style="width: 150px; margin: auto; padding-top:20px;">
      AI is thinking
      <!-- <LogoAnimation /> -->
    </div>
  {/if}

  {#each sections as section, i}
    {#if section[0] == "code" && section[1].includes("hljs")}
      <button
        class="copyCode"
        onclick={(event) => copyToClipboard(event, section[1], true)}
      >
        <img
          src="/svgs/list.clipboard.copyCode.svg"
          class="copyCodeIcon"
          alt="clipboard icon"
          height="20px"
        />
        Copy Code
      </button>
    {/if}

    <div class="markdown-body">
      <span
        class="text-container"
        data-testid={`responseContent-${response.role}-${qaIndex}`}
        >{@html section[1]}</span
      >
    </div>
  {/each}

  {#if response.error != "Stopped" && response.error != "Cancelled"}
    {response.error}
  {/if}
</div>

<style>
  .gradient-text {
    position: relative;
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background: #fff;
    overflow: hidden;
    font-size: 1.2em;
    line-height: 1.5em;
  }

  .gradient-text::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 300px;
    pointer-events: none; /* Ensure the pseudo-element does not interfere with mouse events */
  }

  @keyframes fadeOutGradient {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .svgImg {
    filter: var(--whiteFilter);
    width: 20px;
    height: 20px;
    margin: auto;
  }

  .eachResponseTools {
    height: 40px;
    max-width: 130px;

    position: absolute;
    top: 0px;
    right: 0px;
    margin-top: 10px;
    background-color: var(--background);
    border-radius: 70px;

    display: flex;
    flex-direction: row;
    overflow: hidden;

    box-shadow: 0px 0px 5px rgb(195, 195, 195);
    transition: all 0.3s ease-in-out;
  }

  .eachResponseTools button {
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 0px;
    padding: 15px 20px;
    box-shadow: none;
  }

  .eachResponseTools button.copy {
    background-image: var(--copy);
    background-size: 16px;
  }

  .eachResponseTools button.changeConvoHisSelection {
    background-image: var(--star);
    background-size: 20px;
  }

  .eachResponseTools button.expandConvo {
    background-image: var(--expand);
    background-size: 18px;
    display: none;
  }

  .eachResponseTools button:hover {
    filter: none;
    background-color: var(--primary3);
  }

  .eachResponseTools button:focus {
    background-color: var(--primary1);
  }

  div .wholeBlock {
    position: sticky;
    top: 70px;
  }

  .LLMbg {
    position: sticky;
    top: -8px;
    background-color: var(--background);
    z-index: 5;
    height: 50px;
  }

  .LLM {
    /* IT SHOULD BE ALWAYS WHITE */
    background-color: white;
    filter: brightness(var(--filterBrightness));
    background-repeat: no-repeat;
    background-position: center;
    background-size: 90%;
    width: 120px;
    height: 40px;
    border-radius: 70px;
    box-shadow: 0px 0px 5px rgb(195, 195, 195);
    position: absolute;
    top: 0px;
    left: 0px;
    margin-top: 10px;
  }

  .LLM.gpt-4o-2024-08-06 {
    background-image: url("/LLM-Logos/GPT4o.png");
  }

  .LLM.gpt-4o-mini-2024-07-18 {
    background-image: url("/LLM-Logos/GPT4o_mini.png");
  }

  .LLM.gpt-4 {
    background-image: url("/LLM-Logos/GPT4.png");
  }

  .LLM.gpt-4-turbo {
    background-image: url("/LLM-Logos/GPT4_turbo.png");
  }

  .claude-3-haiku-20240307 {
    background-image: url("/LLM-Logos/claude3_haiku.png");
  }

  .LLM.claude-3-5-sonnet-20240620 {
    background-image: url("/LLM-Logos/claude35_sonnet.png");
  }

  .LLM.claude-3-5-sonnet-20241022 {
    background-image: url("/LLM-Logos/claude35_sonnet.png");
  }

  .LLM.claude-3-opus-20240229 {
    background-image: url("/LLM-Logos/claude3_opus.png");
  }

  .LLM.claude-3-sonnet-20240229 {
    background-image: url("/LLM-Logos/claude3_sonnet.png");
    background-size: 90%;
  }

  .LLM.models\/gemini-1\.5-pro-002 {
    background-image: url("/LLM-Logos/gemini15_pro.png");
  }

  .LLM.models\/gemini-1\.5-flash-002 {
    background-image: url("/LLM-Logos/gemini15_flash.png");
  }

  .LLM.fusion {
    background-image: url("/LLM-Logos/new_Polly.png");
  }
  .LLM.o1-preview-2024-09-12 {
    background-image: url("/LLM-Logos/o1.png");
    background-size: 90%;
  }

  .LLM.o1-mini-2024-09-12 {
    background-image: url("/LLM-Logos/o1-mini.png");
    background-size: 90%;
  }

  button.copyCode {
    width: 100%;
    height: auto;

    padding: 0px 10px 5px 10px;
    font-weight: 400;
    font-size: small;
    text-align: right;

    position: relative;
    top: 3px;
    margin: 5px 0px 0px auto;

    color: var(--codeColor);
    background-color: var(--codeBg);
    border-radius: 10px 10px 0px 0px;
    box-shadow: none;
  }

  button.copyCode:hover {
    text-decoration: underline;
    filter: none;
  }

  button.copyCode .copyCodeIcon {
    position: relative;
    top: 5px;
    margin-right: 5px;
    color: var(--background);
  }
</style>
