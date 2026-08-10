export type MediaAssetDTO = {
  id: string;
  url: string;
  type: "image" | "video";
  filename: string;
  alt: string | null;
  createdAt: string;
};

export async function uploadAndRegisterMedia(file: File): Promise<MediaAssetDTO> {
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const uploadJson = await uploadRes.json();
  if (!uploadJson.success) {
    throw new Error(uploadJson.error?.message ?? "Upload failed");
  }

  const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const registerRes = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: uploadJson.data.url, type, filename: file.name }),
  });
  const registerJson = await registerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.error?.message ?? "Failed to register media");
  }
  return registerJson.data;
}

export async function fetchMediaAssets(type: "image" | "video"): Promise<MediaAssetDTO[]> {
  const res = await fetch(`/api/admin/media?type=${type}`);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to load media");
  }
  return json.data;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to delete media");
  }
}
