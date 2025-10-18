'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { ParentalRole } from '@/convex/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Plus, Trash2, Search, UserPlus } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { z } from 'zod';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const ParentSchema = z.object({
  userId: z.string().optional(),
  role: z.enum([ParentalRole.Father, ParentalRole.Mother, ParentalRole.LegalGuardian]),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
});

type ParentFormData = z.infer<typeof ParentSchema>;

type Parent = {
  userId?: Id<'users'>;
  role: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
};

type ParentsFormProps = {
  childProfileId: Id<'childProfiles'>;
  currentUser: {
    _id: Id<'users'>;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  initialParents?: Parent[];
  onSave: () => void;
  onPrevious: () => void;
};

export function ParentsForm({
  childProfileId,
  currentUser,
  initialParents = [],
  onSave,
  onPrevious,
}: Readonly<ParentsFormProps>) {
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const updateChildProfile = useMutation(api.functions.childProfile.updateChildProfile);

  const searchResults = useQuery(
    api.functions.user.searchUsersByEmailOrPhone,
    searchTerm.length >= 3 ? { searchTerm, limit: 5 } : 'skip'
  );

  const form = useForm<ParentFormData>({
    resolver: zodResolver(ParentSchema),
    defaultValues: {
      role: ParentalRole.Mother,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    },
  });

  // Add current user as first parent if no parents exist
  useEffect(() => {
    if (parents.length === 0 && currentUser.firstName && currentUser.lastName) {
      setParents([
        {
          userId: currentUser._id,
          role: ParentalRole.Father,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber,
        },
      ]);
    }
  }, [currentUser, parents.length]);

  const addManualParent = (data: ParentFormData) => {
    const newParent: Parent = {
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phoneNumber: data.phoneNumber || undefined,
    };

    setParents([...parents, newParent]);
    form.reset();
    toast({
      title: t('parents.add_success'),
      description: t('parents.add_success_description'),
    });
  };

  const addUserParent = (user: any, role: string) => {
    // Check if user is already added
    if (parents.some((p) => p.userId === user._id)) {
      toast({
        title: t('parents.already_added'),
        description: t('parents.already_added_description'),
        variant: 'destructive',
      });
      return;
    }

    const newParent: Parent = {
      userId: user._id,
      role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    setParents([...parents, newParent]);
    setSearchTerm('');
    setShowSearch(false);
    toast({
      title: t('parents.add_success'),
      description: `${user.firstName} ${user.lastName} ${t('parents.added_as_parent')}`,
    });
  };

  const removeParent = (index: number) => {
    setParents(parents.filter((_, i) => i !== index));
    toast({
      title: t('parents.remove_success'),
      description: t('parents.remove_success_description'),
    });
  };

  const updateParentRole = (index: number, newRole: string) => {
    const updatedParents = [...parents];
    updatedParents[index] = { ...updatedParents[index], role: newRole };
    setParents(updatedParents);
  };

  const handleSave = async () => {
    if (parents.length === 0) {
      toast({
        title: t('parents.error.no_parents'),
        description: t('parents.error.no_parents_description'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateChildProfile({
        childProfileId,
        parents,
      });

      toast({
        title: t_inputs('success.title'),
        description: t_inputs('success.description'),
      });

      onSave();
    } catch (error) {
      toast({
        title: t_inputs('error.title'),
        description: t_inputs('error.description'),
        variant: 'destructive',
      });
      console.error('Failed to update parents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case ParentalRole.Father:
        return t('parents.roles.father');
      case ParentalRole.Mother:
        return t('parents.roles.mother');
      case ParentalRole.LegalGuardian:
        return t('parents.roles.legal_guardian');
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Parents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('parents.current_parents')}</h3>
        {parents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                {t('parents.no_parents_added')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {parents.map((parent, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {parent.firstName} {parent.lastName}
                        {parent.userId === currentUser._id && (
                          <Badge variant="secondary">Vous</Badge>
                        )}
                      </CardTitle>
                      <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                        {parent.email && <span>{parent.email}</span>}
                        {parent.phoneNumber && <span>{parent.phoneNumber}</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParent(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{t('parents.role')}:</label>
                    <Select
                      value={parent.role}
                      onValueChange={(value) => updateParentRole(index, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ParentalRole.Father}>
                          {t('parents.roles.father')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.Mother}>
                          {t('parents.roles.mother')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.LegalGuardian}>
                          {t('parents.roles.legal_guardian')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Search User */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="size-4" />
            {t('parents.search_user')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormDescription>{t('parents.search_user_description')}</FormDescription>
          <Popover open={showSearch} onOpenChange={setShowSearch}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowSearch(true)}
              >
                <Search className="mr-2 size-4" />
                {t('parents.search_placeholder')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t('parents.search_placeholder')}
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  {searchTerm.length < 3 && (
                    <CommandEmpty>{t('parents.search_min_chars')}</CommandEmpty>
                  )}
                  {searchTerm.length >= 3 && searchResults?.length === 0 && (
                    <CommandEmpty>{t('parents.no_results')}</CommandEmpty>
                  )}
                  {searchResults && searchResults.length > 0 && (
                    <CommandGroup>
                      {searchResults.map((user) => (
                        <CommandItem key={user._id} className="flex flex-col items-start gap-1 p-3">
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email || user.phoneNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 w-full">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addUserParent(user, ParentalRole.Father)}
                              className="flex-1"
                            >
                              {t('parents.add_as_father')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addUserParent(user, ParentalRole.Mother)}
                              className="flex-1"
                            >
                              {t('parents.add_as_mother')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addUserParent(user, ParentalRole.LegalGuardian)}
                              className="flex-1"
                            >
                              {t('parents.add_as_guardian')}
                            </Button>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Manual Add Parent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="size-4" />
            {t('parents.add_manual')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addManualParent)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('parents.role')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ParentalRole.Father}>
                          {t('parents.roles.father')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.Mother}>
                          {t('parents.roles.mother')}
                        </SelectItem>
                        <SelectItem value={ParentalRole.LegalGuardian}>
                          {t('parents.roles.legal_guardian')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('firstName.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t_inputs('firstName.placeholder')} />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t_inputs('lastName.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t_inputs('lastName.placeholder')} />
                      </FormControl>
                      <TradFormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('email.label')} (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t_inputs('email.placeholder')}
                      />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t_inputs('phone.label')} (optionnel)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t_inputs('phone.placeholder')} />
                    </FormControl>
                    <TradFormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="outline" className="w-full">
                <Plus className="mr-2 size-4" />
                {t('parents.add_parent')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          leftIcon={<ArrowLeft className="size-icon" />}
          disabled={isLoading}
        >
          Précédent
        </Button>

        <Button
          onClick={handleSave}
          rightIcon={<ArrowRight className="size-icon" />}
          disabled={isLoading || parents.length === 0}
        >
          Enregistrer et continuer
        </Button>
      </div>
    </div>
  );
}
