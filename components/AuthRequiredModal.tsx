"use client";
import ReactModal from "react-modal";
import { useRouter } from "next/navigation";

type AuthRequiredModalProps = {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
};

export default function AuthRequiredModal({
  isOpen,
  onClose,
  action = "perform this action",
}: AuthRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="w-[90%] max-w-[400px] bg-white rounded-lg p-6 outline-none"
      style={{
        overlay: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        },
        content: {
          position: "relative",
          inset: "auto",
        },
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-[#323232]">Login Required</h2>
        <p className="text-center text-[#5B5B5B]">
          You need to be logged in to {action}.
        </p>
        <div className="flex gap-3 w-full mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-[#5B5B5B] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="flex-1 py-2 px-4 bg-[#7c89ff] text-white rounded-lg hover:bg-[#6b78e6] transition-colors font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </ReactModal>
  );
}