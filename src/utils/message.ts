export type ChatMessageType = "human" | "ai" | "function" | "tool" | "system";

export type ChatMessageBody = {
  type: ChatMessageType;
  content: string;
  runId?: string;
}

export type AIMessage = {
  content: string;
  type: "AIMessage" | "AIMessageChunk";
  name?: string;
  additional_kwargs?: { [key: string]: unknown };
}

export function isAIMessage(x: unknown): x is AIMessage {
  return x != null &&
    typeof (x as AIMessage).content === "string" &&
    ["AIMessageChunk", "AIMessage"].includes((x as AIMessage).type);
}
