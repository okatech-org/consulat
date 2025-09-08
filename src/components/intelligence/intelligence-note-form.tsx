'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/trpc/react';
import {
  type IntelligenceNote,
  IntelligenceNoteType,
  IntelligenceNotePriority,
} from '@prisma/client';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { X, Plus } from 'lucide-react';

interface IntelligenceNoteFormProps {
  profileId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: IntelligenceNote;
}

const typeOptions = [
  {
    value: IntelligenceNoteType.POLITICAL_OPINION,
    label: 'Opinion politique',
    icon: '🏛️',
  },
  { value: IntelligenceNoteType.ORIENTATION, label: 'Orientation', icon: '🧭' },
  { value: IntelligenceNoteType.ASSOCIATIONS, label: 'Associations', icon: '👥' },
  {
    value: IntelligenceNoteType.TRAVEL_PATTERNS,
    label: 'Habitudes de voyage',
    icon: '✈️',
  },
  { value: IntelligenceNoteType.CONTACTS, label: 'Contacts', icon: '📞' },
  { value: IntelligenceNoteType.ACTIVITIES, label: 'Activités', icon: '🎯' },
  { value: IntelligenceNoteType.OTHER, label: 'Autre', icon: '📝' },
];

const priorityOptions = [
  {
    value: IntelligenceNotePriority.LOW,
    label: 'Faible',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: IntelligenceNotePriority.MEDIUM,
    label: 'Moyenne',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: IntelligenceNotePriority.HIGH,
    label: 'Élevée',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: IntelligenceNotePriority.CRITICAL,
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
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    initialData?.expiresAt ? new Date(initialData.expiresAt) : undefined,
  );

  const isEditing = !!initialData;
  const schema = isEditing ? updateIntelligenceNoteSchema : createIntelligenceNoteSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      profileId,
      type: initialData?.type || IntelligenceNoteType.OTHER,
      priority: initialData?.priority || IntelligenceNotePriority.MEDIUM,
      title: initialData?.title || '',
      content: initialData?.content || '',
      ...(isEditing && { id: initialData.id }),
    },
  });

  const createNoteMutation = api.intelligence.createNote.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const updateNoteMutation = api.intelligence.updateNote.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const onSubmit = (data: {
    profileId: string;
    type: IntelligenceNoteType;
    priority: IntelligenceNotePriority;
    title: string;
    content: string;
    id?: string;
  }) => {
    if (isEditing) {
      const updateData = {
        id: data.id!,
        profileId: data.profileId,
        type: data.type,
        priority: data.priority,
        title: data.title,
        content: data.content,
        tags,
        expiresAt,
      };
      updateNoteMutation.mutate(updateData);
    } else {
      const createData = {
        profileId: data.profileId,
        type: data.type,
        priority: data.priority,
        title: data.title,
        content: data.content,
        tags,
        expiresAt,
      };
      createNoteMutation.mutate(createData);
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

  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{isEditing ? t('edit') : t('add')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de note</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Titre */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.noteTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la note" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contenu */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contenu de la note de renseignement..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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

            {/* Date d&apos;expiration */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Date d&apos;expiration (optionnelle)
              </label>
              <DatePicker
                date={expiresAt}
                onSelect={setExpiresAt}
                placeholder="Sélectionner une date"
                dateStr="dd MMMM yyyy"
              />
              {expiresAt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpiresAt(undefined)}
                  className="text-muted-foreground"
                >
                  Supprimer la date d&apos;expiration
                </Button>
              )}
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
