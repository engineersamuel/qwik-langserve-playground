import { QRL, component$ } from "@builder.io/qwik";

const COMMON_CLS = "text-lg col-[1] row-[1] m-0 resize-none overflow-hidden whitespace-pre-wrap break-words border-none bg-transparent p-0";

type Props = {
  id?: string;
  value?: string | null | undefined;
  placeholder?: string;
  class?: string;
  onChange?: QRL<(e: string) => void>;
  onFocus?: QRL<() => void>;
  onBlur?: QRL<() => void>;
  onKeyDown?: QRL<(e: KeyboardEvent, elem: HTMLTextAreaElement) => void>;
  autoFocus?: boolean;
  readOnly?: boolean;
  cursorPointer?: boolean;
  disabled?: boolean;
  fullHeight?: boolean;
};

const AutosizeTextarea = component$<Props>((props) => {
  return (
    <div class={["grid w-full", props.class, props.fullHeight ? "" : " max-h-80 overflow-auto"]}>
      <textarea
        id={props.id}
        class={[
          COMMON_CLS,
          "caret-black"
        ]}
        disabled={props.disabled}
        value={props.value ?? ""}
        rows={1}
        onChange$={(e) => {
          const target = e.target as HTMLTextAreaElement;
          props.onChange?.(target.value);
        }}
        onFocus$={props.onFocus}
        onBlur$={props.onBlur}
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
