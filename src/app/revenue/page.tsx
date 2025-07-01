'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
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

  const getPaymentStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (status) {
      case 'Pago':
        return 'default';
      case 'Parcialmente Pago':
        return 'secondary';
      case 'Não Pago':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialSummary.totalIncome.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">de {projects.length} projetos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialSummary.totalExpenses.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">em todos os projetos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {totalProfit.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Receita total menos despesas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Financeira dos Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-center">Status Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.clientName}</TableCell>
                  <TableCell className="text-right text-green-600">R$ {project.income.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right text-red-600">R$ {project.expenses.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {(project.income - project.expenses).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getPaymentStatusVariant(project.paymentStatus)}>
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
