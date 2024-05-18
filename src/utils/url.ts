import lzs from "lz-string";

export function getStateFromUrl(path: string) {
  let configFromUrl = null;
  let basePath = path;
  if (basePath.endsWith("/")) {
    basePath = basePath.slice(0, -1);
  }

  if (basePath.endsWith("/playground")) {
    basePath = basePath.slice(0, -"/playground".length);
  }

  // check if we can omit the last segment
  const [configHash, c, ...rest] = basePath.split("/").reverse();
  if (c === "c") {
    basePath = rest.reverse().join("/");
    try {
      configFromUrl = JSON.parse(lzs.decompressFromEncodedURIComponent(configHash));
    } catch (error) {
      console.error(error);
    }
  }
  return { basePath, configFromUrl };
}

// NOTE: The default langserve app uses the base path /pirate-speak, so mirroring that
// if that changes one would have to make sure these queries would still resolve properly
export function resolveApiUrl(href: string, path: string) {
  // const { basePath } = getStateFromUrl(window.location.href);
  const { basePath } = getStateFromUrl(href);
  let prefix = new URL(basePath).pathname;
  if (prefix.endsWith("/")) prefix = prefix.slice(0, -1);

  const url = new URL(prefix + path, basePath);
  url.port = "8000";
  return url;
  // return new URL(prefix + path, basePath);
}
