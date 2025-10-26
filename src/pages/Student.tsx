import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  "Mathematics", "Mathematical Literacy", "English Home Language", "Afrikaans",
  "Physical Sciences", "Life Sciences", "Geography", "History", 
  "Accounting", "Business Studies", "Economics", "Life Orientation",
  "Information Technology", "Agricultural Sciences", "Engineering Graphics"
];

const Student = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [grade, setGrade] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const limits = grade && (grade === "11" || grade === "12") ? { min: 7, max: 8 } : { min: 7, max: 8 };
  const filledCount = Object.values(marks).filter(m => m !== "").length;
  
  const handleMarkChange = (subject: string, value: string) => {
    const isAddingValue = (marks[subject] ?? "") === "" && value !== "";
    if (isAddingValue && filledCount >= limits.max) {
      toast({
        title: "Subject limit reached",
        description: "Grades 11–12 allow 7 or 8 subjects",
        variant: "destructive"
      });
      return;
    }
    setMarks(prev => ({ ...prev, [subject]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grade) {
      toast({
        title: "Grade Required",
        description: "Please select your grade",
        variant: "destructive"
      });
      return;
    }

    const filledMarks = Object.keys(marks).filter(subject => marks[subject] !== "");
    if (filledMarks.length < limits.min || filledMarks.length > limits.max) {
      toast({
        title: "Invalid number of subjects",
        description: "Enter marks for exactly 7 or 8 subjects",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      navigate("/student-results", { 
        state: { grade, marks }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Student Guidance</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Discover Your <span className="bg-gradient-hero bg-clip-text text-transparent">Career Path</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your Grade 11 or 12 marks and get personalized recommendations for universities, TVET colleges, and career opportunities in Mpumalanga.
            </p>
          </div>

          <Card className="p-8 shadow-card border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grade Selection */}
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-base font-semibold">Current Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12 / Matric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Marks */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Subject Marks (%)</Label>
                <p className="text-sm text-muted-foreground">Enter your most recent marks (exactly 7 or 8 subjects)</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {subjects.map(subject => (
                    <div key={subject} className="space-y-2">
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                      <Input
                        id={subject}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={marks[subject] || ""}
                        onChange={(e) => handleMarkChange(subject, e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                        disabled={isLoading || (filledCount >= limits.max && !marks[subject])}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full gap-2 shadow-button"
                disabled={isLoading}
              >
                <Sparkles className="h-5 w-5" />
                {isLoading ? "Analyzing Your Options..." : "Get Course & Career Recommendations"}
              </Button>
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Universities</h3>
              <p className="text-sm text-muted-foreground">
                Degree programs at nearby institutions
              </p>
            </Card>
            <Card className="p-6 bg-secondary/5 border-secondary/20">
              <h3 className="font-semibold mb-2 text-secondary">TVET Colleges</h3>
              <p className="text-sm text-muted-foreground">
                Practical vocational training programs
              </p>
            </Card>
            <Card className="p-6 bg-accent/5 border-accent/20">
              <h3 className="font-semibold mb-2 text-accent">Scarce Skills</h3>
              <p className="text-sm text-muted-foreground">
                High-demand career fields in Mpumalanga
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;
