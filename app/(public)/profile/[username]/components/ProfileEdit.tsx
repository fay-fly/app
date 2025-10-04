"use client";
import { useState } from "react";
import Modal from "react-modal";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  pictureUrl?: string;
  bio?: string;
  onSave: (data: { username: string; pictureUrl?: string; bio?: string }) => void;
}

export default function ProfileEdit({
  isOpen,
  onClose,
  username: initialUsername,
  pictureUrl: initialPictureUrl,
  bio: initialBio,
  onSave,
}: ProfileEditProps) {
  const [username, setUsername] = useState(initialUsername);
  const [pictureUrl, setPictureUrl] = useState(initialPictureUrl || "");
  const [bio, setBio] = useState(initialBio || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      username,
      pictureUrl: pictureUrl || undefined,
      bio: bio || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#5B5B5B]">Edit Profile</h2>
        <button
          onClick={onClose}
          className="text-[#A0A0A0] hover:text-[#5B5B5B] text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[#5B5B5B] mb-1"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F458A3] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="pictureUrl"
            className="block text-sm font-medium text-[#5B5B5B] mb-1"
          >
            Profile Picture URL
          </label>
          <input
            id="pictureUrl"
            type="url"
            value={pictureUrl}
            onChange={(e) => setPictureUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F458A3] focus:border-transparent"
            placeholder="https://example.com/picture.jpg"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-[#5B5B5B] mb-1"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F458A3] focus:border-transparent resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#5B5B5B] hover:text-[#A0A0A0] font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#F458A3] text-white rounded-md hover:bg-[#F883B8] font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
