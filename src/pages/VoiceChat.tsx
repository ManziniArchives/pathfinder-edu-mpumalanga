import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VoiceChat = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received event:', event);
    
    if (event.type === 'response.audio_transcript.delta') {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + event.delta }
          ];
        }
        return [...prev, { role: 'assistant', content: event.delta }];
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setMessages(prev => [...prev, { role: 'user', content: event.transcript }]);
    } else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    }
  };

  const startConversation = async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice tutor is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    toast({
      title: "Disconnected",
      description: "Voice session ended",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Voice AI Tutor</h1>
            <p className="text-muted-foreground">Have a conversation with Sizwe, your AI learning assistant</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-8 flex flex-col items-center justify-center gap-6 bg-card/50 backdrop-blur">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isSpeaking 
                ? 'bg-primary animate-pulse scale-110' 
                : isConnected 
                ? 'bg-primary/20' 
                : 'bg-muted'
            }`}>
              {isConnected ? (
                <Mic className={`w-16 h-16 ${isSpeaking ? 'text-primary-foreground' : 'text-primary'}`} />
              ) : (
                <MicOff className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {isConnected ? (isSpeaking ? 'Sizwe is speaking...' : 'Listening...') : 'Ready to start'}
              </h2>
              <p className="text-muted-foreground">
                {isConnected 
                  ? 'Speak naturally - the AI will respond to your questions' 
                  : 'Click the button below to begin your voice session'}
              </p>
            </div>

            {!isConnected ? (
              <Button 
                onClick={startConversation}
                size="lg"
                className="gap-2"
              >
                <Phone className="w-5 h-5" />
                Start Voice Session
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                End Session
              </Button>
            )}
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur">
            <h3 className="text-xl font-semibold mb-4">Conversation Transcript</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Conversation will appear here once you start talking
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : 'Sizwe'}
                    </p>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
