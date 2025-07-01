'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function RevenuePage() {
  const { projects } = useProjects();

  const financialSummary = React.useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.totalIncome += project.income;
        acc.totalExpenses += project.expenses;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [projects]);

  const totalProfit = financialSummary.totalIncome - financialSummary.totalExpenses;

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Partially Paid':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'Unpaid':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">from {projects.length} projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total income minus expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-center">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.clientName}</TableCell>
                  <TableCell className="text-right text-green-600">${project.income.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">${project.expenses.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">${(project.income - project.expenses).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getPaymentStatusBadge(project.paymentStatus)}>
                      {project.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
