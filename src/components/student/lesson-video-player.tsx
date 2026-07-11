"use client";

import { useRef } from "react";
import { useLessonProgress } from "@/hooks/use-lesson-progress";

interface Props {
  src: string;
  poster?: string;
  courseId: string;
  lessonId: string;
}

export function LessonVideoPlayer({ src, poster, courseId, lessonId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { attachToVideo } = useLessonProgress({ courseId, lessonId });

  return (
    <video
      ref={(el) => {
        videoRef.current = el;
        attachToVideo(el);
      }}
      src={src}
      controls
      controlsList="nodownload"
      className="w-full h-full"
      poster={poster}
      preload="metadata"
      playsInline
    >
      <track kind="captions" />
      Your browser does not support the video tag.
    </video>
  );
}
