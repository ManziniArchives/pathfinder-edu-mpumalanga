import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, MessageCircle, TrendingUp, BookOpen, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mpumalanga AI Career Bridge
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/learner">
                <Button variant="ghost">For Learners</Button>
              </Link>
              <Link to="/student">
                <Button variant="ghost">For Students</Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Sizwe The AI Bot
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Your Journey to 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Educational Success</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered guidance for South African learners and students. 
            Discover the perfect courses, TVET programs, and career paths in Mpumalanga based on your academic performance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <Link to="/learner">
              <Button size="lg" className="gap-2 shadow-button hover:shadow-lg transition-all">
                <BookOpen className="h-5 w-5" />
                I'm a Learner (Grade 9/10)
              </Button>
            </Link>
            <Link to="/student">
              <Button size="lg" variant="secondary" className="gap-2 shadow-button hover:shadow-lg transition-all">
                <Award className="h-5 w-5" />
                I'm a Student (Grade 11-12)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all border border-border/50">
            <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-muted-foreground">
              AI analyzes your academic performance to suggest the best pathways - whether continuing to Grade 12 or exploring TVET programs.
            </p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all border border-border/50">
            <div className="h-12 w-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Sizwe Bot Support</h3>
            <p className="text-muted-foreground">
              Get instant answers to your education and career questions. Sizwe is trained on South African education data.
            </p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all border border-border/50">
            <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scarce Skills Focus</h3>
            <p className="text-muted-foreground">
              Discover in-demand career fields in Mpumalanga and courses that lead to high-employment opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-hero rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Map Your Future?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Mpumalanga youth making informed decisions about their educational and career paths.
          </p>
          <Link to="/chat">
            <Button size="lg" variant="secondary" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Start Chatting with Sizwe The AI BOT
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Mpumalanga AI Career Bridge. Empowering youth through education.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
