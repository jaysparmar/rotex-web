import path from "path";

/*
  Where uploaded media lands on disk.

  Defaults to public/uploads so local dev keeps working unchanged. Set UPLOAD_DIR
  in production to a path on a persistent volume — anything written into public/
  after the build is not part of the deployed output, so those files disappear
  (or 404) on hosts that rebuild or use an ephemeral filesystem.
*/
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export function contentTypeFor(filename: string): string {
  return CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
}

/*
  Resolves a request path inside UPLOAD_DIR, refusing anything that escapes it
  (../, absolute paths, encoded traversal).
*/
export function resolveUploadPath(segments: string[]): string | null {
  const target = path.resolve(UPLOAD_DIR, ...segments);
  const root = path.resolve(UPLOAD_DIR);

  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}
