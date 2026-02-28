'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { Users, Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  lastLogin: string;
  securityScore: number;
  status: 'active' | 'inactive' | 'pending';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getEmployees();
        setEmployees(res.data || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Employee Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage users and monitor individual security posture
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Card className="p-6 flex-1 mr-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Employees
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {employees.length}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Invite Employee
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Loading employees...</div>
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No employees added yet
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Role
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Security Score
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  MFA
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Last Login
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {emp.email}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {emp.role}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`text-xl font-bold ${getScoreColor(emp.securityScore)}`}>
                      {emp.securityScore}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {emp.mfaEnabled ? (
                      <Shield className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <div className="text-xs text-slate-500 text-center">
                        Disabled
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusBadgeColor(emp.status)}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(emp.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
