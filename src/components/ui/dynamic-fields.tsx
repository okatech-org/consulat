import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { useEffect, useRef } from 'react';

type DynamicFieldsProps<T> = {
  fields: T[];
  append: () => void;
  render: (field: T, index: number) => React.ReactNode;
  label?: string;
  description?: string;
  addLabel?: string;
};

export default function DynamicFields<T>({
  fields,
  append,
  label,
  addLabel,
  description,
  render,
}: Readonly<DynamicFieldsProps<T>>) {
  const emailFieldRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (emailFieldRefs.current.length !== 0) {
      emailFieldRefs.current[emailFieldRefs.current.length - 1]?.focus();
    }
  }, [fields]);

  return (
    <div className="dynamic-fields flex flex-col gap-3">
      <div>
        {label && <FormLabel>{label}</FormLabel>}
        {description && <FormDescription>{description}</FormDescription>}
      </div>

      <div className="field-group flex flex-col space-y-2">
        {fields.map((field, index) => (
          <div key={index}>{render(field, index)}</div>
        ))}
      </div>

      {addLabel && (
        <Button
          type="button"
          size="sm"
          variant={'outline'}
          className="w-max border-dashed"
          leftIcon={<PlusCircle className={'size-5'} />}
          onClick={() => append()}
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
}
