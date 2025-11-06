import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleDownload = async () => {
    if (!audioRef.current || !canvasRef.current || !videoContainerRef.current) return;

    setIsDownloading(true);
    toast({
      title: "Preparing download",
      description: "Creating your video file...",
    });

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size
      canvas.width = 1920;
      canvas.height = 1080;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, 150);

      // Draw difficulty badge
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(canvas.width / 2 - 150, 200, 300, 50);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(difficulty, canvas.width / 2, 235);

      // Draw summary
      ctx.font = '36px sans-serif';
      ctx.fillStyle = '#ffffff';
      const words = summary.split(' ');
      let line = '';
      let y = 350;
      const maxWidth = canvas.width - 200;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + ' ';
          y += 45;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Get canvas stream
      const stream = canvas.captureStream(30);
      
      // Get audio stream
      const audioContext = new AudioContext();
      const response = await fetch(audioUrl);
      const audioBuffer = await response.arrayBuffer();
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
      
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = decodedAudio;
      
      const destination = audioContext.createMediaStreamDestination();
      audioSource.connect(destination);
      
      // Combine video and audio streams
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = destination.stream.getAudioTracks()[0];
      const combinedStream = new MediaStream([videoTrack, audioTrack]);

      // Record the combined stream
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Download complete!",
          description: "Your study video has been saved.",
        });
        setIsDownloading(false);
      };

      mediaRecorder.start();
      audioSource.start(0);

      // Stop recording after audio duration
      setTimeout(() => {
        mediaRecorder.stop();
        audioSource.stop();
        audioContext.close();
      }, decodedAudio.duration * 1000);

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not create video file. Please try again.",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-card">
      {/* Hidden canvas for video generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Display Area */}
      <div ref={videoContainerRef} className="relative bg-gradient-primary aspect-video flex items-center justify-center p-8">
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
            disabled={isDownloading}
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
            disabled={isDownloading}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <div className="border-l border-border/50 h-8 mx-2" />

          <Button
            variant="default"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Video...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
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
