import { QRL, component$ } from "@builder.io/qwik";

const COMMON_CLS = "text-lg col-[1] row-[1] m-0 resize-none overflow-hidden whitespace-pre-wrap break-words border-none bg-transparent p-0";

type Props = {
  value?: string | null | undefined;
  placeholder?: string;
  class?: string;
  onInput?: QRL<(e: InputEvent, elem: HTMLTextAreaElement) => string | void>;
  onKeyDown?: QRL<(e: KeyboardEvent, elem: HTMLTextAreaElement) => void>;
  autoFocus?: boolean;
  readOnly?: boolean;
  cursorPointer?: boolean;
  disabled?: boolean;
  fullHeight?: boolean;
};

const AutosizeTextarea = component$<Props>((props) => {
  return (
    <div class={["grid w-full", props.class, !props.fullHeight && " max-h-80 overflow-auto"]}>
      <textarea
        class={[
          COMMON_CLS,
          "text-transparent caret-black"
        ]}
        disabled={props.disabled}
        value={props.value ?? ""}
        rows={1}
        onInput$={props.onInput}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus && !props.readOnly}
        onKeyDown$={props.onKeyDown}
      />
      <div
        aria-hidden
        class={[COMMON_CLS, "pointer-events-none select-none"]}
      >
        {props.value}{" "}
      </div>
    </div>
  );
});
export default AutosizeTextarea;
