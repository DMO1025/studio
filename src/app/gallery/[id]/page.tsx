'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, UploadCloud, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProjectGalleryPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const { getProjectById, addGalleryImage } = useProjects();
    const { toast } = useToast();
    
    const [project, setProject] = React.useState(getProjectById(projectId));
    const [files, setFiles] = React.useState<any[]>([]);

    React.useEffect(() => {
        setProject(getProjectById(projectId));
    }, [getProjectById, projectId]);

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
                const dataUrl = reader.result as string;
                addGalleryImage(projectId, dataUrl);
                toast({ title: "Upload Concluído", description: `${file.name} foi adicionado à galeria.` });
            };
            reader.readAsDataURL(file);
        });
        setFiles([]);
    }, [addGalleryImage, projectId, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    });

    if (!project) {
        return (
            <div className="text-center py-10">
                <p>Projeto não encontrado.</p>
                <Button variant="link" asChild><Link href="/gallery">Voltar para a Galeria</Link></Button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Link href="/gallery" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Galeria
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Galeria de {project.clientName}</CardTitle>
                    <CardDescription>Faça upload e visualize as fotos para este projeto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4">
                            {isDragActive ? 'Solte os arquivos aqui ...' : 'Arraste e solte os arquivos aqui, ou clique para selecionar'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Imagens (JPEG, PNG, etc.)</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                    {project.galleryImages && project.galleryImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {project.galleryImages.map((image, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <Image 
                                        src={image} 
                                        alt={`Foto da galeria ${index + 1}`}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                        data-ai-hint="photo gallery"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Nenhuma foto na galeria ainda. Faça o upload acima para começar.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
