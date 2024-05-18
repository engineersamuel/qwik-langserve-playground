import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "../components/starter/header/header";

import styles from "./styles.css?inline";
import { Toaster } from "qwik-sonner";

export const onGet: RequestHandler = async ({ cacheControl, redirect, pathname }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });

  // For demo purposes we only have one route, so redirect to it if the user navigates to the root
  if (!pathname.includes('/pirate-speak')) {
    throw redirect(302, '/pirate-speak');
  }

};

export default component$(() => {
  useStyles$(styles);
  return (
    <div class="flex items-center flex-col text-ls-black bg-background">
      <div class="flex flex-col h-screen w-screen">
        <Header />
        <Slot />
        <Toaster position="top-right" />
      </div>
    </div>
  );
});
