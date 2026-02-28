'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Simulation {
  id: string;
  name: string;
  date: string;
  type: string;
  clickRate: number;
  completionRate: number;
  participants: number;
}

interface TrainingCompletion {
  module: string;
  completionRate: number;
  avgScore: number;
}

export default function TrainingPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [training, setTraining] = useState<TrainingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulations' | 'training'>(
    'simulations'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [simsRes, trainRes] = await Promise.all([
          apiClient.getSimulations(),
          apiClient.getTrainingCompletion(),
        ]);
        setSimulations(simsRes.data || []);
        setTraining(trainRes.data || []);
      } catch (error) {
        console.error('Failed to fetch training data:', error);
        toast.error('Failed to load training data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getClickRateColor = (rate: number) => {
    if (rate > 25) return 'text-red-600 dark:text-red-400';
    if (rate > 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Security Training
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Phishing simulations and employee training programs
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'simulations'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          Phishing Simulations
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'training'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
          }`}
        >
          Training Modules
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading training data...</div>
        </div>
      ) : activeTab === 'simulations' ? (
        <div className="space-y-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Launch New Simulation
          </Button>
          {simulations.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No simulations run yet
              </p>
            </Card>
          ) : (
            simulations.map((sim) => (
              <Card
                key={sim.id}
                className="p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {sim.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {sim.type} • {sim.participants} participants
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(sim.date).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Click Rate
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${getClickRateColor(sim.clickRate)}`}>
                      {sim.clickRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Completion
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                      {sim.completionRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      View Results
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {training.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No training modules assigned
              </p>
            </Card>
          ) : (
            training.map((mod, idx) => (
              <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {mod.module}
                    </h3>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Completion Rate
                    </p>
                    <div className="mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-full transition-all"
                        style={{
                          width: `${mod.completionRate}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold mt-2">
                      {mod.completionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Avg Score
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                      {mod.avgScore}%
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
