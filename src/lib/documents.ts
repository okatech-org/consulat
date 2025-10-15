import { DocumentStatus, DocumentType } from '@/convex/lib/constants';
import type { Doc } from '@/convex/_generated/dataModel';

/**
 * Interface pour les données de document utilisateur
 */
export interface UserDocumentData {
  _id?: string;
  type: DocumentType;
  fileUrl: string;
  fileType: string;
  fileName?: string;
  status?: DocumentStatus;
  issuedAt?: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
  validations?: Array<{
    validatorId: string;
    status: string;
    comments?: string;
    timestamp: number;
  }>;
}

/**
 * Interface pour la réponse d'upload de fichier
 */
export interface FileUploadResponse {
  file: Blob;
  name: string;
  type: string;
  key?: string;
  serverData?: {
    fileUrl: string;
  };
}

/**
 * Valide qu'un document peut être créé avec les données fournies
 */
export function validateDocumentData(data: Partial<UserDocumentData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.type) {
    errors.push('Document type is required');
  }

  if (!data.fileUrl) {
    errors.push('File URL is required');
  }

  if (!data.fileType) {
    errors.push('File type is required');
  }

  if (!data.fileName) {
    errors.push('File name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formate une date pour l'affichage
 */
export function formatDocumentDate(date: number | undefined): string {
  if (!date) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Vérifie si un document est expiré
 */
export function isDocumentExpired(document: Doc<'documents'>): boolean {
  if (!document.expiresAt) return false;
  return document.expiresAt < Date.now();
}

/**
 * Vérifie si un document expire bientôt (dans les 30 jours)
 */
export function isDocumentExpiringSoon(document: Doc<'documents'>): boolean {
  if (!document.expiresAt) return false;

  const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return document.expiresAt <= thirtyDaysFromNow && document.expiresAt > Date.now();
}

/**
 * Obtient le statut d'affichage d'un document
 */
export function getDocumentDisplayStatus(document: Doc<'documents'>): {
  status: string;
  color: 'default' | 'destructive' | 'warning' | 'success';
} {
  if (isDocumentExpired(document)) {
    return { status: 'expired', color: 'destructive' };
  }

  if (isDocumentExpiringSoon(document)) {
    return { status: 'expiring', color: 'warning' };
  }

  switch (document.status) {
    case DocumentStatus.Validated:
      return { status: 'validated', color: 'success' };
    case DocumentStatus.Rejected:
      return { status: 'rejected', color: 'destructive' };
    case DocumentStatus.Pending:
      return { status: 'pending', color: 'warning' };
    default:
      return { status: 'unknown', color: 'default' };
  }
}

/**
 * Génère un nom de fichier sécurisé
 */
export function generateSecureFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || '';
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');

  return `${userId}_${timestamp}_${sanitizedName}`;
}

/**
 * Convertit un File en FileUploadResponse pour la compatibilité
 */
export function fileToFileUploadResponse(file: File): FileUploadResponse {
  return {
    file,
    name: file.name,
    type: file.type,
    key: `temp_${Date.now()}`,
    serverData: {
      fileUrl: URL.createObjectURL(file),
    },
  };
}

/**
 * Valide les types de fichiers acceptés
 */
export function validateFileTypes(file: File, acceptedTypes: string[]): boolean {
  if (acceptedTypes.length === 0) return true;

  // Support pour les wildcards comme 'image/*'
  for (const acceptedType of acceptedTypes) {
    if (acceptedType.includes('*')) {
      const baseType = acceptedType.split('/')[0];
      if (file.type.startsWith(baseType + '/')) {
        return true;
      }
    } else if (file.type === acceptedType) {
      return true;
    }
  }

  return false;
}

/**
 * Obtient l'icône appropriée pour un type de document
 */
export function getDocumentIcon(type: DocumentType): string {
  switch (type) {
    case DocumentType.IdentityPhoto:
      return '👤';
    case DocumentType.Passport:
      return '📖';
    case DocumentType.BirthCertificate:
      return '🎂';
    case DocumentType.IdentityCard:
      return '🆔';
    case DocumentType.ResidencePermit:
      return '🏠';
    case DocumentType.ProofOfAddress:
      return '📍';
    case DocumentType.MarriageCertificate:
      return '💒';
    case DocumentType.DeathCertificate:
      return '⚰️';
    case DocumentType.DivorceDecree:
      return '⚖️';
    case DocumentType.NationalityCertificate:
      return '🇬🇦';
    case DocumentType.VisaPages:
      return '📄';
    case DocumentType.EmploymentProof:
      return '💼';
    case DocumentType.NaturalizationDecree:
      return '🏛️';
    case DocumentType.ConsularCard:
      return '🪪';
    default:
      return '📄';
  }
}

/**
 * Obtient la couleur de statut pour l'affichage
 */
export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.Validated:
      return 'text-green-600';
    case DocumentStatus.Rejected:
      return 'text-red-600';
    case DocumentStatus.Pending:
      return 'text-yellow-600';
    case DocumentStatus.Expired:
      return 'text-red-600';
    case DocumentStatus.Expiring:
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Formate la taille du fichier pour l'affichage
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Vérifie si un document nécessite une validation
 */
export function requiresValidation(document: Doc<'documents'>): boolean {
  return document.status === DocumentStatus.Pending;
}

/**
 * Obtient les actions disponibles pour un document
 */
export function getAvailableActions(
  document: Doc<'documents'>,
  userRole?: string,
): Array<{
  action: string;
  label: string;
  requiresRole?: string[];
}> {
  const actions: Array<{
    action: string;
    label: string;
    requiresRole?: string[];
  }> = [];

  // Actions disponibles pour tous les utilisateurs
  if (document.status === DocumentStatus.Pending) {
    actions.push({
      action: 'replace',
      label: 'Remplacer le fichier',
    });
  }

  // Actions nécessitant des rôles administratifs
  const adminRoles = ['ADMIN', 'AGENT', 'SUPER_ADMIN', 'MANAGER'];
  if (userRole && adminRoles.includes(userRole)) {
    if (document.status === DocumentStatus.Pending) {
      actions.push({
        action: 'validate',
        label: 'Valider le document',
        requiresRole: adminRoles,
      });
    }

    actions.push({
      action: 'edit_metadata',
      label: 'Modifier les métadonnées',
      requiresRole: adminRoles,
    });
  }

  return actions;
}
