import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getCurrentUser } from '@/actions/user';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Route spécifique pour les PDFs - Limite réduite pour la sécurité
  pdfUploader: f({
    pdf: {
      maxFileSize: '32MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new UploadThingError('Unauthorized');
      return { userId: currentUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        userId: metadata.userId,
        fileUrl: file.ufsUrl,
      };
    }),
  // Route pour les images - Limite réduite pour la sécurité
  imageUploader: f({
    image: {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new UploadThingError('Unauthorized');
      return { userId: currentUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        userId: metadata.userId,
        fileUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
