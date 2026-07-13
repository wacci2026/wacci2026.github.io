export function withBasePath(path: string) {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH === "/"
      ? ""
      : (process.env.NEXT_PUBLIC_BASE_PATH ?? "");

  if (!path.startsWith("/") || path.startsWith(basePath)) {
    return path;
  }

  return `${basePath}${path}`;
}
