import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Users, Award, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg">
              <ChartLine className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-slate-900">DataPath.ai</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Personalized
            <span className="block text-primary">Data Analyst Journey</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get a custom roadmap tailored to your goals, experience level, and learning preferences. 
            Track your progress and master the skills needed to become a successful Data Analyst.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Journey
            </Button>
            <p className="text-sm text-slate-500">
              Free to get started • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose DataPath.ai?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform adapts to your unique learning style and career goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Personalized Learning</h3>
                <p className="text-slate-600">
                  Answer a few questions and get a roadmap tailored specifically to your goals, 
                  experience level, and coding preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChartLine className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
                <p className="text-slate-600">
                  Monitor your learning journey with detailed progress tracking, 
                  achievements, and personalized recommendations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Career Focused</h3>
                <p className="text-slate-600">
                  Learn the exact skills employers want. Our roadmaps are based on 
                  real job requirements and industry best practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,247</div>
              <div className="text-slate-600">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">89%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">25+</div>
              <div className="text-slate-600">Learning Modules</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8</div>
              <div className="text-slate-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Data Analyst Career?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of learners who are already on their path to success
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-4 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
