import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">FitFramework Pro</h1>
              <p className="text-xs text-muted-foreground">Scalable Transformation Engine</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Transform Your Fitness
            <span className="gradient-text block">With Enterprise Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Advanced BMR calculations, personalized workout planning, comprehensive nutrition analysis, 
            and extensible plugin architecture powered by enterprise-grade frameworks.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Start Your Transformation
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="neumorphic border-0 p-6 hover:scale-105 transition-all duration-300">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Advanced BMR Engine</h3>
              <p className="text-muted-foreground">
                Multiple calculation strategies including Mifflin-St Jeor, Harris-Benedict, 
                and AI-enhanced adaptive ensemble methods.
              </p>
            </CardContent>
          </Card>

          <Card className="neumorphic border-0 p-6 hover:scale-105 transition-all duration-300">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Smart Workout Planning</h3>
              <p className="text-muted-foreground">
                Personalized workout plans with exercise library, progress tracking, 
                and performance analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="neumorphic border-0 p-6 hover:scale-105 transition-all duration-300">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Nutrition Intelligence</h3>
              <p className="text-muted-foreground">
                Comprehensive macro/micronutrient tracking with AI-powered insights 
                and meal planning optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="neumorphic border-0 p-6 hover:scale-105 transition-all duration-300">
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise Analytics</h3>
              <p className="text-muted-foreground">
                Real-time monitoring, A/B testing framework, plugin architecture, 
                and advanced data visualization.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-foreground mb-8">Enterprise-Grade Technology</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-muted-foreground">
            <div className="p-4">
              <div className="text-2xl font-bold mb-2">🐍</div>
              <p className="font-semibold">Python Framework</p>
              <p className="text-sm">Scalable calculation engine</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold mb-2">⚛️</div>
              <p className="font-semibold">React + TypeScript</p>
              <p className="text-sm">Modern web interface</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold mb-2">🔌</div>
              <p className="font-semibold">Plugin Architecture</p>
              <p className="text-sm">Extensible functionality</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold mb-2">📊</div>
              <p className="font-semibold">Real-time Analytics</p>
              <p className="text-sm">Live monitoring & insights</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
