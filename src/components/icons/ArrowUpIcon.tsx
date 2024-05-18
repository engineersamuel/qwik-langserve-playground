import { QwikIntrinsicElements, component$ } from "@builder.io/qwik";

type Props = {
  title?: string;
} & QwikIntrinsicElements['svg'];

const ArrowUpIcon = component$<Props>((props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-arrow-up"
      {...props}
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  )
});
export default ArrowUpIcon;