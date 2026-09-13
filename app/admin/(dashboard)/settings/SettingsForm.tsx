"use client";

import { useState } from "react";

interface SettingsValues {
  site_title: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  background_url: string;
}

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <Field
        label="Site title"
        value={values.site_title}
        onChange={(v) => update("site_title", v)}
      />
      <Field
        label="Site description"
        value={values.site_description}
        onChange={(v) => update("site_description", v)}
      />
      <Field
        label="Hero title"
        value={values.hero_title}
        onChange={(v) => update("hero_title", v)}
      />
      <Field
        label="Hero subtitle"
        value={values.hero_subtitle}
        onChange={(v) => update("hero_subtitle", v)}
      />
      <Field
        label="Background URL (image or video, optional)"
        value={values.background_url}
        onChange={(v) => update("background_url", v)}
      />

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ghat-900 hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save settings"}
      </button>
      {status === "saved" && <p className="text-sm text-green-400">Saved.</p>}
      {status === "error" && <p className="text-sm text-red-400">Could not save settings.</p>}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-cream/60">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gold-500/20 bg-ghat-800/60 px-4 py-2.5 text-sm text-cream focus:border-gold-500/60 focus:outline-none"
      />
    </div>
  );
}
