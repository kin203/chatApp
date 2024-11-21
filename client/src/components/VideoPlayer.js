import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaExpand } from 'react-icons/fa';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleFullScreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e) => {
    const duration = videoRef.current.duration;
    const seekTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  return (
    <div
      className="relative group w-full h-auto max-w-sm rounded overflow-hidden bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto object-cover"
        onClick={togglePlayPause}
        onTimeUpdate={handleTimeUpdate}
      ></video>

      {/* Nút Play/Pause */}
      <button
        className={`absolute inset-0 flex items-center justify-center text-white text-4xl ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        } group-hover:opacity-100 transition-opacity`}
        onClick={togglePlayPause}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      {/* Controls */}
      <div
        className={`absolute bottom-2 bg-black bg-opacity-50 p-2 right-4 left-4 flex items-center justify-center transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Timeline */}
        <input
          type="range"
          className="flex-1 mx-2 h-1 appearance-none bg-gray-300 rounded cursor-pointer"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
        />

        {/* Volume */}
        <div className="flex items-center gap-2">
          <FaVolumeUp className="text-white" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 appearance-none bg-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Fullscreen */}
        <button onClick={handleFullScreen} className="text-white">
          <FaExpand />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
