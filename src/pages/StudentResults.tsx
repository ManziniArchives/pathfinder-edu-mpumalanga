import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, ArrowLeft, Building2, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  name: string;
  institution: string;
  type: "university" | "tvet";
  requirements: string;
  duration: string;
}

interface Career {
  title: string;
  description: string;
  salary_range: string;
  demand: "high" | "medium" | "scarce";
}

interface StudentData {
  courses: Course[];
  careers: Career[];
  scarce_skills: string[];
  overall_assessment: string;
}

const StudentResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<StudentData | null>(null);
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
        navigate("/student");
        return;
      }

      try {
        const { data: result, error } = await supabase.functions.invoke("get-student-recommendations", {
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
          <p className="text-lg text-muted-foreground">Finding the best options for you...</p>
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Your Career Options</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Assessment Summary */}
          <Card className="p-8 shadow-card-hover bg-gradient-subtle">
            <h2 className="text-2xl font-bold mb-4">Your Academic Profile</h2>
            <p className="text-lg leading-relaxed">{data.overall_assessment}</p>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="careers">Careers</TabsTrigger>
              <TabsTrigger value="scarce">Scarce Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {data.courses.map((course, index) => (
                  <Card key={index} className="p-6 shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        course.type === "university" ? "bg-primary/10" : "bg-secondary/10"
                      }`}>
                        <Building2 className={`h-6 w-6 ${
                          course.type === "university" ? "text-primary" : "text-secondary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{course.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{course.institution}</p>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-semibold">Requirements:</span> {course.requirements}</p>
                          <p><span className="font-semibold">Duration:</span> {course.duration}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="careers" className="space-y-4 mt-6">
              <div className="space-y-4">
                {data.careers.map((career, index) => (
                  <Card key={index} className="p-6 shadow-card hover:shadow-card-hover transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        career.demand === "scarce" ? "bg-accent/10" : "bg-primary/10"
                      }`}>
                        <Briefcase className={`h-6 w-6 ${
                          career.demand === "scarce" ? "text-accent" : "text-primary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{career.title}</h3>
                          {career.demand === "scarce" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold">
                              Scarce Skill
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{career.description}</p>
                        <p className="text-sm font-semibold text-primary">{career.salary_range}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scarce" className="mt-6">
              <Card className="p-8 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  <h3 className="text-xl font-bold">In-Demand Fields in Mpumalanga</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  These are high-priority skills where South Africa needs more qualified professionals:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.scarce_skills.map((skill, index) => (
                    <div key={index} className="flex gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-accent">{index + 1}</span>
                      </div>
                      <p className="font-medium">{skill}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/chat")} variant="outline" size="lg" className="gap-2">
              Chat with EduBot
            </Button>
            <Button onClick={() => navigate("/student")} size="lg" className="gap-2">
              Try Different Marks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
