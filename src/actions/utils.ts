import { UploadedFileData } from 'uploadthing/types'
import { deleteFiles, uploadFiles } from '@/actions/uploads'
import { PrismaClient } from '@prisma/client'

type ProcessFileData = (
  formData: FormData | undefined,
  existingKey?: string,
  db?: PrismaClient,
  size?: { width: number; height: number }
) => Promise<UploadedFileData | null>

/**
 * Uploads a file to uploadthing file server and returns the file data, or null if no file was uploaded. If an existing key is provided, it will delete the existing file before uploading the new one.
 * @param formData
 * @param existingKey
 * @param db
 * @param size
 */
export const processFileData: ProcessFileData = async (
  formData,
  existingKey?,
  size?,
) => {
  if (formData) {
    try {
      // Validate formData has files
      const files = formData.getAll('files')
      if (!files || files.length === 0) {
        return null
      }

      const [file] = await uploadFiles(formData)

      if (existingKey) {
        try {
          await deleteFiles([existingKey])
        } catch (deleteError) {
          console.error('Error deleting existing file:', deleteError)
          // Continue with upload even if delete fails
        }
      }

      return file
    } catch (error) {
      console.error('File processing error:', error)
      throw new Error(
        error instanceof Error
          ? `Error uploading file: ${error.message}`
          : 'Error uploading file',
      )
    }
  }

  return null
}