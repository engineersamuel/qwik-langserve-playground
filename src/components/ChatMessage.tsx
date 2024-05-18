import { $, QRL, component$, useSignal } from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import AutosizeTextarea from "./AutosizeTextarea";
import TrashIcon from "~/media/TrashIcon.svg?jsx";
import RefreshCW from "~/components/icons/RefreshCW";
import { resolveApiUrl } from "~/utils/url";
import { ChatMessageBody } from "~/utils/message";

type Props = {
  message: ChatMessageBody;
  isLoading?: boolean;
  onError?: QRL<(e: Error) => string | number | void>;
  onTypeChange?: QRL<(newValue: string) => void>;
  onInput?: QRL<(e: InputEvent, elem: HTMLTextAreaElement) => string | void>;
  onRemove?: QRL<(event: MouseEvent, elem: SVGSVGElement) => void>;
  onRegenerate?: QRL<(e?: any) => void>;
  isFinalMessage?: boolean;
  feedbackEnabled?: boolean;
  publicTraceLinksEnabled?: boolean;
  key: string;
};

// Copied and modified from https://github.com/langchain-ai/langserve/blob/main/langserve/chat_playground/src/components/ChatMessage.tsx
const ChatMessage = component$<Props>((props) => {

  const publicTraceLink = useSignal<string | null>(null);
  const messageActionIsLoading = useSignal(false);

  const openPublicTrace = $(async (_event: MouseEvent, _elem: HTMLButtonElement) => {
    if (messageActionIsLoading.value) {
      return;
    }
    if (isBrowser && publicTraceLink.value) {
      window.open(publicTraceLink.value, '_blank');
      return;
    }
    messageActionIsLoading.value = true;
    const payload = { run_id: props.message.runId };
    const response = await fetch(resolveApiUrl("http://localhost:8000/pirate-speak", "/public_trace_link"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) {
        props.onError?.(new Error(`Feedback endpoint not found. Please enable it in your LangServe endpoint.`));
      } else {
        try {
          const errorResponse = await response.json();
          props.onError?.(new Error(`${errorResponse.detail}`));
        } catch (e) {
          props.onError?.(new Error(`Request failed with status: ${response.status}`));
        }
      }
      messageActionIsLoading.value = false;
      throw new Error(`Failed request ${response.status}`)
    }
    if (isBrowser) {
      const parsedResponse = await response.json();
      messageActionIsLoading.value = false;
      publicTraceLink.value = parsedResponse.public_url;
      window.open(parsedResponse.public_url, '_blank');
    }
  });

  return (
    <div class="mb-8 group" key={props.key}>
      <div class="flex justify-between">
        <select
          class="font-medium text-transform uppercase mb-2 appearance-none"
          value={props.message.type}
          onChange$={(_event, elem) => props.onTypeChange?.(elem.value)}
        >
          <option value="human">HUMAN</option>
          <option value="ai">AI</option>
          <option value="system">SYSTEM</option>
        </select>
        <span class="flex">
          {props.isFinalMessage && props.message.type === "human" &&
            <RefreshCW class="opacity-0 group-hover:opacity-50 transition-opacity duration-200 cursor-pointer h-4 w-4 mr-2" onMouseUp$={props.onRegenerate} />
          }
          <TrashIcon
            class="opacity-0 group-hover:opacity-50 transition-opacity duration-200 cursor-pointer h-4 w-4"
            onMouseUp$={props.onRemove}
          ></TrashIcon>
        </span>
      </div>
      <AutosizeTextarea value={props.message.content} fullHeight={true} onInput={props.onInput} onKeyDown={$((e) => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          props.isFinalMessage &&
          props.message.type === "human"
        ) {
          e.preventDefault();
          props.onRegenerate?.();
        }
      })} />
      {props.message.type === "ai" && !props.isLoading && props.message.runId != null && (
        <div class="mt-2 flex items-center">
          {/* {feedbackEnabled && <span class="mr-2"><CorrectnessFeedback runId={runId} onError={props.onError}></CorrectnessFeedback></span>} */}
          {props.publicTraceLinksEnabled && <>
            <button
              class="bg-button-inline p-2 rounded-lg text-xs font-medium hover:opacity-80"
              disabled={messageActionIsLoading.value || props.isLoading}
              onMouseUp$={openPublicTrace}
            >
              🛠️ View LangSmith trace
            </button>
          </>}
        </div>
      )}
    </div>
  )
});

export default ChatMessage;
