"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/Button";
import UploadCloud from "@/icons/UploadCloud";
import Close from "@/icons/Close";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddPost() {
  const router = useRouter();
  const { data: session } = useSession();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("text", text);
      formData.append("authorId", String(session?.user.id));

      await axios.post("/api/posts/create-post", formData);
      router.push("/");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex justify-center bg-(--fly-white) h-full p-[24px]">
      <form onSubmit={handlePublish} className="space-y-4 w-full max-w-[630px]">
        {!image ? (
          <div
            {...getRootProps()}
            className={`flex justify-center text-[#A0A0A0] items-center border-dashed border-2 border-[#A0A0A0] rounded p-6 text-center cursor-pointer min-h-[450px] ${
              isDragActive ? "bg-gray-100" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col gap-[12px] items-center">
              <UploadCloud />
              <p>Take a photo or upload media</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={removeImage}
              className="absolute right-[-12] top-[-12] bg-(--fly-bg-primary) border-2 border-[#A0A0A0] rounded-full cursor-pointer"
            >
              <Close />
            </button>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto mb-4 w-full"
              />
            )}
          </div>
        )}
        <textarea
          rows={4}
          className="w-full rounded p-2"
          placeholder="Add text or tag"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end">
          <div className="flex gap-[24px] items-center">
            <Button
              type="submit"
              isProcessing={isProcessing}
              className="px-[16px] py-[6px] bg-(--fly-primary) text-(--fly-white)"
            >
              Publish
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
