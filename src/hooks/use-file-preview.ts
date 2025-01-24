import { useEffect, useState } from 'react';

export default function useFilePreview(file: File | null) {
  const [imgSrc, setImgSrc] = useState<null | string>(null);

  useEffect(() => {
    if (file) {
      const newUrl = URL.createObjectURL(file);

      if (newUrl !== imgSrc) {
        setImgSrc(newUrl);
      }
    }
  }, [file, imgSrc]);

  return [imgSrc, setImgSrc];
}
