import React from 'react';
import Image from 'next/image';

type FilePreviewProps = {
  files: FileList | File[] | undefined;
  render?: (previewUrl: string) => React.ReactNode;
  fileUrl: string | null | undefined;
  width?: number;
  height?: number;
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  fileUrl,
  render,
  width = 200,
  height = 200,
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Release object URL on cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [files]);

  if (!previewUrl && !fileUrl) {
    return null;
  }

  return (
    <>
      {previewUrl && (
        <>
          {render ? (
            render(previewUrl)
          ) : (
            <Image src={previewUrl} alt="Preview" width={width} height={height} />
          )}
        </>
      )}

      {!previewUrl && fileUrl && (
        <>
          {render?.(fileUrl) ?? (
            <Image src={fileUrl} alt="Preview" width={width} height={height} />
          )}
        </>
      )}
    </>
  );
};
