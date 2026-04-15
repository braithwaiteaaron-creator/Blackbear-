export const API_V1_DEPRECATION = {
  sunset: "Wed, 31 Dec 2026 23:59:59 GMT",
  link: '</api/v1>; rel="successor-version"',
};

export function setDeprecationHeaders(
  response: Response,
  successorPath: string
): Response {
  response.headers.set("Deprecation", "true");
  response.headers.set("Sunset", API_V1_DEPRECATION.sunset);
  response.headers.set("Link", `<${successorPath}>; rel="successor-version"`);
  return response;
}

export function setApiVersionHeader(response: Response, version = "v1"): Response {
  response.headers.set("X-API-Version", version);
  return response;
}
