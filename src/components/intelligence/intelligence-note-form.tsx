'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import {
  createIntelligenceNoteSchema,
  updateIntelligenceNoteSchema,
} from '@/schemas/intelligence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Navigation,
  Users,
  Plane,
  Phone,
  Target,
  FileText,
} from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { X, Plus } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface IntelligenceNoteFormProps {
  profileId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Doc<'intelligenceNotes'>;
}

const typeOptions = [
  {
    value: IntelligenceNoteType.PoliticalOpinion,
    label: 'Opinion politique',
    icon: <Building className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.Orientation,
    label: 'Orientation',
    icon: <Navigation className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.Associations,
    label: 'Associations',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.TravelPatterns,
    label: 'Habitudes de voyage',
    icon: <Plane className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.Contacts,
    label: 'Contacts',
    icon: <Phone className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.Activities,
    label: 'Activités',
    icon: <Target className="h-4 w-4" />,
  },
  {
    value: IntelligenceNoteType.Other,
    label: 'Autre',
    icon: <FileText className="h-4 w-4" />,
  },
];

const priorityOptions = [
  {
    value: IntelligenceNotePriority.Low,
    label: 'Faible',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: IntelligenceNotePriority.Medium,
    label: 'Moyenne',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: IntelligenceNotePriority.High,
    label: 'Élevée',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: IntelligenceNotePriority.Critical,
    label: 'Critique',
    color: 'bg-red-100 text-red-800',
  },
];

export function IntelligenceNoteForm({
  profileId,
  onSuccess,
  onCancel,
  initialData,
}: IntelligenceNoteFormProps) {
  const t = useTranslations('intelligence.notes');
  const { user } = useCurrentUser();
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [expiresAt] = useState<Date | undefined>(
    initialData?.expiresAt ? new Date(initialData.expiresAt) : undefined,
  );

  const isEditing = !!initialData;
  const schema = isEditing ? updateIntelligenceNoteSchema : createIntelligenceNoteSchema;

  const form = useForm<{
    profileId: string;
    type: IntelligenceNoteType;
    priority: IntelligenceNotePriority;
    title: string;
    content: string;
    id?: string;
  }>({
    resolver: zodResolver(schema),
    defaultValues: {
      profileId,
      type: initialData?.type || IntelligenceNoteType.Other,
      priority: initialData?.priority || IntelligenceNotePriority.Medium,
      title: initialData?.title || '',
      content: initialData?.content || '',
      ...(isEditing && { id: initialData._id }),
    },
  });

  const createNoteMutation = useMutation(api.functions.intelligence.createNote);
  const updateNoteMutation = useMutation(api.functions.intelligence.updateNote);

  const onSubmit = async (data: {
    profileId: string;
    type: IntelligenceNoteType;
    priority: IntelligenceNotePriority;
    title: string;
    content: string;
    id?: string;
  }) => {
    setIsLoading(true);
    try {
      if (!user?._id) {
        throw new Error('User not authenticated');
      }
      if (isEditing && data.id) {
        await updateNoteMutation({
          noteId: data.id as Id<'intelligenceNotes'>,
          type: data.type,
          priority: data.priority,
          title: data.title,
          content: data.content,
          tags,
          expiresAt: expiresAt?.getTime(),
          changedById: user._id,
        });
      } else {
        await createNoteMutation({
          profileId: data.profileId as Id<'profiles'>,
          type: data.type,
          priority: data.priority,
          title: data.title,
          content: data.content,
          tags,
          expiresAt: expiresAt?.getTime(),
          authorId: user._id,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{isEditing ? t('edit') : t('add')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="intelligence-note-type">Type de note</FieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="intelligence-note-type" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="priority"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="intelligence-note-priority">Priorité</FieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="intelligence-note-priority" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intelligence-note-title">
                    {t('form.noteTitle')}
                  </FieldLabel>
                  <Input
                    id="intelligence-note-title"
                    placeholder="Titre de la note"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="intelligence-note-content">Contenu</FieldLabel>
                  <Textarea
                    id="intelligence-note-content"
                    placeholder="Contenu de la note de renseignement..."
                    className="min-h-[100px]"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span className="truncate max-w-[120px]">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Ajouter un tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  className="sm:w-auto w-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
