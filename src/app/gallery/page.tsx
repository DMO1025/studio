'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

export default function GalleryPage() {
    const { projects } = useProjects();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Galeria de Projetos</CardTitle>
                    <CardDescription>Selecione um projeto para ver ou enviar fotos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {projects.map(project => (
                                <Link href={`/gallery/${project.id}`} key={project.id}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative h-40 w-full">
                                            <Image 
                                                src={project.imageUrl || 'https://placehold.co/400x400.png'}
                                                alt={`Imagem para ${project.clientName}`}
                                                layout="fill"
                                                objectFit="cover"
                                                data-ai-hint="people event"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold truncate">{project.clientName}</h3>
                                            <p className="text-sm text-muted-foreground">{project.location}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                       <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-medium mt-4">Nenhum projeto encontrado</h3>
                            <p className="text-muted-foreground mt-2">Crie um novo projeto para começar a adicionar fotos.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
