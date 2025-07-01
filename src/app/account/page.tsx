
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
  const { user, updateProfile, changePassword, isLoading: isAuthLoading, getUsers } = useAuth();
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
      });
    }
  }, [user, profileForm]);

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    if (data.portfolioSlug) {
        const allUsers = getUsers();
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
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...profileData } = data;
      updateProfile(profileData);
      toast({
        title: 'Perfil Atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      if (!user?.profileComplete) {
        router.push('/');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Atualizar',
        description: 'Não foi possível salvar suas informações. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu e-mail" {...field} readOnly disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="portfolioSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Portfólio Público</FormLabel>
                    <div className="flex items-center">
                      <span className="p-2 rounded-l-md bg-muted text-muted-foreground text-sm">/p/</span>
                      <FormControl>
                        <Input placeholder="seu-nome-unico" {...field} value={field.value || ''} className="rounded-l-none" />
                      </FormControl>
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
                )}
              />
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
