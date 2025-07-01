'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';
import type { Project } from '@/types';

export default function AdminPage() {
  const { projects, importProjects } = useProjects();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonString = JSON.stringify(projects, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'photoflow_projects_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Exportação Concluída',
        description: 'Seu backup de projetos foi baixado.',
      });
    } catch (error) {
      console.error('Failed to export projects:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Exportação',
        description: 'Não foi possível gerar o arquivo de backup.',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not a string.');
        }
        const importedData: Project[] = JSON.parse(text);
        
        // Basic validation
        if (Array.isArray(importedData) && importedData.every(p => p.id && p.clientName)) {
           importProjects(importedData);
            toast({
              title: 'Importação Concluída',
              description: `${importedData.length} projetos foram importados com sucesso.`,
            });
        } else {
            throw new Error('Invalid project data format.');
        }

      } catch (error) {
        console.error('Failed to import projects:', error);
        toast({
          variant: 'destructive',
          title: 'Erro na Importação',
          description: 'O arquivo selecionado é inválido ou está corrompido.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administração</CardTitle>
          <CardDescription>Gerencie os dados da sua aplicação.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>
            Faça backup (exportar) ou restaure (importar) os dados de projetos do usuário atual.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExport} disabled={projects.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar para JSON
          </Button>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar de JSON
          </Button>
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
  );
}
