'use client';

export function LoginButton({ label }: { label: string }) {
  return <button className={buttonVariants({ variant: 'default' })}>{label}</button>;
}
