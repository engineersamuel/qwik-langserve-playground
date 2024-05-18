import { $, component$, useOn, useSignal } from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import CheckCircleIcon from "~/media/CheckCircleIcon.svg?jsx";
import CopyIcon from "~/media/CopyIcon.svg?jsx";
import { delay } from "~/utils/promise";

type Props = {
  value: string;
}
const CopyButton = component$<Props>((props) => {
  const copied = useSignal(false);


  useOn('click', $(() => {
    copied.value = true
    navigator.clipboard.writeText(props.value).then(() => delay(1500).then(() => copied.value = false));
  }));

  return (
    <button class="px-3 py-1">
      {copied.value ? <CheckCircleIcon /> : <CopyIcon />}
    </button>
  );
});
export default CopyButton;
