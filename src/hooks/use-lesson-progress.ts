"use client";

import { useEffect, useRef } from "react";

interface Props {
  courseId: string;
  lessonId: string;
  /** Called when progress is saved */
  onProgressSaved?: (progress: number) => void;
}

/**
 * Hook to track video watching + auto-update progress.
 * Place inside a lesson player component.
 *
 * - Calls PATCH /api/student/progress every 30 seconds while watching
 * - Marks lesson complete when video ends
 * - Updates enrollment progress automatically
 */
export function useLessonProgress({ courseId, lessonId, onProgressSaved }: Props) {
  const lastSavedRef = useRef<number>(0);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const saveProgress = async (completed: boolean) => {
    try {
      const res = await fetch("/api/student/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, completed }),
      });
      const data = await res.json();
      if (res.ok && data.ok && onProgressSaved) {
        onProgressSaved(data.progress);
      }
    } catch {
      // Silent fail — don't disrupt video playback
    }
  };

  // Auto-save every 30 seconds while playing
  useEffect(() => {
    const interval = setInterval(() => {
      const v = videoElRef.current;
      if (v && !v.paused && !v.ended) {
        saveProgress(false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [courseId, lessonId]);

  // Attach to video element
  const attachToVideo = (el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    if (el) {
      // On ended → mark complete
      el.addEventListener("ended", () => saveProgress(true));
      // On play → initial save
      el.addEventListener("play", () => {
        if (Date.now() - lastSavedRef.current > 10000) {
          lastSavedRef.current = Date.now();
          saveProgress(false);
        }
      });
    }
  };

  return { attachToVideo, saveProgress };
}
