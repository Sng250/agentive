import { ChatDeepSeek } from "@langchain/deepseek";
import {ToolNode} from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";
import {
    END,
    MessagesAnnotation,
    START,
    StateGraph,
  } from "@langchain/langgraph";


// Connect to wxflows
const toolClient = new wxflows({
    endpoint: process.env.WXFLOWS_ENDPOINT || "",
    apikey: process.env.WXFLOWS_APIKEY,
  });

// Retrieve the tools
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);


const initialiseModel = () => {
    const model = new ChatDeepSeek({
        modelName: "deepseek-reasoner",
        apiKey: process.env.DEEPSEEK_API_KEY,
        temperature: 0.7,
        maxTokens: 4096,
        streaming: true,
        cache: true,
        callbacks: [
            {
                handleLLMStart: async () => {
                  // console.log("🤖 Starting LLM call");
                },
                handleLLMEnd: async (output) => {
                  console.log("🤖 End LLM call", output);
                  const usage = output.llmOutput?.usage;
                  if (usage) {
                    // console.log("📊 Token Usage:", {
                    //   input_tokens: usage.input_tokens,
                    //   output_tokens: usage.output_tokens,
                    //   total_tokens: usage.input_tokens + usage.output_tokens,
                    //   cache_creation_input_tokens:
                    //     usage.cache_creation_input_tokens || 0,
                    //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
                    // });
                  }
                },
                // handleLLMNewToken: async (token: string) => {
                //   // console.log("🔤 New token:", token);
                // },
              },
        ]
    }).bindTools(tools);

    return model;
}

const createWorkflow = () => {
    const model = initialiseModel();
    const stateGraph = new StateGraph(MessagesAnnotation).addNode(
        "agent",
        async (state) => {
            const systemContent = SYSTEM_MESSAGE;
        }
    )
}