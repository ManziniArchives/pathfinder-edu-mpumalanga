import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Learner from "./pages/Learner";
import Student from "./pages/Student";
import Chat from "./pages/Chat";
import LearnerResults from "./pages/LearnerResults";
import StudentResults from "./pages/StudentResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learner" element={<Learner />} />
          <Route path="/student" element={<Student />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/learner-results" element={<LearnerResults />} />
          <Route path="/student-results" element={<StudentResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
