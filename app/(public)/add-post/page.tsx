"use client";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import Button from "@/components/Button";

export default function AddPost() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
    },
  });

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  return <form>
    <div className="p-4">
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
            onClick={removeImage}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove
          </button>
        </div>
      )}
    </div>
    <textarea rows={12} className="w-full" placeholder="Add text or tag"></textarea>
    <div className="flex">
      <Button type="button">Cancel</Button>
      <Button type="button">Publish</Button>
    </div>
  </form>;
}
