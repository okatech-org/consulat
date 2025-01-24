import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type DynamicTagsProps = {
  items: Tag[];
};

export type Tag = {
  value: string;
};
export function DynamicTags({ items }: Readonly<DynamicTagsProps>) {
  return (
    <div>
      <div className="w-full space-y-2">
        <label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="resumeFile"
        >
          Vos compétences clés
        </label>
        <p id=":r2l:-form-item-description" className="text-sm text-muted-foreground">
          Ajoutez vos compétences clés pour être plus facilement repéré par les
          recruteurs.
        </p>
      </div>

      <Input />
      {items.map((item, index) => (
        <Badge variant={'outline'} key={item.value + index}>
          {item.value}
        </Badge>
      ))}
    </div>
  );
}
