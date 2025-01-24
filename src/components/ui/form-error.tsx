import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

type FormErrorProps = {
  message?: string | null;
  errors?: string[] | null;
};

export function FormError({ message, errors }: Readonly<FormErrorProps>) {
  return (
    <>
      {message && (
        <div className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <ExclamationTriangleIcon className={'size-4'} />
          <p>{message}</p>
        </div>
      )}
      {errors?.map((error, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
        >
          <ExclamationTriangleIcon className={'size-4'} />
          <p>{error}</p>
        </div>
      ))}
    </>
  );
}
