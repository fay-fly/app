import { useState } from "react";

const highlightHashtags = (text: string) => {
  const hashtagRegex = /(#\w+)/g;
  const parts = text.split(hashtagRegex);

  return parts.map((part, index) =>
    hashtagRegex.test(part) ? (
      <span key={index} className="text-[#19B4F6]">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function UserText({
  postText,
}: {
  postText: string;
}) {
  const [showFullText, setShowFullText] = useState(false);

  const isLongText = postText.length > 100;
  const displayedText = showFullText ? postText : postText.slice(0, 100).trim();

  return <>
    {highlightHashtags(displayedText)}
    {isLongText && !showFullText && "..."}{" "}
    {isLongText && (
      <span
        onClick={() => setShowFullText(!showFullText)}
        className="text-blue-500 hover:underline mt-2 cursor-pointer"
      >
          {!showFullText && "Show more"}
        </span>
    )}
  </>;
}
