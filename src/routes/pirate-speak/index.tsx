import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import ChatWindow from "~/components/ChatWindow";
import { useInputSchema, useOutputSchema } from "./layout";

// Copied and modified from https://github.com/langchain-ai/langserve/blob/main/langserve/chat_playground/src/App.tsx
export default component$(() => {
  const inputSchema = useInputSchema();
  const outputSchema = useOutputSchema();
  const inputProps = inputSchema.value?.schema?.properties;
  const outputDataSchema = outputSchema.value?.schema;
  const isLoading = inputProps === undefined || outputDataSchema === undefined;
  const inputKeys = Object.keys(inputProps ?? {});
  const inputSchemaSupported = (
    inputKeys.length === 1 &&
    inputProps?.[inputKeys[0]].type === "array"
  ) || (
      inputKeys.length === 2 && (
        (
          inputProps?.[inputKeys[0]].type === "array" ||
          inputProps?.[inputKeys[1]].type === "string"
        ) || (
          inputProps?.[inputKeys[0]].type === "string" ||
          inputProps?.[inputKeys[1]].type === "array"
        )
      )
    );
  const outputSchemaSupported = (
    outputDataSchema?.anyOf?.find((option) => option.properties?.type?.enum?.includes("ai")) ||
    outputDataSchema?.type === "string"
  );
  const isSupported = isLoading || (inputSchemaSupported && outputSchemaSupported);
  return (
    <>
      {isSupported
        ? <ChatWindow
          messagesInputKey={inputProps?.[inputKeys[0]].type === "array" ? inputKeys[0] : inputKeys[1]}
          inputKey={inputProps?.[inputKeys[0]].type === "string" ? inputKeys[0] : inputKeys[1]}
        />
        : <div class="h-[100vh] w-[100vw] flex justify-center items-center text-xl p-16">
          <span>
            The chat playground is only supported for chains that take one of the following as input:
            <ul class="mt-8 list-disc ml-6">
              <li>
                a dict with a single key containing a list of messages
              </li>
              <li>
                a dict with two keys: one a string input, one an list of messages
              </li>
            </ul>
            <br />
            and which return either an <code>AIMessage</code> or a string.
            <br />
            <br />
            You can test this chain in the default LangServe playground instead.
            <br />
            <br />
            To use the default playground, set <code>playground_type="default"</code> when adding the route in your backend.
          </span>
        </div>}
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik / LangServe Chat Playground",
  meta: [
    {
      name: "description",
      content: "Explore the LangServe Chat Playground to test your AI models in a chat environment.",
    },
  ],
};
