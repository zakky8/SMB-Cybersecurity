'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Users, Smartphone, BookOpen, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 1,
    title: 'Welcome',
    description: 'Let\'s set up your security dashboard',
    icon: Shield,
    content: 'Get started with ShieldDesk and protect your organization',
  },
  {
    id: 2,
    title: 'Organization Setup',
    description: 'Configure your organization settings',
    icon: Users,
    content: 'Set up your organization name and basic settings',
  },
  {
    id: 3,
    title: 'Invite Team',
    description: 'Add your team members',
    icon: Users,
    content: 'Invite employees to join your security program',
  },
  {
    id: 4,
    title: 'Device Enrollment',
    description: 'Enroll your devices',
    icon: Smartphone,
    content: 'Start monitoring your devices for security issues',
  },
  {
    id: 5,
    title: 'Training Program',
    description: 'Set up security training',
    icon: BookOpen,
    content: 'Launch phishing simulations and training modules',
  },
  {
    id: 6,
    title: 'Complete',
    description: 'You\'re all set!',
    icon: CheckCircle,
    content: 'Your security program is ready. Let\'s protect your organization!',
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const router = useRouter();
  const Step = steps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    toast.success('Onboarding completed!');
    router.push('/dashboard');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCompletedSteps(completedSteps.filter((s) => s !== currentStep - 1));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                    idx === currentStep
                      ? 'bg-blue-600 text-white'
                      : completedSteps.includes(idx)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                >
                  <div className="flex items-center gap-3">
                    {completedSteps.includes(idx) ? (
                      <CheckCircle className="h-6 w-6 flex-shrink-0" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Step className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      Welcome to ShieldDesk
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Protect your business with enterprise-grade cybersecurity solutions designed for SMBs.
                    </p>
                    <div className="space-y-3 mt-6">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Real-time threat detection and response
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Employee security training and simulations
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Comprehensive compliance reporting
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Company Name"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Industry
                    </label>
                    <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      <option>Select an industry</option>
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Retail</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Company Size
                    </label>
                    <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      <option>10-50 employees</option>
                      <option>50-100 employees</option>
                      <option>100-500 employees</option>
                      <option>500+ employees</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      Invite Your Team
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Add team members to your security program
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Email Addresses (one per line)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="user@company.com&#10;admin@company.com"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <input type="checkbox" defaultChecked />
                      Send invitation emails immediately
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      Enroll Your Devices
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Start monitoring your devices for security issues
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Download Device Agent
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      Devices enrolled: <strong>0</strong>
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      Security Training
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Launch phishing simulations and training modules
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Phishing Simulation
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Run monthly phishing tests
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Security Awareness
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Complete foundational training
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 text-center">
                  <CheckCircle className="h-24 w-24 text-green-600 mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                      Setup Complete!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Your organization is now protected with ShieldDesk. Let's start monitoring your security posture.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-between mt-8">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button variant="outline" onClick={handleSkip}>
                      Skip
                    </Button>
                  )}
                </div>
                {currentStep < steps.length - 1 ? (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleComplete}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
