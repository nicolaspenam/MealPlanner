export function routerBasename(baseUrl = import.meta.env.BASE_URL): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  return trimmed === "" ? "/" : trimmed;
}
