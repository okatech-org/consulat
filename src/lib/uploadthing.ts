import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getToken } from "next-auth/jwt";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Middleware d'authentification
const auth = async (req: Request) => {
  const token = await getToken({ req });
  if (!token) throw new Error("Unauthorized");
  return { userId: token.sub };
};

export const ourFileRouter = {
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  // Route pour les fichiers génériques
  fileUploader: f({
    image: { maxFileSize: "8MB" },
    pdf: { maxFileSize: "8MB" }
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      // Ces métadonnées seront accessibles dans onUploadComplete
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        key: file.key,
        url: file.url,
        userId: metadata.userId
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;