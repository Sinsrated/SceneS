"use client";
import { useState } from "react";

interface DescriptionProps {
  text: string;
  limit?: number;
}

export default function Description({ text, limit = 150 }: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = expanded || !isLong ? text : text.slice(0, limit) + "...";

  return (
    <div className="text-gray-300 mb-4">
      <p>{displayText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-400 hover:underline mt-1 text-sm"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}
