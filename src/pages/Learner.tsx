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
  "Mathematics", "English", "Afrikaans", "Physical Sciences", "Life Sciences", 
  "Geography", "History", "Accounting", "Business Studies", "Economics",
  "Life Orientation", "Technology", "Agricultural Sciences"
];

const Learner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [grade, setGrade] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkChange = (subject: string, value: string) => {
    setMarks(prev => ({ ...prev, [subject]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grade) {
      toast({
        title: "Grade Required",
        description: "Please select your current grade",
        variant: "destructive"
      });
      return;
    }

    const filledMarks = Object.keys(marks).filter(subject => marks[subject] !== "");
    if (filledMarks.length < 3) {
      toast({
        title: "More Marks Needed",
        description: "Please enter marks for at least 3 subjects",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Navigate to results page with data
      navigate("/learner-results", { 
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
              <span className="text-xl font-bold">Learner Pathway</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Let's Find Your <span className="bg-gradient-primary bg-clip-text text-transparent">Perfect Path</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your current grade and subject marks. Our AI will recommend whether to continue to Grade 12 or explore TVET options.
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
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Marks */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Subject Marks (%)</Label>
                <p className="text-sm text-muted-foreground">Enter marks for at least 3 subjects</p>
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
                {isLoading ? "Analyzing..." : "Get AI Recommendations"}
              </Button>
            </form>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Grade 12 Path</h3>
              <p className="text-sm text-muted-foreground">
                Continue to matric and qualify for university or college programs
              </p>
            </Card>
            <Card className="p-6 bg-secondary/5 border-secondary/20">
              <h3 className="font-semibold mb-2 text-secondary">TVET Path</h3>
              <p className="text-sm text-muted-foreground">
                Explore practical skills training at Mpumalanga TVET colleges
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learner;
