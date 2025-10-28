'use node';

import { action } from '../_generated/server';
import { v } from 'convex/values';
import { removeBackgroundFromImageUrl, removeBackgroundFromImageFile } from 'remove.bg';

export interface BackgroundRemovalResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const removeBackgroundFromUrl = action({
  args: {
    imageUrl: v.string(),
  },
  handler: async (_, args): Promise<BackgroundRemovalResult> => {
    try {
      const data = await removeBackgroundFromImageUrl({
        url: args.imageUrl,
        apiKey: process.env.REMOVEBG_API_KEY!,
        size: 'preview',
        type: 'person',
        format: 'png',
      });

      if (data && typeof data === 'object' && 'base64img' in data) {
        const dataUrl = `data:image/png;base64,${data.base64img}`;
        return {
          success: true,
          imageUrl: dataUrl,
        };
      }

      return {
        success: false,
        error: 'Aucune image retournée par Remove.bg',
      };
    } catch (error) {
      console.error('Erreur Remove.bg:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression de l'arrière-plan",
      };
    }
  },
});

export const removeBackgroundFromFile = action({
  args: {
    fileBase64: v.string(),
    fileName: v.string(),
  },
  handler: async (_, args): Promise<BackgroundRemovalResult> => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { writeFile } = await import('fs/promises');

      const tempDir = '/tmp';
      const tempFileName = `bg-removal-${Date.now()}-${args.fileName}`;
      const tempFilePath = path.join(tempDir, tempFileName);

      const buffer = Buffer.from(args.fileBase64, 'base64');
      await writeFile(tempFilePath, buffer);

      const data = await removeBackgroundFromImageFile({
        path: tempFilePath,
        apiKey: process.env.REMOVEBG_API_KEY!,
        size: 'preview',
        type: 'person',
        format: 'png',
      });

      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Erreur lors du nettoyage du fichier temporaire:', cleanupError);
      }

      if (data && typeof data === 'object' && 'base64img' in data) {
        const dataUrl = `data:image/png;base64,${data.base64img}`;
        return {
          success: true,
          imageUrl: dataUrl,
        };
      }

      return {
        success: false,
        error: 'Aucune image retournée par Remove.bg',
      };
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },
});
