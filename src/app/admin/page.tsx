
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TestTube2, DatabaseZap, Loader2, Database, FileJson } from 'lucide-react';
import type { User, Project } from '@/types';
import { testDbConnection, importJsonToMysql, createDatabaseTables, exportAllDataAsJson } from './actions';

interface AdminUserSummary {
  email: string;
  projectCount: number;
}

export default function AdminPage() {
  const { getAllUsers } = useAuth();
  const { toast } = useToast();
  const [userSummaries, setUserSummaries] = React.useState<AdminUserSummary[]>([]);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isCreatingTables, setIsCreatingTables] = React.useState(false);
  const [jsonToImport, setJsonToImport] = React.useState('');

  const [dbConfig, setDbConfig] = React.useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'photoflow_db',
  });

  React.useEffect(() => {
    async function fetchUsers() {
        const allUsers = await getAllUsers();
        // This part is tricky as projects are now on the server.
        // We'll just display user and project count for now.
        // A more complex action would be needed to get revenue per user.
        const summaries = allUsers.map(user => ({
            email: user.email!,
            projectCount: 0, // In a real app, you'd fetch this.
        }));
        setUserSummaries(summaries);
    }
    fetchUsers();
  }, [getAllUsers]);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    const result = await testDbConnection({ ...dbConfig, port: Number(dbConfig.port) });
    if (result.success) {
      toast({ title: 'Conexão Bem-Sucedida!', description: 'A conexão com o MySQL foi estabelecida.' });
    } else {
      toast({ variant: 'destructive', title: 'Falha na Conexão', description: result.error });
    }
    setIsTesting(false);
  };
  
  const handleCreateTable = async () => {
    setIsCreatingTables(true);
    const result = await createDatabaseTables({ ...dbConfig, port: Number(dbConfig.port) });
     if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Erro ao Criar Tabelas', description: result.error });
    }
    setIsCreatingTables(false);
  };

  const handlePrepareJson = async () => {
    try {
        const jsonString = await exportAllDataAsJson();
        setJsonToImport(jsonString);
        toast({ title: 'Dados Preparados', description: 'Dados do servidor prontos para importação.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao Preparar Dados', description: 'Não foi possível ler os dados do servidor.' });
    }
  };

  const handleMysqlImport = async () => {
    if (!jsonToImport) {
        toast({ variant: 'destructive', title: 'JSON Vazio', description: 'Primeiro prepare os dados ou cole o JSON na área de texto.' });
        return;
    }
    setIsImporting(true);
    const result = await importJsonToMysql({ ...dbConfig, port: Number(dbConfig.port) }, jsonToImport);
    if (result.success) {
      toast({ title: 'Importação Concluída!', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Falha na Importação', description: result.error });
    }
    setIsImporting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Usuários</CardTitle>
          <CardDescription>Visualize todos os usuários cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email do Usuário</TableHead>
                <TableHead className="text-right">Projetos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSummaries.map(user => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-right">{user.projectCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Banco de Dados (MySQL)</CardTitle>
          <CardDescription>Insira os dados de conexão para o banco e crie a estrutura inicial.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestConnection} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Host</Label>
                <Input id="db-host" value={dbConfig.host} onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Porta</Label>
                <Input id="db-port" value={dbConfig.port} onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-user">Usuário</Label>
                <Input id="db-user" value={dbConfig.user} onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-password">Senha</Label>
                <Input id="db-password" type="password" value={dbConfig.password} onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-name">Banco de Dados</Label>
              <Input id="db-name" value={dbConfig.database} onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button type="submit" variant="outline" className="w-full" disabled={isTesting}>
                  {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                  Testar Conexão
                </Button>
                <Button type="button" onClick={handleCreateTable} className="w-full" disabled={isCreatingTables}>
                  {isCreatingTables ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  Criar Tabelas no Banco de Dados
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Migração de Dados</CardTitle>
          <CardDescription>Exporte os dados do sistema para JSON e importe para o banco de dados MySQL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="json-import-area">Dados JSON para Importar</Label>
                <Textarea 
                    id="json-import-area"
                    rows={10}
                    placeholder="Clique em 'Preparar Dados' ou cole seu JSON aqui..."
                    value={jsonToImport}
                    onChange={(e) => setJsonToImport(e.target.value)}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handlePrepareJson} variant="secondary" className="w-full">
                    <FileJson className="mr-2 h-4 w-4" />
                    Preparar Dados do Servidor
                </Button>
                <Button onClick={handleMysqlImport} disabled={isImporting} className="w-full">
                   {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
                   Importar JSON para MySQL
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
