import { $, component$, useSignal } from "@builder.io/qwik";
import { RequestEventBase, server$ } from "@builder.io/qwik-city";
import ChatMessage from "~/components/ChatMessage";
import AutosizeTextarea from "~/components/AutosizeTextarea";
import EmptyState from "~/media/EmptyState.svg?jsx"
import { toast } from "qwik-sonner";
import { ChatMessageBody, ChatMessageType, isAIMessage } from "~/utils/message";
import CircleSpinIcon from "~/components/icons/CircleSpinIcon";
import ArrowUpIcon from "~/components/icons/ArrowUpIcon";
import { fetchEventSource, EventSourceEvent } from "@engineersamuel/fetch-event-source-stream";

const sendPayload = server$(async function*(input: unknown, config: unknown) {
  const self = this as unknown as RequestEventBase;
  for await (const s of fetchEventSource(`${self.env.get('LANGSERVE_BASE_URL') ?? ''}/stream_log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, config }),
    signal: self.signal
  })) {
    yield s;
  }
});


type Props = {
  messagesInputKey: string;
  inputKey?: string;
}

// Copied and modified from https://github.com/langchain-ai/langserve/blob/main/langserve/chat_playground/src/components/ChatWindow.tsx
const ChatWindow = component$<Props>((props) => {
  const messageInputRef = useSignal<HTMLTextAreaElement>();
  const messages = useSignal<ChatMessageBody[]>([]);
  const isLoading = useSignal(false);
  const currentInputValue = useSignal("");

  // NOTE: There is a known behavior here with retrying, it will show a blank AI message.  
  const initiateStream = $(async (input: unknown, config: unknown) => {
    const response = await sendPayload(input, config);
    for await (const r of response) {
      switch (r.event) {
        case EventSourceEvent.OPEN:
          messages.value = [
            ...messages.value,
            { type: "ai", content: "" },
          ];
          break;
        case EventSourceEvent.MESSAGE:
          const finalOutput = r.aggregatedState?.final_output;
          // By default the lookback index is -1, hwoever if there is a retry in the stream library then 
          // the OPEN event will create an empty ai content above which will need to be replaced, therefore
          // below we need to look at the previous message and if empty, make sure we replace accordingly
          const lookbackIdx = [null, ""].includes(messages.value[messages.value.length - 2]?.content) ? -2 : -1;
          if (typeof finalOutput === "string") {
            messages.value = [
              ...messages.value.slice(0, lookbackIdx),
              { type: "ai", content: finalOutput, runId: r.aggregatedState?.id }
            ];
          } else if (isAIMessage(finalOutput)) {
            messages.value = [
              ...messages.value.slice(0, lookbackIdx),
              { type: "ai", content: finalOutput.content, runId: r.aggregatedState?.id }
            ];
          }
          break;
        case EventSourceEvent.CLOSE:
          isLoading.value = false;
          break;
        case EventSourceEvent.ERROR:
          isLoading.value = false;
          toast.error(`${r.error?.message}\nCheck your backend logs for errors.`);
          console.error(messages.value[messages.value.length - 2]?.content, r.error);
          currentInputValue.value = messages.value[messages.value.length - 2]?.content;
          messages.value = [
            ...messages.value.slice(0, -2),
          ];
      }
    }
  });

  const regenerateMessages = $(() => {
    if (isLoading.value) {
      return;
    }
    isLoading.value = true;
    if (props.inputKey === undefined) {
      initiateStream({ [props.messagesInputKey]: messages }, {});
    } else {
      initiateStream({
        [props.messagesInputKey]: messages.value.slice(0, -1),
        [props.inputKey]: messages.value[messages.value.length - 1].content
      }, {});
    }
  });

  const submitMessage = $(() => {
    const submittedValue = currentInputValue.value;
    if (submittedValue.length === 0 || isLoading.value) {
      return;
    }
    isLoading.value = true;
    const newMessages = [
      ...messages.value,
      { type: "human", content: submittedValue } as const
    ];
    messages.value = newMessages;
    currentInputValue.value = "";
    if (props.inputKey === undefined) {
      initiateStream({ [props.messagesInputKey]: newMessages }, {});
    } else {
      initiateStream({
        [props.messagesInputKey]: newMessages.slice(0, -1),
        [props.inputKey]: newMessages[newMessages.length - 1].content
      }, {});
    }
  });

  const handleError = $((e: Error) => {
    toast(e.message);
  })

  return (
    <>
      <div class="flex-grow flex flex-col items-center justify-center mt-8">
        {messages.value.length > 0 ? (
          <div class="flex flex-col-reverse basis-0 overflow-auto flex-re grow max-w-[640px] w-[640px]">
            {messages.value.map((message, i) => {
              return (
                <ChatMessage
                  message={message}
                  key={`${btoa(message.content)}-${i}`}
                  isLoading={isLoading.value}
                  onError={handleError}
                  // feedbackEnabled={feedbackEnabled.data}
                  // publicTraceLinksEnabled={publicTraceLinksEnabled.data}
                  isFinalMessage={i === messages.value.length - 1}
                  onRemove={$(() => {
                    messages.value = [
                      ...messages.value.slice(0, i),
                      ...messages.value.slice(i + 1)
                    ]
                  })}
                  onTypeChange={$((newValue) => {
                    messages.value = [
                      ...messages.value.slice(0, i),
                      { ...message, type: newValue as ChatMessageType },
                      ...messages.value.slice(i + 1)
                    ]
                  })}
                  onInput={$((_e: InputEvent, elem: HTMLTextAreaElement) => {
                    messages.value = [
                      ...messages.value.slice(0, i),
                      { ...message, content: elem.value },
                      ...messages.value.slice(i + 1)
                    ]
                  })}
                  onRegenerate={regenerateMessages}
                />
              );
            }).reverse()}
          </div>
        ) : (
          <div class="flex flex-col items-center justify-center">
            <EmptyState />
            <h1 class="text-lg">Start testing your application</h1>
          </div>
        )}
      </div>
      <div class="m-16 mt-4 flex justify-center">
        <div class="flex items-center p-3 rounded-[48px] border shadow-sm max-w-[768px] grow" onClick$={() => messageInputRef.value?.focus()}>
          <AutosizeTextarea
            class="flex-grow mr-4 ml-8 border-none focus:ring-0 py-2 cursor-text"
            placeholder="Send a message..."
            value={currentInputValue.value}
            onInput={$((_e: Event, elem: HTMLTextAreaElement) => currentInputValue.value = elem.value)}
            onKeyDown={$((e, elem) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                currentInputValue.value = elem.value;
                submitMessage();
              }
            })}
          />
          <button
            class={"flex items-center justify-center px-3 py-1 rounded-[40px] " + (isLoading.value ? "" : currentInputValue.value.length > 0 ? " bg-blue-900 bg-opacity-80" : "bg-gray-500 bg-opacity-20")}
            onClick$={(e) => {
              e.preventDefault();
              submitMessage();
            }}
          >
            {isLoading.value
              ? <CircleSpinIcon class="animate-spin w-5 h-5 text-background fill-background" />
              : <ArrowUpIcon class="mx-2 my-2 h-5 w-5 stroke-white" />}
          </button>
        </div>
      </div>
    </>
  )
});

export default ChatWindow;
