import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Brain, 
  Settings, 
  TestTube, 
  Rocket,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { EnhancedWizardFlow } from './EnhancedWizardFlow';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ReactNode;
  isCompleted: boolean;
}

export const GenesisDigitalWorkerWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Define Intent & Purpose',
      description: 'Clarify what your digital worker should accomplish',
      icon: Brain,
      component: <div>Intent Step Component</div>,
      isCompleted: completedSteps.includes(1)
    },
    {
      id: 2,
      title: 'Generate Blueprint',
      description: 'AI creates a detailed plan for your worker',
      icon: Sparkles,
      component: <div>Blueprint Step Component</div>,
      isCompleted: completedSteps.includes(2)
    },
    {
      id: 3,
      title: 'Canvas Design',
      description: 'Visualize and customize the workflow',
      icon: Settings,
      component: <EnhancedWizardFlow />,
      isCompleted: completedSteps.includes(3)
    },
    {
      id: 4,
      title: 'Setup Credentials',
      description: 'Configure integrations and permissions',
      icon: Settings,
      component: <div>Credentials Step Component</div>,
      isCompleted: completedSteps.includes(4)
    },
    {
      id: 5,
      title: 'Test & Simulate',
      description: 'Run simulations to validate functionality',
      icon: TestTube,
      component: <div>Simulation Step Component</div>,
      isCompleted: completedSteps.includes(5)
    },
    {
      id: 6,
      title: 'Assign to Guild',
      description: 'Choose the business team for deployment',
      icon: Users,
      component: <div>Guild Assignment Step Component</div>,
      isCompleted: completedSteps.includes(6)
    },
    {
      id: 7,
      title: 'Performance Monitoring',
      description: 'Set up tracking and optimization',
      icon: BarChart3,
      component: <div>Monitoring Step Component</div>,
      isCompleted: completedSteps.includes(7)
    },
    {
      id: 8,
      title: 'Deploy & Launch',
      description: 'Activate your digital worker',
      icon: Rocket,
      component: <div>Deployment Step Component</div>,
      isCompleted: completedSteps.includes(8)
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Create Your Digital Worker
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Follow our 8-step process to build, test, and deploy an AI-powered digital worker 
            that will automate your business processes with unprecedented intelligence.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-sm">Step {currentStep} of {steps.length}</span>
            <span className="text-white/60 text-sm">
              {Math.round((completedSteps.length / steps.length) * 100)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`p-3 rounded-lg text-center transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white ring-2 ring-purple-500'
                      : isCompleted
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                    <span className="text-xs font-medium">{step.id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="backdrop-blur-sm bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {currentStepData && (
                <>
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <currentStepData.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
                    <p className="text-white/70">{currentStepData.description}</p>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[500px]">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData?.component}
            </motion.div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              Step {currentStep}: {currentStepData?.title}
            </p>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {currentStep === steps.length ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};