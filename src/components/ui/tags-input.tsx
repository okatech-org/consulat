import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

type TagsInputProps = {
  value: string[];
  onChange: (values: string[]) => void;
  onTagAdded?: (tag: string) => void;
  onTagDeleted?: (tag: string) => void;
};

export default function TagsInput({
  value,
  onChange,
  onTagAdded,
  onTagDeleted,
}: Readonly<TagsInputProps>) {
  const t = useTranslations('common');
  const [tags, setTags] = React.useState<string[]>(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setTags(value);
  }, [value]);

  function addTag() {
    const newTag = inputRef.current?.value;

    if (!newTag) {
      inputRef.current?.focus();
      return;
    }
    if (tags.includes(newTag)) {
      inputRef.current.value = '';
      inputRef.current?.focus();
      return;
    }

    const newTags = [...tags, newTag];
    setTags(newTags);
    onChange(newTags);
    inputRef.current.value = '';
    inputRef.current?.focus();
    onTagAdded?.(newTag);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  }

  function deleteTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    onChange(newTags);
    onTagDeleted?.(tag);
  }

  return (
    <div className={'flex flex-col space-y-2'}>
      <Label className={'flex gap-x-2'}>
        <Input name={'tags'} onKeyDown={onInputKeyDown} ref={inputRef} type={'text'} />
        <Button onClick={addTag} type={'button'}>
          {t('actions.add')}
        </Button>
      </Label>
      <div className="tags flex gap-2">
        {tags.map((tag) => (
          <Badge variant={'info'} key={tag.toLowerCase()} onClick={() => deleteTag(tag)}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
