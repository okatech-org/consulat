import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const processFileData = async (
  formData: FormData | undefined,
  existingKey?: string
) => {
  console.log('Processing file data...', formData?.getAll('files'));
  if (!formData) return null;

  try {
    const files = formData.getAll('files');
    if (!files || files.length === 0) return null;

    // Si un fichier existant, le supprimer d'abord
    if (existingKey) {
      try {
        await utapi.deleteFiles(existingKey);
      } catch (error) {
        console.error('Error deleting existing file:', error);
      }
    }

    // Uploader le nouveau fichier
    const file = files[0] as File;
    const response = await utapi.uploadFiles(file);

    if (!response?.data) {
      throw new Error('Upload failed');
    }

    return {
      key: response.data.key,
      url: response.data.url
    };

  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(
      error instanceof Error
        ? `Error uploading file: ${error.message}`
        : 'Error uploading file'
    );
  }
};