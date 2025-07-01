
'use client';

import * as React from 'react';
import { useProjects } from '@/contexts/project-context';
import { useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, UploadCloud, CheckCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function ProjectGalleryPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { getProjectById, addGalleryImage } = useProjects();
    const { toast } = useToast();
    
    const project = getProjectById(projectId);
    
    const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
    
    const processAndAddImage = React.useCallback(async (file: File, watermark: string) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = () => {
            console.error('File reading failed');
            toast({ variant: "destructive", title: "Erro de Upload", description: "Não foi possível ler o arquivo." });
        };
        reader.onload = () => {
            const img = document.createElement('img');
            img.src = reader.result as string;
            img.onerror = () => {
                 console.error('Image loading failed');
                 toast({ variant: "destructive", title: "Erro de Imagem", description: "Não foi possível carregar a imagem para processamento." });
            };
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                ctx.font = 'bold 24px Inter';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(watermark, canvas.width / 2, canvas.height / 2);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                addGalleryImage(projectId, dataUrl);
            };
        };
    }, [addGalleryImage, projectId, toast]);

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        if (!project) return;
        acceptedFiles.forEach(file => {
            processAndAddImage(file, project.photographer);
        });
        toast({ title: "Upload em Progresso", description: `Suas imagens estão sendo processadas e adicionadas.` });
    }, [processAndAddImage, project]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    });
    
    const handleSelectionChange = (image: string) => {
        setSelectedImages(prev => 
            prev.includes(image) 
                ? prev.filter(i => i !== image) 
                : [...prev, image]
        );
    };

    const handleSendWhatsApp = () => {
        if (!project || !project.galleryImages) return;
        const photoIndices = project.galleryImages
            .map((img, index) => selectedImages.includes(img) ? index + 1 : -1)
            .filter(index => index !== -1)
            .join(', ');

        const message = `Olá! Tenho interesse em um orçamento para as seguintes fotos do projeto "${project.clientName}":\n\nFotos: ${photoIndices}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

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
                    <CardDescription>Faça upload, selecione e envie as fotos para este projeto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4">
                            {isDragActive ? 'Solte os arquivos aqui ...' : 'Arraste e solte os arquivos aqui, ou clique para selecionar'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Imagens (JPEG, PNG, etc.). Elas serão redimensionadas e uma marca d'água será adicionada.</p>
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
                            {project.galleryImages.map((image, index) => {
                                const isSelected = selectedImages.includes(image);
                                return (
                                    <div key={index} className="relative aspect-square group" onClick={() => handleSelectionChange(image)}>
                                        <Image 
                                            src={image} 
                                            alt={`Foto da galeria ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover"
                                            className={cn("rounded-md transition-all cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-2")}
                                            data-ai-hint="photo gallery"
                                        />
                                        <div className="absolute top-2 right-2 z-10 bg-background/70 rounded-sm" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                id={`cb-${index}`}
                                                checked={isSelected}
                                                onCheckedChange={() => handleSelectionChange(image)}
                                                className="h-5 w-5"
                                                aria-label={`Selecionar foto ${index + 1}`}
                                            />
                                        </div>
                                         {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md pointer-events-none">
                                                <CheckCircle className="h-10 w-10 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Nenhuma foto na galeria ainda. Faça o upload acima para começar.</p>
                    )}
                </CardContent>
            </Card>

            {selectedImages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Enviar Seleção</CardTitle>
                        <CardDescription>
                            {selectedImages.length} foto{selectedImages.length > 1 ? 's' : ''} selecionada{selectedImages.length > 1 ? 's' : ''}. Envie a seleção para o fotógrafo para orçamento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleSendWhatsApp}>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar via WhatsApp
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
