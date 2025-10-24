import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, TrendingUp, BookOpen, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationData {
  pathway: "grade12" | "tvet";
  reasoning: string;
  recommendations: string[];
  next_steps: string[];
}

const LearnerResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { grade, marks } = location.state || {};
      
      if (!grade || !marks) {
        toast({
          title: "Missing Data",
          description: "Please fill in your marks first",
          variant: "destructive"
        });
        navigate("/learner");
        return;
      }

      try {
        const { data: result, error } = await supabase.functions.invoke("get-learner-recommendations", {
          body: { grade, marks }
        });

        if (error) throw error;
        setData(result);
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Error",
          description: "Failed to generate recommendations. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Analyzing your marks...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/learner")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Your Personalized Pathway</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Recommended Path */}
          <Card className={`p-8 shadow-card-hover border-2 ${
            data.pathway === "grade12" ? "border-primary/30 bg-primary/5" : "border-secondary/30 bg-secondary/5"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${
                data.pathway === "grade12" ? "bg-gradient-primary" : "bg-gradient-secondary"
              }`}>
                {data.pathway === "grade12" ? (
                  <BookOpen className="h-8 w-8 text-white" />
                ) : (
                  <Briefcase className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {data.pathway === "grade12" ? "Continue to Grade 12" : "Explore TVET Programs"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{data.reasoning}</p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Recommended Options</h3>
            </div>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-8 shadow-card bg-gradient-subtle">
            <h3 className="text-xl font-bold mb-6">Next Steps</h3>
            <div className="space-y-4">
              {data.next_steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>
                  <p className="flex-1 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/chat")} variant="outline" size="lg" className="gap-2">
              Chat with EduBot
            </Button>
            <Button onClick={() => navigate("/learner")} size="lg" className="gap-2">
              Try Different Marks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerResults;
