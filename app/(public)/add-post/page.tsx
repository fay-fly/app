"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/Button";
import UploadCloud from "@/icons/UploadCloud";
import Close from "@/icons/Close";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { handleError } from "@/utils/errors";
import { useSafeSession } from "@/hooks/useSafeSession";
import {showToast} from "@/utils/toastify";

export default function AddPost() {
  const router = useRouter();
  const { session } = useSafeSession();
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages(prev => {
      const totalImages = prev.length + acceptedFiles.length;
      if (totalImages > 10) {
        showToast("error", `Maximum 10 images allowed. You can only add ${10 - prev.length} more image(s).`);
        return prev;
      }
      return [...prev, ...acceptedFiles];
    });
    setPreviewUrls(prev => {
      const totalImages = prev.length + acceptedFiles.length;
      if (totalImages > 10) {
        return prev;
      }
      const newPreviewUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      return [...prev, ...newPreviewUrls];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "image/avif": [".avif"]
    },
    maxSize: 30 * 1024 * 1024, // 30MB limit
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const errors = rejection.errors.map((e) => e.message).join(", ");
        showToast("error", `File "${rejection.file.name}" was rejected: ${errors}`);
      });
    },
  });

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0 || !text.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });
      formData.append("text", text);
      formData.append("authorId", String(session?.user.id));
      await axios.post("/api/posts/create", formData);
      router.push("/");
    } catch (error) {
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="pb-[48px] md:pb-0 ">
      <div className="flex justify-center bg-(--fly-white) h-full pt-[24px] px-[24px] pb-[10px]">
        <form
          onSubmit={handlePublish}
          className="space-y-4 w-full max-w-[630px]"
        >
          <div
            {...getRootProps()}
            className={`flex justify-center text-[#A0A0A0] items-center border-dashed border-2 border-[#A0A0A0] rounded p-6 text-center cursor-pointer min-h-[120px] ${
              isDragActive ? "bg-gray-100" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col gap-[12px] items-center">
              <UploadCloud />
              <p>Take a photo or upload media</p>
              <p className="text-xs">Supported: JPEG, PNG, GIF, WebP (max 10 images, 30MB each)</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-[-8px] top-[-8px] bg-(--fly-bg-primary) border-2 border-[#A0A0A0] rounded-full cursor-pointer z-10"
                  >
                    <Close />
                  </button>
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-[200px] object-cover rounded"
                    width={1}
                    height={1}
                    unoptimized
                  />
                </div>
              ))}
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
    </div>
  );
}
