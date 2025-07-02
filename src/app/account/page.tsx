
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  portfolioSlug: z.string()
    .optional()
    .refine(
      (slug) => !slug || /^[a-z0-9-]+$/.test(slug), {
        message: 'Use apenas letras minúsculas, números e hífens.'
      }
    ),
  profilePictureUrl: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  bio: z.string().max(280, { message: "A biografia não pode ter mais de 280 caracteres." }).optional(),
  website: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal('')),
  instagram: z.string().url({ message: "Por favor, insira uma URL válida para o Instagram." }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Por favor, insira uma URL válida para o Twitter." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Por favor, insira sua senha atual.' }),
  newPassword: z.string().min(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function AccountPage() {
  const { user, updateProfile, changePassword, isLoading: isAuthLoading, getAllUsers } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = React.useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      portfolioSlug: '',
      profilePictureUrl: '',
      bio: '',
      website: '',
      instagram: '',
      twitter: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        company: user.company || '',
        phone: user.phone || '',
        email: user.email || '',
        portfolioSlug: user.portfolioSlug || '',
        profilePictureUrl: user.profilePictureUrl || '',
        bio: user.bio || '',
        website: user.website || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
      });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    if (data.portfolioSlug) {
        const allUsers = await getAllUsers();
        const otherUserHasSlug = allUsers.some(
            u => u.email !== user?.email && u.portfolioSlug === data.portfolioSlug
        );
        if (otherUserHasSlug) {
            profileForm.setError('portfolioSlug', {
                type: 'manual',
                message: 'Este link já está em uso. Por favor, escolha outro.',
            });
            setIsSubmitting(false);
            return;
        }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...profileData } = data;
    const result = await updateProfile(profileData);
    
    if (result.success) {
      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      if (!user?.profileComplete) {
        router.push('/');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: result.message || 'Não foi possível salvar suas informações. Tente novamente.',
      });
    }
    
    setIsSubmitting(false);
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordSubmitting(true);
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      toast({
        title: 'Senha Alterada!',
        description: result.message,
      });
      passwordForm.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao Alterar Senha',
        description: result.message,
      });
    }
    setIsPasswordSubmitting(false);
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Minha Conta</CardTitle>
          <CardDescription>
            {user?.profileComplete
              ? 'Atualize as informações do seu perfil aqui.'
              : 'Bem-vindo! Por favor, complete seu perfil para continuar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={profileForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={profileForm.control} name="company" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa (Opcional)</FormLabel>
                      <FormControl><Input placeholder="Nome da sua empresa" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <FormField control={profileForm.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (Opcional)</FormLabel>
                    <FormControl><Input placeholder="(XX) XXXXX-XXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="Seu e-mail" {...field} readOnly disabled /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Perfil Público</h3>
                <div className="space-y-6">
                   <FormField control={profileForm.control} name="portfolioSlug" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link do Portfólio Público</FormLabel>
                        <div className="flex items-center">
                          <span className="p-2 rounded-l-md bg-muted text-muted-foreground text-sm">/p/</span>
                          <FormControl><Input placeholder="seu-nome-unico" {...field} value={field.value || ''} className="rounded-l-none" /></FormControl>
                        </div>
                        <FormDescription>
                          Este será o link público para seu portfólio. Use apenas letras minúsculas, números e hífens.
                          {field.value && (
                            <span className="block mt-1">
                              Seu link:{" "}
                              <Link href={`/p/${field.value}`} target="_blank" className="underline font-medium text-primary">
                                /p/{field.value}
                              </Link>
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  <FormField control={profileForm.control} name="profilePictureUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto de Perfil</FormLabel>
                      <FormControl><Input placeholder="https://exemplo.com/sua-foto.jpg" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl><Textarea placeholder="Fale um pouco sobre você e seu trabalho..." {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={profileForm.control} name="website" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl><Input placeholder="https://seu-site.com" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                     <FormField control={profileForm.control} name="instagram" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl><Input placeholder="https://instagram.com/seu-usuario" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                     <FormField control={profileForm.control} name="twitter" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter / X</FormLabel>
                          <FormControl><Input placeholder="https://twitter.com/seu-usuario" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Para sua segurança, escolha uma senha forte.
          </CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha atual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Alterar Senha
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
