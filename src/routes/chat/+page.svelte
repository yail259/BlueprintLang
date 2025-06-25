<script lang="ts">
  import OpenAI from "openai";
  import { PUBLIC_OPENAI} from "$env/static/public";

  const openai = new OpenAI({
    apiKey: PUBLIC_OPENAI,
    dangerouslyAllowBrowser: true

  });

  const send = async () => {
    const stream = await openai.responses.create({
      model: "gpt-4.1",
      input: "Tell me a three sentence bedtime story about a unicorn.",
      stream: true,
    });

    for await (const event of stream) {
      console.log(event);
    }
  };

  const send2 = async () => {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: "What did I just ask?",
      // stream: true,
      previous_response_id: "resp_685b65745180819e956ab3894477a2d709b4b945c72b50d7"
    });

    console.log(response);
  };
</script>

<button onclick={send}>send</button>
<button onclick={send2}>send2</button>
