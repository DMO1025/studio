'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CalendarPage() {
  const { projects } = useProjects();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const projectDates = React.useMemo(() => {
    return projects.map((project: Project) => parseISO(project.date));
  }, [projects]);

  const selectedProjects = React.useMemo(() => {
    if (!selectedDate) return [];
    return projects.filter((project: Project) =>
      isSameDay(parseISO(project.date), selectedDate)
    );
  }, [projects, selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{
                project: projectDates,
              }}
              modifiersStyles={{
                project: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 pr-4">
                {selectedProjects.length > 0 ? (
                  selectedProjects.map((project: Project) => (
                    <div key={project.id} className="p-3 rounded-lg border">
                      <h4 className="font-semibold">{project.clientName}</h4>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                      <div className="mt-2">
                        <Badge>{project.stage}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center pt-8">No projects scheduled for this day.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
