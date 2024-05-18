import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { JsonSchema } from "@jsonforms/core";
import defaults from "~/utils/defaults";
import { simplifySchema } from "~/utils/simplifySchema";
import { resolveApiUrl } from "~/utils/url";
import lzs from "lz-string";


// NOTE: The default langserve app uses the base path /pirate-speak, so mirroring that
// if that changes one would have to make sure these queries would still resolve properly

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CONFIG_SCHEMA?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    INPUT_SCHEMA?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OUTPUT_SCHEMA?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FEEDBACK_ENABLED?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PUBLIC_TRACE_LINK_ENABLED?: any;
  }
}

export const useFeedback = routeLoader$(async (requestEvent) => {
  if (!import.meta.env.DEV && window.FEEDBACK_ENABLED) {
    return window.FEEDBACK_ENABLED === "true";
  }

  const response = await fetch(resolveApiUrl(requestEvent.url.href, "/feedback"), {
    method: "HEAD",
  });
  return response.ok;
});

export const usePublicTraceLink = routeLoader$(async (requestEvent) => {
  if (!import.meta.env.DEV && window.PUBLIC_TRACE_LINK_ENABLED) {
    return window.PUBLIC_TRACE_LINK_ENABLED === "true";
  }

  const response = await fetch(resolveApiUrl(requestEvent.url.href, "/public_trace_link"), {
    method: "HEAD",
  });
  return response.ok;
});

export const useConfigSchema = routeLoader$(async (requestEvent) => {
  let schema: JsonSchema | null = null;
  if (!import.meta.env.DEV && window.CONFIG_SCHEMA) {
    schema = await simplifySchema(window.CONFIG_SCHEMA);
  } else {
    const url = resolveApiUrl(requestEvent.url.href, `/config_schema`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();
    schema = await simplifySchema(json);
  }

  if (schema == null) return null;
  const output = {
    schema,
    defaults: defaults(schema),
  };
  return output;
});

export const useInputSchema = routeLoader$(async (requestEvent) => {
  // NOTE: The reference Langserve only uses {}, if we needed to support passing in configData would have to use server$, or useResource
  const configData = {};
  const prefix = configData
    ? `/c/${lzs.compressToEncodedURIComponent(JSON.stringify(configData))}`
    : "";

  let schema: JsonSchema | null = null;

  if (!prefix && !import.meta.env.DEV && window.INPUT_SCHEMA) {
    schema = await simplifySchema(window.INPUT_SCHEMA);
  } else {
    const url = resolveApiUrl(requestEvent.url.href, `${prefix}/input_schema`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();
    schema = await simplifySchema(json);
  }

  if (schema == null) return null;
  const output = {
    schema,
    defaults: defaults(schema),
  };
  return output;
});

export const useOutputSchema = routeLoader$(async (requestEvent) => {
  // NOTE: The reference Langserve only uses {}, if we needed to support passing in configData would have to use server$, or useResource
  const configData = {};
  const prefix = configData ? `/c/${lzs.compressToEncodedURIComponent(JSON.stringify(configData))}` : "";

  let schema: JsonSchema | null = null;

  if (!prefix && !import.meta.env.DEV && window.OUTPUT_SCHEMA) {
    schema = await simplifySchema(window.OUTPUT_SCHEMA);
  } else {
    const response = await fetch(resolveApiUrl(requestEvent.url.href, `${prefix}/output_schema`));
    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();
    schema = await simplifySchema(json);
  }

  if (schema == null) return null;
  const output = {
    schema,
    defaults: defaults(schema),
  };
  return output;
});


export default component$(() => {
  return (
    <>
      <Slot />
    </>
  );
});
