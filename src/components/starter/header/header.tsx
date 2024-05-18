import { $, component$, useSignal } from "@builder.io/qwik";
import QwikLogo from "~/media/qwik-logo-black-text.svg?jsx";
import LangServeLogo from "~/media/LangServeLogo.svg?jsx";
import ShareDialog from "~/components/dialogs/ShareDialog";

declare global {
  interface HTMLElement {
    showModal(): void;
    close(): void;
  }
}

export default component$(() => {
  const dialogRef = useSignal<HTMLElement>();

  const showShareModal = $(() => {
    dialogRef.value?.showModal();
  });

  const closeShareModal = $(() => {
    dialogRef.value?.close();
  });

  return (
    <nav class="flex items-center justify-between p-4">
      <div class="flex items-center">
        <QwikLogo height={100} width={143} />
        <LangServeLogo />
      </div>
      <div class="flex items-center space-x-4">
        <button
          type="button"
          class="border border-blue-700 rounded-full px-8 py-2 share-button"
          onClick$={showShareModal}
        >
          <span>Share</span>
        </button>
      </div>
      <ShareDialog
        config={{}}
        ref={dialogRef}
        close={closeShareModal}
      />
    </nav>
  )
});
