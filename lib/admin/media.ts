import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MediaSourceType = Database["public"]["Enums"]["media_source_type"];
type MediaType = Database["public"]["Enums"]["media_type"];

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
}

function mediaTypeFromFile(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export async function createUploadedMediaAsset({
  bucket,
  ownerId,
  file,
  altText,
  title,
}: {
  bucket: "listing-media" | "update-media" | "site-assets";
  ownerId: string;
  file: File;
  altText?: string | null;
  title?: string | null;
}) {
  if (!file.size) return null;
  const supabase = await createClient();
  const type = mediaTypeFromFile(file);
  const folder = type === "image" ? "images" : type === "video" ? "videos" : "documents";
  const path = `${ownerId}/${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      source_type: "upload" as MediaSourceType,
      media_type: type,
      storage_bucket: bucket,
      storage_path: path,
      public_url: publicData.publicUrl,
      title: title || file.name,
      alt_text: altText || title || file.name,
      mime_type: file.type || null,
      file_size_bytes: file.size,
      status: "published",
    })
    .select("id, public_url")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createExternalMediaAsset({
  sourceType,
  mediaType,
  url,
  title,
  altText,
  thumbnailUrl,
}: {
  sourceType: Exclude<MediaSourceType, "upload">;
  mediaType: MediaType;
  url: string;
  title?: string | null;
  altText?: string | null;
  thumbnailUrl?: string | null;
}) {
  if (!url) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      source_type: sourceType,
      media_type: mediaType,
      external_url: url,
      embed_url: sourceType === "youtube" || sourceType === "facebook" ? url : null,
      provider: sourceType,
      title: title || null,
      alt_text: altText || title || null,
      thumbnail_url: thumbnailUrl || null,
      status: "published",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

