import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, ArrowLeft, Send, Bot, User, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VideoPresentation } from "@/components/VideoPresentation";

interface Message {
  role: "user" | "assistant";
  content: string;
  videoData?: {
    title: string;
    summary: string;
    keyPoints: string[];
    difficulty: string;
    audioUrl: string;
  };
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Sizwe The Bot, your educational guidance assistant. I can help you with questions about courses, careers, and educational pathways in South Africa. You can also upload your study documents and I'll create a summary video to help you understand the content better!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { 
          messages: [...messages, userMessage]
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingDocument(true);
    
    const userMessage: Message = { 
      role: "user", 
      content: `📄 Uploaded document: ${file.name}` 
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Step 1: Process document and get summary
      const formData = new FormData();
      formData.append('file', file);

      const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
        "process-document",
        {
          body: formData,
        }
      );

      if (summaryError) throw summaryError;

      // Parse JSON from markdown if needed
      let parsedData = summaryData;
      if (typeof summaryData.summary === 'string' && summaryData.summary.includes('```json')) {
        const jsonMatch = summaryData.summary.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        }
      }

      // Step 2: Generate narration audio
      const { data: audioData, error: audioError } = await supabase.functions.invoke(
        "generate-narration",
        {
          body: { text: parsedData.summary }
        }
      );

      if (audioError) throw audioError;

      // Step 3: Create video presentation message
      const audioUrl = `data:audio/mp3;base64,${audioData.audioContent}`;
      
      const videoMessage: Message = {
        role: "assistant",
        content: "I've created a summary video for your document. Press play to watch!",
        videoData: {
          title: parsedData.title,
          summary: parsedData.summary,
          keyPoints: parsedData.keyPoints || [],
          difficulty: parsedData.difficulty,
          audioUrl: audioUrl
        }
      };

      setMessages(prev => [...prev, videoMessage]);

      toast({
        title: "Success",
        description: "Your study video is ready!",
      });

    } catch (error: any) {
      console.error("Document processing error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDocument(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Sizwe Bot - The AI Assistant</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <Card className="flex-1 flex flex-col shadow-card border-border/50 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === "user" ? "" : "w-full"}`}>
                    {message.videoData ? (
                      <div className="space-y-3">
                        <div className="rounded-xl px-4 py-3 bg-muted">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <VideoPresentation {...message.videoData} />
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {(isLoading || isProcessingDocument) && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-muted">
                    {isProcessingDocument ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing document and generating video...</span>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-border/50 p-4 bg-background/50">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingDocument}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingDocument}
                title="Upload document for video summary"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about courses, careers, or education..."
                disabled={isLoading || isProcessingDocument}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || isProcessingDocument || !input.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick Questions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What can I study with my current marks?")}
            disabled={isLoading}
          >
            What can I study?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Tell me about TVET colleges in Mpumalanga")}
            disabled={isLoading}
          >
            TVET in Mpumalanga
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What are scarce skills in South Africa?")}
            disabled={isLoading}
          >
            Scarce Skills
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
