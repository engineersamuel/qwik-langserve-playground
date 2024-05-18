import { $, QRL, Signal, component$, useOn, useSignal } from "@builder.io/qwik";
import PadlockIcon from "~/media/PadlockIcon.svg?jsx";
import ShareIcon from "~/media/ShareIcon.svg?jsx";
import lzs from "lz-string";
import { getStateFromUrl } from "~/utils/url";
import CopyButton from "~/components/CopyButton";
import { useLocation } from "@builder.io/qwik-city";
import CodeIcon from "~/media/CodeIcon.svg?jsx";

const URL_LENGTH_LIMIT = 2000;

type Props = {
  ref: Signal<HTMLElement | undefined>;
  close: QRL<() => void>;
  config: unknown;
}
const ShareDialog = component$<Props>((props) => {
  const showDialog = useSignal(false);
  const location = useLocation();

  const hash = lzs.compressToEncodedURIComponent(JSON.stringify(props.config));
  const state = getStateFromUrl(location.url.href);

  // get base URL
  const targetUrl = `${state.basePath}/c/${hash}`;

  // .../c/[hash]/playground
  const playgroundUrl = `${targetUrl}/playground`;

  // cURL, JS: .../c/[hash]/invoke
  // Python: .../c/[hash]
  const invokeUrl = `${targetUrl}/invoke`;

  const pythonSnippet = `
from langserve import RemoteRunnable

chain = RemoteRunnable("${targetUrl}")
chain.invoke({ ... })
`;

  const typescriptSnippet = `
import { RemoteRunnable } from "langchain/runnables/remote";

const chain = new RemoteRunnable({ url: \`${invokeUrl}\` });
const result = await chain.invoke({ ... });
`;

  useOn('click', $(() => {
    showDialog.value = !showDialog.value;
  }));

  // TODO: Currently the routes are not mapped for the shared URL
  const isShareEnabled = false;
  return (
    <>
      <dialog ref={props.ref} class="modal rounded-lg">
        <div class="modal-box max-w-5xl min-h-[300px] p-8">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick$={props.close}>
              ✕
            </button>
          </form>
          <h3 class="flex items-center text-lg font-light">
            <ShareIcon class="flex-shrink-0 mr-2" />
            <span>Share</span>
          </h3>
          <div class="flex flex-col gap-3 pt-5">
            {playgroundUrl.length < URL_LENGTH_LIMIT && isShareEnabled && (
              <div class="flex flex-col gap-2 p-3 rounded-2xl">
                <div class="flex items-center">
                  <div class="w-10 h-10 flex items-center justify-center text-center text-sm bg-background rounded-xl">
                    🦜
                  </div>
                  <span>Chat interface</span>
                </div>
                <div class="grid grid-cols-[auto,1fr,auto] rounded-xl text-sm items-center border">
                  <PadlockIcon class="mx-3" />
                  <div class="overflow-auto whitespace-nowrap py-3 no-scrollbar">
                    {playgroundUrl.split("://")[1]}
                  </div>
                  <CopyButton value={playgroundUrl} />
                </div>
              </div>
            )}

            <div class="flex flex-col gap-2 p-3 rounded-2xl">
              <div class="flex items-center">
                <div class="w-10 h-10 flex items-center justify-center text-center text-sm bg-background rounded-xl">
                  <CodeIcon class="w-4 h-4" />
                </div>
                <span>Get the code</span>
              </div>

              {targetUrl.length < URL_LENGTH_LIMIT && (
                <div class="grid grid-cols-[1fr,auto] rounded-xl text-sm items-center border">
                  <div class="overflow-auto whitespace-nowrap px-3 py-3 no-scrollbar">
                    Python SDK
                  </div>
                  <CopyButton value={pythonSnippet.trim()} />
                </div>
              )}

              {invokeUrl.length < URL_LENGTH_LIMIT && (
                <div class="grid grid-cols-[1fr,auto] rounded-xl text-sm items-center border">
                  <div class="overflow-auto whitespace-nowrap px-3 py-3 no-scrollbar">
                    TypeScript SDK
                  </div>

                  <CopyButton value={typescriptSnippet.trim()} />
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
});
export default ShareDialog;
