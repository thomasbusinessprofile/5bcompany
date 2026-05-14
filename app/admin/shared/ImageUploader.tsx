"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

type Props = {
  // Form field name where the uploaded URL(s) should be appended.
  fieldName: string;
  // Optional folder prefix inside the bucket (e.g. "products" or "articles").
  folder?: string;
  // If true, accept multiple files and append each URL on a new line.
  multiple?: boolean;
  // Initial value to render into the underlying field.
  defaultValue?: string;
  // Rows for the textarea (multi-image mode).
  rows?: number;
  // Placeholder shown in the textarea / input.
  placeholder?: string;
};

const BUCKET = "cms-images";

function slugifyFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const ext = (dot > 0 ? name.slice(dot + 1) : "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${stem || "img"}.${ext || "jpg"}`;
}

export function ImageUploader({
  fieldName,
  folder = "uploads",
  multiple = false,
  defaultValue = "",
  rows = 3,
  placeholder
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("Supabase not configured.");
      return;
    }

    setBusy(true);
    const uploaded: string[] = [];
    let failed = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        failed++;
        continue;
      }
      const stamp = Date.now().toString(36);
      const path = `${folder}/${stamp}-${Math.random().toString(36).slice(2, 8)}-${slugifyFilename(file.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false
      });
      if (error) {
        failed++;
        setStatus(`Upload failed: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    if (uploaded.length > 0) {
      setValue((prev) => {
        if (multiple) {
          const merged = [prev.trim(), uploaded.join("\n")].filter(Boolean).join("\n");
          return merged;
        }
        return uploaded[0];
      });
      setStatus(`Uploaded ${uploaded.length}${failed ? ` (${failed} failed)` : ""}.`);
    } else if (failed > 0 && !status) {
      setStatus(`Upload failed for ${failed} file(s).`);
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const urls = multiple
    ? value.split(/\r?\n/).map((u) => u.trim()).filter(Boolean)
    : value ? [value] : [];

  return (
    <div className="image-uploader">
      <div className="image-uploader-controls">
        <input
          accept="image/*"
          disabled={busy}
          multiple={multiple}
          onChange={(e) => void handleFiles(e.target.files)}
          ref={inputRef}
          type="file"
        />
        {busy ? <span className="muted">Uploading…</span> : null}
        {status ? <span className="muted">{status}</span> : null}
      </div>

      {multiple ? (
        <textarea
          name={fieldName}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "One image URL per line. Use the upload button above to add files."}
          rows={rows}
          value={value}
        />
      ) : (
        <input
          name={fieldName}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Upload a file or paste an image URL."}
          type="text"
          value={value}
        />
      )}

      {urls.length > 0 ? (
        <div className="image-preview-row">
          {urls.map((url) => (
            <img alt="" key={url} src={url} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
