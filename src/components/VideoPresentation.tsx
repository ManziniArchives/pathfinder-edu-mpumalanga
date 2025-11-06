import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPresentationProps {
  title: string;
  summary: string;
  keyPoints: string[];
  difficulty: string;
  audioUrl: string;
}

export const VideoPresentation = ({
  title,
  summary,
  keyPoints,
  difficulty,
  audioUrl,
}: VideoPresentationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="overflow-hidden shadow-card">
      {/* Video Display Area */}
      <div className="relative bg-gradient-primary aspect-video flex items-center justify-center p-8">
        <div className="text-center space-y-4 animate-fade-in">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
            {difficulty}
          </span>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-white/90 leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="p-4 bg-background border-t border-border/50">
        <audio ref={audioRef} src={audioUrl} />
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1">
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-10 w-10"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="p-6 border-t border-border/50 bg-muted/30">
          <h3 className="font-semibold mb-3">Key Takeaways:</h3>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary font-bold">{index + 1}.</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
