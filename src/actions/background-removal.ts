'use server';

import { removeBackgroundFromImageUrl, removeBackgroundFromImageFile } from 'remove.bg';
import { env } from '@/env';
import { tryCatch } from '@/lib/utils';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export interface BackgroundRemovalResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function removeBackgroundFromUrl(
  imageUrl: string,
): Promise<BackgroundRemovalResult> {
  const { data, error } = await tryCatch(
    removeBackgroundFromImageUrl({
      url: imageUrl,
      apiKey: env.REMOVEBG_API_KEY,
      size: 'preview',
      type: 'person',
      format: 'png',
    }),
  );

  if (error) {
    console.error('Erreur Remove.bg:', error);
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression de l'arrière-plan",
    };
  }

  if (data && typeof data === 'object' && 'base64img' in data) {
    // Convertir base64 en data URL
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
}

export async function removeBackgroundFromFile(
  file: File,
): Promise<BackgroundRemovalResult> {
  try {
    // Créer un fichier temporaire
    const tempDir = '/tmp';
    const tempFileName = `bg-removal-${Date.now()}-${file.name}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    // Écrire le fichier sur le disque
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(tempFilePath, Buffer.from(arrayBuffer));

    const { data, error } = await tryCatch(
      removeBackgroundFromImageFile({
        path: tempFilePath,
        apiKey: env.REMOVEBG_API_KEY,
        size: 'preview',
        type: 'person',
        format: 'png',
      }),
    );

    // Nettoyer le fichier temporaire
    try {
      fs.unlinkSync(tempFilePath);
    } catch (cleanupError) {
      console.warn('Erreur lors du nettoyage du fichier temporaire:', cleanupError);
    }

    if (error) {
      console.error('Erreur Remove.bg:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de la suppression de l'arrière-plan",
      };
    }

    if (data && typeof data === 'object' && 'base64img' in data) {
      // Convertir base64 en data URL
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
}
