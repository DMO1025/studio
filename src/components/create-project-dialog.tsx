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
import { cn } from '@/lib/utils';
import type { PaymentStatus, ProjectStage, ProjectStatus } from '@/types';

const formSchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description.'),
  clientName: z.string().min(1, 'Client name is required.'),
  date: z.date({ required_error: 'A date is required.' }),
  location: z.string().min(1, 'Location is required.'),
  photographer: z.string().min(1, 'Photographer is required.'),
  income: z.coerce.number().min(0, 'Income must be a positive number.'),
  expenses: z.coerce.number().min(0, 'Expenses must be a positive number.'),
  status: z.enum(['Backlog', 'In Progress', 'Complete']),
  stage: z.enum(['Shooting', 'Editing', 'Delivery']),
  paymentStatus: z.enum(['Paid', 'Unpaid', 'Partially Paid']),
});

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { addProject } = useProjects();
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
      status: 'Backlog',
      stage: 'Shooting',
      paymentStatus: 'Unpaid',
    },
  });

  const handleExtract = async () => {
    const description = form.getValues('description');
    if (!description) {
      form.setError('description', { message: 'Please enter a description first.' });
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
      toast({ title: 'Details Extracted!', description: 'Project details have been populated from the description.' });
    } else {
      toast({ variant: 'destructive', title: 'Extraction Failed', description: result.error });
    }
    setIsExtracting(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addProject({ ...values, date: values.date.toISOString() });
    toast({ title: 'Project Created', description: `Project for ${values.clientName} has been added.` });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details below. Use the AI extractor for a quick start!</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2 space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Wedding photoshoot for The Smiths on October 26th at Central Park with Jane Doe..." {...field} />
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
                Extract Details with AI
              </Button>
            </div>
            
            <FormField control={form.control} name="clientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="photographer" render={({ field }) => (
              <FormItem>
                <FormLabel>Photographer</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date('1990-01-01')} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="income" render={({ field }) => (
                <FormItem>
                  <FormLabel>Income ($)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="expenses" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expenses ($)</FormLabel>
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
                      {(['Backlog', 'In Progress', 'Complete'] as ProjectStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(['Shooting', 'Editing', 'Delivery'] as ProjectStage[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )} />

            <div className="md:col-span-2">
                <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(['Unpaid', 'Partially Paid', 'Paid'] as PaymentStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>

            <DialogFooter className="md:col-span-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
