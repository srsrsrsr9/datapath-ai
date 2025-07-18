import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Briefcase, 
  TrendingUp, 
  RefreshCw, 
  Laptop, 
  Heart,
  Sprout,
  BarChart3,
  Star,
  Code,
  Scale,
  Mouse
} from "lucide-react";

export default function Questionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<{
    primaryGoal?: string;
    experienceLevel?: string;
    codingPreference?: string;
  }>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitQuestionnaire = useMutation({
    mutationFn: async (data: typeof answers) => {
      await apiRequest("POST", "/api/questionnaire", data);
    },
    onSuccess: () => {
      toast({
        title: "Assessment Complete!",
        description: "Your personalized roadmap is being generated...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire"] });
      setLocation("/roadmap");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (questionKey: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
    
    if (currentQuestion < 3) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 500);
    } else {
      // Submit questionnaire
      const finalAnswers = { ...answers, [questionKey]: value };
      submitQuestionnaire.mutate(finalAnswers);
    }
  };

  const progressPercentage = (currentQuestion / 3) * 100;

  const questions = [
    {
      number: 1,
      title: "First, what is your primary goal?",
      key: "primaryGoal",
      options: [
        { value: "job", label: "Land my first Data Analyst job", icon: Briefcase },
        { value: "promotion", label: "Get a promotion in my current role", icon: TrendingUp },
        { value: "switch", label: "Switch careers into data", icon: RefreshCw },
        { value: "freelance", label: "Start freelancing as a Data Analyst", icon: Laptop },
        { value: "personal", label: "Just learning for personal interest", icon: Heart },
      ]
    },
    {
      number: 2,
      title: "What is your current experience level?",
      key: "experienceLevel",
      options: [
        { value: "beginner", label: "Complete Beginner", icon: Sprout },
        { value: "some", label: "Some Exposure (e.g., used Excel for data)", icon: BarChart3 },
        { value: "intermediate", label: "Intermediate / Advanced", icon: Star },
      ]
    },
    {
      number: 3,
      title: "How do you feel about coding?",
      key: "codingPreference",
      options: [
        { value: "love", label: "I love coding and want a code-heavy path.", icon: Code },
        { value: "neutral", label: "I'm neutral, show me a mix of both.", icon: Scale },
        { value: "avoid", label: "I prefer to avoid code (No-Code tools).", icon: Mouse },
      ]
    }
  ];

  const currentQ = questions[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to Your Personalized Learning Journey!
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Tell us a bit about yourself, and we'll create a custom roadmap to help you become a Data Analyst.
          </p>
        </div>

        {/* Question Card */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm mr-3">
                {currentQ.number}
              </span>
              {currentQ.title}
            </h2>
            
            <div className={`grid gap-4 ${currentQ.options.length === 5 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {currentQ.options.map((option) => {
                const Icon = option.icon;
                const isSelected = answers[currentQ.key as keyof typeof answers] === option.value;
                
                return (
                  <Button
                    key={option.value}
                    variant="outline"
                    className={`
                      text-left p-6 h-auto justify-start transition-all duration-200
                      ${isSelected 
                        ? 'border-primary bg-blue-50 text-primary' 
                        : 'border-slate-200 hover:border-primary hover:bg-blue-50'
                      }
                      ${currentQ.options.length === 5 && option.value === 'personal' ? 'md:col-span-2' : ''}
                    `}
                    onClick={() => handleAnswer(currentQ.key, option.value)}
                    disabled={submitQuestionnaire.isPending}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Progress</span>
              <span className="text-sm font-medium text-primary">
                {currentQuestion} of 3
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            {submitQuestionnaire.isPending && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center text-sm text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Generating your personalized roadmap...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
