import React from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const isYoutube = src.includes('youtube.com') || src.includes('youtu.be');

  if (isYoutube) {
    // Extract video ID safely
    let videoId = '';
    if (src.includes('youtube.com/watch?v=')) {
      videoId = src.split('v=')[1]?.split('&')[0] || '';
    } else if (src.includes('youtu.be/')) {
      videoId = src.split('youtu.be/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return (
        <div className="my-6 rounded-xl overflow-hidden shadow-2xl bg-black border border-zinc-800">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title || 'YouTube video player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      );
    }
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden shadow-2xl bg-black border border-zinc-800 group relative">
      <video controls className="w-full aspect-video" preload="metadata">
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity bg-black/20">
        <div className="bg-rust/80 p-3 rounded-full backdrop-blur-sm">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  );
}
