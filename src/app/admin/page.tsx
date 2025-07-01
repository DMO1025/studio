'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, TestTube2, DatabaseZap } from 'lucide-react';
import type { Project, User } from '@/types';

interface AdminUserSummary {
  email: string;
  projectCount: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const { getUsers } = useAuth();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userSummaries, setUserSummaries] = React.useState<AdminUserSummary[]>([]);

  // States for placeholder MySQL form
  const [dbConfig, setDbConfig] = React.useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'photoflow_db',
  });

  React.useEffect(() => {
    // This logic runs on the client-side, where localStorage is available.
    const allUsers = getUsers();
    const summaries = allUsers.map(user => {
      try {
        const storageKey = `photo-flow-projects-${user.email}`;
        const projectsJson = localStorage.getItem(storageKey);
        const projects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];
        
        const totalRevenue = projects.reduce((acc, project) => acc + project.income, 0);

        return {
          email: user.email,
          projectCount: projects.length,
          totalRevenue: totalRevenue,
        };
      } catch (e) {
        console.error(`Failed to process projects for user ${user.email}`, e);
        return {
          email: user.email,
          projectCount: 0,
          totalRevenue: 0,
        }
      }
    });
    setUserSummaries(summaries);
  }, [getUsers]);

  const handleExport = () => {
    toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'A exportação geral de dados estará disponível em breve.',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'A importação de dados estará disponível em breve.',
    });
    event.target.value = '';
  };
  
  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Teste de Conexão Simulado',
      description: 'Funcionalidade pronta para ser conectada ao backend do MySQL.',
    });
  };
  
  const handleMysqlImport = () => {
    toast({
      title: 'Importação para MySQL Simulada',
      description: 'Funcionalidade pronta para importar o JSON para o banco de dados.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Administração</CardTitle>
          <CardDescription>Gerencie usuários, dados e configurações do sistema.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize todos os usuários cadastrados e suas atividades.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email do Usuário</TableHead>
                <TableHead className="text-center">Projetos</TableHead>
                <TableHead className="text-right">Receita Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSummaries.map(user => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-center">{user.projectCount}</TableCell>
                  <TableCell className="text-right">R$ {user.totalRevenue.toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Banco de Dados (MySQL)</CardTitle>
            <CardDescription>
              Insira os dados de conexão para o banco de dados principal. Esta é uma configuração para o futuro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestConnection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Host</Label>
                <Input id="db-host" value={dbConfig.host} onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})} placeholder="localhost" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Porta</Label>
                <Input id="db-port" value={dbConfig.port} onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})} placeholder="3306" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="db-user">Usuário</Label>
                <Input id="db-user" value={dbConfig.user} onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})} placeholder="root" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="db-password">Senha</Label>
                <Input id="db-password" type="password" value={dbConfig.password} onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="db-name">Banco de Dados</Label>
                <Input id="db-name" value={dbConfig.database} onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})} placeholder="photoflow_db" />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                <TestTube2 className="mr-2 h-4 w-4" />
                Testar Conexão
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento e Migração de Dados</CardTitle>
            <CardDescription>
              Faça backup (exportar) ou restaure (importar) os dados do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Backup Local (Failover)</h4>
                <p className="text-sm text-muted-foreground">Exporte todos os dados dos usuários para um arquivo JSON como backup.</p>
                 <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Tudo para JSON
                </Button>
             </div>
             <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Migração para MySQL</h4>
                <p className="text-sm text-muted-foreground">Use um arquivo de backup JSON para popular o banco de dados MySQL configurado.</p>
                <Button onClick={handleMysqlImport} variant="secondary">
                  <DatabaseZap className="mr-2 h-4 w-4" />
                  Importar JSON para MySQL
                </Button>
             </div>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="application/json"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
