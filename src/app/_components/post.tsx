"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  // Temporary component for T3 Stack demo - will be replaced with LogFile functionality
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      <p>SkyLensAI Foundation Setup Complete! 🚁</p>
      <p className="text-sm text-gray-400">Log file upload coming in Story 1.1</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Test message"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Testing..." : "Test API"}
        </button>
      </form>
    </div>
  );
}
