'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Gender, ParentalRole } from '@/convex/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Plus, Trash2, Search } from 'lucide-react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import type { CompleteChildProfile } from '@/convex/lib/types';
import type { Id } from '@/convex/_generated/dataModel';
import { AddressSchema } from '@/schemas/inputs';

const ParentSchema = z.object({
  parents: z
    .array(
      z.object({
        profileId: z.string().optional(),
        role: z.enum([
          ParentalRole.Father,
          ParentalRole.Mother,
          ParentalRole.LegalGuardian,
        ]),
        firstName: z.string().min(1, 'Prénom requis'),
        lastName: z.string().min(1, 'Nom requis'),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: AddressSchema.optional(),
      }),
    )
    .min(1, 'Au moins un parent est requis'),
});

type ParentFormData = z.infer<typeof ParentSchema>;

type ParentsFormProps = {
  childProfile: CompleteChildProfile;
  onSave: () => void;
  onPrevious: () => void;
};

export function ParentsForm({
  childProfile,
  onSave,
  onPrevious,
}: Readonly<ParentsFormProps>) {
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateChildProfile = useMutation(api.functions.childProfile.updateChildProfile);

  const searchResults = useQuery(
    api.functions.user.searchUsersByEmailOrPhone,
    searchTerm.length >= 3 ? { searchTerm, limit: 5 } : 'skip',
  );

  const form = useForm<ParentFormData>({
    resolver: zodResolver(ParentSchema),
    defaultValues: {
      parents:
        childProfile.parents && childProfile.parents.length > 0
          ? childProfile.parents.map((p) => ({
              profileId: p.profileId,
              role: p.role,
              firstName: p.firstName,
              lastName: p.lastName,
              email: p.email,
              phoneNumber: p.phoneNumber,
              address: p.address,
            }))
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parents',
  });

  const addManualParent = () => {
    append({
      profileId: undefined,
      role: ParentalRole.LegalGuardian,
      firstName: '',
      lastName: '',
      email: undefined,
      phoneNumber: undefined,
      address: undefined,
    });
  };

  const addUserParent = (user: NonNullable<typeof searchResults>[number]) => {
    if (!user.profile) {
      toast.error('Ce profil utilisateur est incomplet');
      return;
    }

    if (fields.some((p) => p.profileId === user.profile?._id)) {
      toast.error(t('parents.already_added'));
      return;
    }

    append({
      profileId: user.profile._id,
      role:
        user.profile.personal.gender === Gender.Male
          ? ParentalRole.Father
          : user.profile.personal.gender === Gender.Female
            ? ParentalRole.Mother
            : ParentalRole.LegalGuardian,
      firstName: user.profile.personal.firstName || '',
      lastName: user.profile.personal.lastName || '',
      email: user.profile.contacts.email,
      phoneNumber: user.profile.contacts.phone,
      address: user.profile.contacts.address
        ? {
            ...user.profile.contacts.address,
            postalCode: user.profile.contacts.address.postalCode || '',
          }
        : undefined,
    });
    setSearchTerm('');
    setShowSearch(false);
    toast.success(t('parents.add_success'));
  };

  const removeParent = (index: number) => {
    remove(index);
    toast.success(t('parents.remove_success'));
  };

  const onSubmit = async (data: ParentFormData) => {
    setIsLoading(true);
    try {
      await updateChildProfile({
        childProfileId: childProfile._id,
        parents: data.parents.map((parent) => ({
          profileId: parent.profileId as Id<'profiles'> | undefined,
          role: parent.role,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
          phoneNumber: parent.phoneNumber,
          address: parent.address
            ? {
                ...parent.address,
                postalCode: parent.address.postalCode || '',
              }
            : undefined,
        })),
      });

      toast.success(t_inputs('success.title'), {
        description: t_inputs('success.description'),
      });

      onSave();
    } catch (error) {
      console.error('Failed to update parents:', error);
      toast.error(t_inputs('error.title'), {
        description: t_inputs('error.description'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Parents List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('parents.current_parents')}</h3>
          {fields.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  {t('parents.no_parents_added')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {field.firstName} {field.lastName}
                            {field.profileId === childProfile.authorUserId && (
                              <Badge variant="secondary">Vous</Badge>
                            )}
                          </CardTitle>
                          <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                            {field.email && <span>{field.email}</span>}
                            {field.phoneNumber && <span>{field.phoneNumber}</span>}
                          </div>
                        </div>

                        {/* Form fields for each parent */}
                        <div className="grid grid-cols-2 gap-4">
                          <Controller
                            control={form.control}
                            name={`parents.${index}.firstName`}
                            render={({ field: controllerField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={`parent-${index}-firstName`}>
                                  {t_inputs('firstName.label')}
                                </FieldLabel>
                                <Input
                                  {...controllerField}
                                  id={`parent-${index}-firstName`}
                                  disabled={isLoading}
                                  aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            control={form.control}
                            name={`parents.${index}.lastName`}
                            render={({ field: controllerField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={`parent-${index}-lastName`}>
                                  {t_inputs('lastName.label')}
                                </FieldLabel>
                                <Input
                                  {...controllerField}
                                  id={`parent-${index}-lastName`}
                                  disabled={isLoading}
                                  aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            control={form.control}
                            name={`parents.${index}.email`}
                            render={({ field: controllerField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={`parent-${index}-email`}>
                                  {t_inputs('email.label')} (optionnel)
                                </FieldLabel>
                                <Input
                                  {...controllerField}
                                  id={`parent-${index}-email`}
                                  value={controllerField.value || ''}
                                  type="email"
                                  disabled={isLoading}
                                  aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            control={form.control}
                            name={`parents.${index}.phoneNumber`}
                            render={({ field: controllerField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={`parent-${index}-phone`}>
                                  {t_inputs('phone.label')} (optionnel)
                                </FieldLabel>
                                <Input
                                  {...controllerField}
                                  id={`parent-${index}-phone`}
                                  value={controllerField.value || ''}
                                  disabled={isLoading}
                                  aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParent(index)}
                        disabled={isLoading || fields.length === 1}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Controller
                      control={form.control}
                      name={`parents.${index}.role`}
                      render={({ field: controllerField, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`parent-${index}-role`}>
                            {t('parents.role')}
                          </FieldLabel>
                          <Select
                            onValueChange={controllerField.onChange}
                            value={controllerField.value}
                            disabled={isLoading}
                          >
                            <SelectTrigger id={`parent-${index}-role`} className="w-[200px]" aria-invalid={fieldState.invalid}>
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
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
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
            <FieldDescription>{t('parents.search_user_description')}</FieldDescription>
            <Popover open={showSearch} onOpenChange={setShowSearch}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
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
                          <CommandItem
                            key={user._id}
                            onSelect={() => addUserParent(user)}
                            className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                          >
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

        {/* Add Parent Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addManualParent}
            disabled={isLoading}
          >
            <Plus className="mr-2 size-4" />
            {t('parents.add_parent')}
          </Button>
        </div>

        {form.formState.errors.parents?.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.parents.root.message}
          </p>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            leftIcon={<ArrowLeft className="size-icon" />}
            disabled={isLoading}
          >
            Précédent
          </Button>

          <Button
            type="submit"
            rightIcon={<ArrowRight className="size-icon" />}
            disabled={isLoading || fields.length === 0}
            loading={isLoading}
          >
            Enregistrer et continuer
          </Button>
        </div>
      </form>
    </Form>
  );
}
