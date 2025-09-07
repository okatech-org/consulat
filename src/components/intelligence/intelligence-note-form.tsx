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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  const onSubmit = (data: any) => {
    const submitData = {
      ...data,
      tags,
      expiresAt,
    };

    if (isEditing) {
      updateNoteMutation.mutate(submitData);
    } else {
      createNoteMutation.mutate(submitData);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contenu de la note de renseignement..."
                      className="min-h-[120px]"
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
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date d'expiration (optionnelle)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expiresAt && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt
                      ? format(expiresAt, 'dd MMMM yyyy', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {expiresAt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpiresAt(undefined)}
                  className="text-muted-foreground"
                >
                  Supprimer la date d'expiration
                </Button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
