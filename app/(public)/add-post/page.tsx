"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/Button";
import clsx from "clsx";
import UploadCloud from "@/icons/UploadCloud";
import Close from "@/icons/Close";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { handleError } from "@/utils/errors";
import { useSafeSession } from "@/hooks/useSafeSession";
import { showToast } from "@/utils/toastify";
import { canCreatePosts } from "@/lib/permissions";
import Post from "@/app/(public)/components/Post";
import type { PostWithUser } from "@/types/postWithUser";

export default function AddPost() {
  const router = useRouter();
  const { session } = useSafeSession();
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [step, setStep] = useState<"compose" | "preview">("compose");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftPost, setDraftPost] = useState<PostWithUser | null>(null);
  const [draftPostId, setDraftPostId] = useState<number | null>(null);

  useEffect(() => {
    if (session && !canCreatePosts(session.user.role)) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (images.length === 0 && step === "preview") {
      setStep("compose");
    }
  }, [images.length, step]);

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

  const deleteDraftOnServer = useCallback(async () => {
    if (!draftPostId) {
      setDraftPost(null);
      setDraftPostId(null);
      return;
    }

    try {
      await axios.post("/api/posts/delete", { postId: draftPostId });
    } catch (error) {
      handleError(error);
    } finally {
      setDraftPost(null);
      setDraftPostId(null);
    }
  }, [draftPostId]);

  const handleGeneratePreview = async () => {
    if (images.length === 0) {
      showToast("error", "Please add at least one image.");
      return;
    }

    setIsPreviewLoading(true);
    try {
      if (draftPostId) {
        await deleteDraftOnServer();
      }

      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });
      formData.append("text", text);

      const response = await axios.post("/api/posts/create", formData);
      const createdPost: PostWithUser | undefined = response.data?.post;
      const previewSupported =
        response.data?.previewSupported === undefined
          ? true
          : Boolean(response.data.previewSupported);

      if (!createdPost) {
        showToast("error", "Failed to generate preview. Please try again.");
        return;
      }

      if (!previewSupported || createdPost.published) {
        showToast("info", "Preview not available. Your post has been published.");
        router.push("/");
        return;
      }

      setDraftPost(createdPost);
      setDraftPostId(createdPost.id);
      setStep("preview");
    } catch (error) {
      handleError(error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!draftPostId) {
      showToast("error", "Preview is missing. Please try again.");
      return;
    }

    setIsPublishing(true);
    try {
      await axios.post("/api/posts/publish", { postId: draftPostId });
      setDraftPost(null);
      setDraftPostId(null);
      router.push("/");
    } catch (error) {
      handleError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBackFromPreview = async () => {
    await deleteDraftOnServer();
    setStep("compose");
  };

  useEffect(() => {
    return () => {
      if (draftPostId) {
        deleteDraftOnServer().catch(() => undefined);
      }
    };
  }, [draftPostId, deleteDraftOnServer]);

  const backDisabled = isPublishing || isPreviewLoading;
  const publishDisabled = isPublishing;

  if (!session || !canCreatePosts(session.user.role)) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-center bg-(--fly-white) h-full pt-[24px] px-[24px] pb-[10px]">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-4 w-full max-w-[630px]"
        >
          {step === "compose" ? (
            <>
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
                  <p className="text-xs">
                    Supported: JPEG, PNG, GIF, WebP (max 10 images)
                  </p>
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
                placeholder="Add text or tag (optional)"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  className="px-[16px] py-[6px] bg-(--fly-primary) text-(--fly-white)"
                  disabled={images.length === 0 || isPreviewLoading}
                  isProcessing={isPreviewLoading}
                  onClick={handleGeneratePreview}
                >
                  Preview
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-white shadow-sm border border-(--fly-border-color) p-4">
                {draftPost ? (
                  <Post post={draftPost} previewMode />
                ) : (
                  <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-100 text-[#A0A0A0]">
                    Preview unavailable
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-[12px]">
                <Button
                  type="button"
                  className={clsx(
                    "px-[16px] py-[6px]",
                    backDisabled
                      ? "bg-(--fly-primary) text-(--fly-white) opacity-60 border border-(--fly-primary)"
                      : "bg-white text-(--fly-text-primary) border border-(--fly-border-color)"
                  )}
                  onClick={handleBackFromPreview}
                  disabled={backDisabled}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  isProcessing={isPublishing}
                  disabled={publishDisabled}
                  className="px-[16px] py-[6px] bg-(--fly-primary) text-(--fly-white)"
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
