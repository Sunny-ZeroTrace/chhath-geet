"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

// Some browsers (Chromium-based) support selecting an entire folder via a
// non-standard input attribute. We feature-detect and fall back gracefully
// to normal multi-file selection everywhere else.
export default function UploadDropzone({ onFilesSelected }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onFilesSelected(files);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onFilesSelected(files);
    event.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition " +
        (isDragging
          ? "border-gold-400 bg-gold-500/10"
          : "border-gold-500/20 bg-ghat-800/40")
      }
    >
      <UploadCloud className="h-10 w-10 text-gold-400" />
      <div>
        <p className="text-cream">Drag and drop your music library here</p>
        <p className="mt-1 text-sm text-cream/50">
          MP3, M4A, WAV, OGG, or WEBM audio, plus matching .info.json and cover images
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-ghat-900 hover:bg-gold-400"
        >
          Select Files
        </button>
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="rounded-full border border-gold-500/30 px-5 py-2 text-sm text-cream/80 hover:bg-ghat-700"
        >
          Select Folder
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.m4a,.wav,.ogg,.webm,.jpg,.jpeg,.png,.json"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error non-standard attributes, Chromium/WebKit only
        webkitdirectory="true"
        directory=""
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
