
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProjects } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { getProjectDetailsFromAI } from '@/app/actions';
import { Wand2, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { PaymentStatus, ProjectStage, ProjectStatus } from '@/types';
import { useAuth } from '@/contexts/auth-context';

const projectStatuses: ProjectStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];
const projectStages: ProjectStage[] = ['Sessão Fotográfica', 'Edição', 'Entrega'];
const paymentStatuses: PaymentStatus[] = ['Não Pago', 'Parcialmente Pago', 'Pago'];

const formSchema = z.object({
  description: z.string().min(10, 'Por favor, forneça uma descrição mais detalhada.'),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  location: z.string().min(1, 'O local é obrigatório.'),
  photographer: z.string().min(1, 'O fotógrafo é obrigatório.'),
  income: z.coerce.number().min(0, 'A receita deve ser um número positivo.'),
  expenses: z.coerce.number().min(0, 'As despesas devem ser um número positivo.'),
  status: z.enum(projectStatuses),
  stage: z.enum(projectStages),
  paymentStatus: z.enum(paymentStatuses),
});

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { addProject } = useProjects();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      clientName: '',
      location: '',
      photographer: '',
      income: 0,
      expenses: 0,
      status: 'Pendente',
      stage: 'Sessão Fotográfica',
      paymentStatus: 'Não Pago',
    },
  });

  React.useEffect(() => {
    if (user?.name) {
      form.setValue('photographer', user.name);
    }
  }, [user, form]);


  const handleExtract = async () => {
    const description = form.getValues('description');
    if (!description) {
      form.setError('description', { message: 'Por favor, insira uma descrição primeiro.' });
      return;
    }
    setIsExtracting(true);
    const result = await getProjectDetailsFromAI(description);
    if (result.success && result.data) {
      form.setValue('clientName', result.data.clientName);
      form.setValue('location', result.data.location);
      form.setValue('photographer', result.data.photographer);
      const parsedDate = new Date(result.data.date);
      if (!isNaN(parsedDate.getTime())) {
        form.setValue('date', parsedDate);
      }
      toast({ title: 'Detalhes Extraídos!', description: 'Os detalhes do projeto foram preenchidos a partir da descrição.' });
    } else {
      toast({ variant: 'destructive', title: 'Falha na Extração', description: result.error });
    }
    setIsExtracting(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addProject({ ...values, date: values.date.toISOString() });
    toast({ title: 'Projeto Criado', description: `O projeto para ${values.clientName} foi adicionado.` });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>Preencha os detalhes abaixo. Use o extrator de IA para um início rápido!</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2 space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Projeto</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Sessão de fotos de casamento para Os Smiths em 26 de outubro no Central Park com Jane Doe..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleExtract} disabled={isExtracting}>
                {isExtracting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Extrair Detalhes com IA
              </Button>
            </div>
            
            <FormField control={form.control} name="clientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="photographer" render={({ field }) => (
              <FormItem>
                <FormLabel>Fotógrafo(a)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} disabled={(date) => date < new Date('1990-01-01')} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="income" render={({ field }) => (
                <FormItem>
                  <FormLabel>Receita (R$)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="expenses" render={({ field }) => (
                <FormItem>
                  <FormLabel>Despesas (R$)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {projectStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fase</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {projectStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />

            <div className="md:col-span-2">
                <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

            <DialogFooter className="md:col-span-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar Projeto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
