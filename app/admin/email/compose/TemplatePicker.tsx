"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TemplatePicker({
  templates,
  selected
}: {
  templates: { id: string; name: string }[];
  selected: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("template", value);
    else next.delete("template");
    router.push(`/admin/email/compose?${next.toString()}`);
  }

  return (
    <select
      aria-label="Email template picker"
      defaultValue={selected ?? ""}
      name="_template_picker"
      onChange={(e) => onChange(e.currentTarget.value)}
    >
      <option value="">— Blank email —</option>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}
