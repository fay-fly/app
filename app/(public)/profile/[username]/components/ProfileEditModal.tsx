"use client";
import {useRef, useState} from "react";
import Modal from "react-modal";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import Photo from "@/icons/Photo";
import Button from "@/components/Button";
import Close from "@/icons/Close";
import {EditProfilePayload} from "@/app/(public)/profile/[username]/components/ProfileContent";

type ProfileEditModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  fullName: string;
  username: string;
  pictureUrl?: string;
  profileBgUrl?: string
  bio?: string;
  onSaveAction: (data: EditProfilePayload) => void;
}

export default function ProfileEditModal({
  isOpen,
  onCloseAction,
  fullName: initialFullName,
  username: initialUsername,
  pictureUrl: initialPictureUrl,
  profileBgUrl: initialBackgroundUrl,
  bio: initialBio,
  onSaveAction,
}: ProfileEditModalProps) {
  const [profileEditPayload, setProfileEditPayload] = useState<EditProfilePayload>({
    fullName: initialFullName,
    username: initialUsername,
    gender: "male",
    bio: initialBio ?? "",
    pictureUrl: initialPictureUrl ?? "",
    profileBgUrl: initialBackgroundUrl ?? "",
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);


  const handleChange = <T extends keyof EditProfilePayload>(
    label: T,
    value: EditProfilePayload[T]
  ) => {
    setProfileEditPayload((prev) => {
      const update = { ...prev };
      update[label] = value;
      return update;
    });
  };

  const handleFileToDataUrl = (file: File, field: keyof EditProfilePayload) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfileEditPayload((prev) => ({
        ...prev,
        [field]: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const onAvatarSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileToDataUrl(file, "pictureUrl");
    }
  };

  const onBackgroundSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileToDataUrl(file, "profileBgUrl");
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAction(profileEditPayload);
    onCloseAction();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCloseAction}
      className="w-full max-w-[540px] mx-auto bg-white rounded-lg outline-none"
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mx-[16px] my-[8px]">
          <div className="flex">
          <button
            onClick={onCloseAction}
            className="text-[#A0A0A0] hover:text-[#5B5B5B] text-2xl leading-none p-[8px] cursor-pointer"
          >
            <Close />
          </button>
          <h2 className="text-xl font-bold text-[#343434] flex items-center">Edit Profile</h2></div>
          <div>
            <Button
              type="submit"
              isProcessing={false}
              className="px-[16px] py-[6px] bg-(--fly-primary) text-(--fly-white)"
            >
              Save
            </Button>
          </div>
        </div>
        <div
          className="h-[124px] relative"
          style={{
            background: profileEditPayload.profileBgUrl
              ? `url(${profileEditPayload.profileBgUrl}) center/cover`
              : "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)",
          }}
        >
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onBackgroundSelected}
          />
          <div className="absolute top-4 right-4 cursor-pointer" onClick={() => bgInputRef.current?.click()}>
            <Photo />
          </div>
          <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
            <div className="relative">
              {profileEditPayload.pictureUrl ? (
                <img
                  src={profileEditPayload.pictureUrl}
                  alt="profile picture"
                  className="ring-[1.5px] ring-white w-[80px] h-[80px] rounded-full"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[1.5px] ring-white">
                  {profileEditPayload.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Photo />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarSelected}
              />
            </div>
          </div>
        </div>
        <div className="mt-[72px] mx-[16px] flex flex-col gap-[16px] mb-[16px]">
          <FormInput label={"Full name"} value={profileEditPayload.fullName ?? ""} onChange={(e) => handleChange("fullName", e.target.value)} />
          <FormInput label={"Username"} value={profileEditPayload.username ?? ""} onChange={(e) => handleChange("username", e.target.value)} />
          <FormSelect
            label="Gender"
            value={profileEditPayload.gender}
            data={[
              { label: "", value: "" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            className="flex-1"
            onChange={(e) => handleChange("gender", e.target.value as "male" | "female")}
          />
          <label className="flex flex-col">
          <span className="font-semibold text-[14px] text-(--fly-text-primary)">
            Bio
          </span>
            <textarea
              className="bg-(--fly-white) placeholder-[--fly-input-placeholder-color] border-[1.5px] border-solid border-(--fly-border-color) px-[16px] rounded-[12px]"
              value={profileEditPayload.bio ?? ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={5}></textarea>
          </label>
        </div>
      </form>
    </Modal>
  );
}
