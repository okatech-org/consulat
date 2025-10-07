export const ALLOWED_FILE_TYPES = {
  IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
  ],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  AUDIOS: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4'],
} as const

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 20 * 1024 * 1024, // 20MB
  ARCHIVE: 25 * 1024 * 1024, // 25MB
  DEFAULT: 5 * 1024 * 1024, // 5MB
} as const

export type FileCategory = keyof typeof ALLOWED_FILE_TYPES

export interface FileValidationResult {
  isValid: boolean
  error?: string
  category?: FileCategory
  sizeLimit?: number
}

export interface FileMetadata {
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: number
  uploadedBy: string
  category: FileCategory
  checksum?: string
}

export function validateFileType(
  fileType: string,
  allowedTypes: Array<string>,
): FileValidationResult {
  const isValid = allowedTypes.includes(fileType)

  if (!isValid) {
    return {
      isValid: false,
      error: `File type ${fileType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  const category = getFileCategory(fileType)
  const sizeLimit = getSizeLimitForCategory(category)

  return {
    isValid: true,
    category,
    sizeLimit,
  }
}

export function validateFileSize(
  fileSize: number,
  maxSize: number,
): FileValidationResult {
  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: `File size ${formatBytes(fileSize)} exceeds limit of ${formatBytes(maxSize)}`,
    }
  }

  return { isValid: true }
}

export function getFileCategory(fileType: string): FileCategory {
  if (ALLOWED_FILE_TYPES.IMAGES.includes(fileType as any)) return 'IMAGES'
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(fileType as any)) return 'DOCUMENTS'
  if (ALLOWED_FILE_TYPES.ARCHIVES.includes(fileType as any)) return 'ARCHIVES'
  if (ALLOWED_FILE_TYPES.VIDEOS.includes(fileType as any)) return 'VIDEOS'
  if (ALLOWED_FILE_TYPES.AUDIOS.includes(fileType as any)) return 'AUDIOS'

  return 'IMAGES' // Retourner un type valide au lieu de 'DEFAULT'
}

export function getSizeLimitForCategory(category: FileCategory): number {
  switch (category) {
    case 'IMAGES':
      return FILE_SIZE_LIMITS.IMAGE
    case 'DOCUMENTS':
      return FILE_SIZE_LIMITS.DOCUMENT
    case 'VIDEOS':
      return FILE_SIZE_LIMITS.VIDEO
    case 'AUDIOS':
      return FILE_SIZE_LIMITS.AUDIO
    case 'ARCHIVES':
      return FILE_SIZE_LIMITS.ARCHIVE
    default:
      return FILE_SIZE_LIMITS.DEFAULT
  }
}

export function getAllowedTypesForCategory(
  category: FileCategory,
): Array<string> {
  return [...ALLOWED_FILE_TYPES[category]] // Convertir readonly array en mutable array
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || ''
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')

  return `${userId}_${timestamp}_${sanitizedName}`
}

export function getFileIcon(fileType: string): string {
  const category = getFileCategory(fileType)

  switch (category) {
    case 'IMAGES':
      return '🖼️'
    case 'DOCUMENTS':
      if (fileType.includes('pdf')) return '📄'
      if (fileType.includes('word')) return '📝'
      if (fileType.includes('excel') || fileType.includes('spreadsheet'))
        return '📊'
      if (fileType.includes('powerpoint') || fileType.includes('presentation'))
        return '📽️'
      return '📄'
    case 'VIDEOS':
      return '🎥'
    case 'AUDIOS':
      return '🎵'
    case 'ARCHIVES':
      return '🗜️'
    default:
      return '📎'
  }
}

export function isPreviewable(fileType: string): boolean {
  const category = getFileCategory(fileType)
  return (
    category === 'IMAGES' ||
    fileType.includes('pdf') ||
    fileType.includes('text/')
  )
}

export function getPreviewType(
  fileType: string,
): 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'file' {
  const category = getFileCategory(fileType)

  switch (category) {
    case 'IMAGES':
      return 'image'
    case 'DOCUMENTS':
      if (fileType.includes('pdf')) return 'pdf'
      if (fileType.includes('text/')) return 'text'
      return 'file'
    case 'VIDEOS':
      return 'video'
    case 'AUDIOS':
      return 'audio'
    default:
      return 'file'
  }
}
