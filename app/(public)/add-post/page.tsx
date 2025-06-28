"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/Button";

export default function AddPost() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
  });

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!image || !text.trim()) {
      setErrorMsg("Image and text are required.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("text", text);
      formData.append("authorId", String(1));

      const res = await fetch("/api/posts/create-post", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Unknown error");
      }

      // success 🎉
      setStatus("success");
      setText("");
      removeImage();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message ?? "Upload failed");
    }
  }

  return (
    <form onSubmit={handlePublish} className="space-y-4">
      {/* drag-and-drop / preview */}
      {!image ? (
        <div
          {...getRootProps()}
          className={`border-dashed border-2 border-gray-400 rounded p-6 text-center cursor-pointer ${
            isDragActive ? "bg-gray-100" : ""
          }`}
        >
          <input {...getInputProps()} />
          <p>Drag & drop an image here, or click to select</p>
        </div>
      ) : (
        <div className="text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto mb-4 w-48 rounded"
            />
          )}
          <button
            type="button"
            onClick={removeImage}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove
          </button>
        </div>
      )}

      {/* post text */}
      <textarea
        rows={12}
        className="w-full border rounded p-2"
        placeholder="Add text or tag"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            setText("");
            removeImage();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Publishing…" : "Publish"}
        </Button>
      </div>

      {/* feedback */}
      {status === "success" && (
        <p className="text-green-600">Post uploaded successfully!</p>
      )}
      {status === "error" && <p className="text-red-600">Error: {errorMsg}</p>}
    </form>
  );
}
