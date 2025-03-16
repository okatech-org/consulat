import { auth } from '@/auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { UTApi } from 'uploadthing/server';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Route for handling image uploads
  documentUploader: f({ image: { maxFileSize: '8MB' }, pdf: { maxFileSize: '8MB' } })
    .middleware(async () => {
      console.log('middleware');
      const session = await auth();
      if (!session) throw new UploadThingError('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('upload complete', file);
      return {
        key: file.key,
        url: file.ufsUrl,
        userId: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});
