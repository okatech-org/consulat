import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { documentsRouter } from './documents';

// Types d'input pour toutes les procédures du router documents
export type DocumentsRouterInputs = inferRouterInputs<typeof documentsRouter>;

// Types d'output pour toutes les procédures du router documents
export type DocumentsRouterOutputs = inferRouterOutputs<typeof documentsRouter>;

// Types spécifiques pour getUserDocumentsDashboard
export type GetUserDocumentsDashboardInput =
  DocumentsRouterInputs['getUserDocumentsDashboard'];
export type UserDocumentsDashboard = DocumentsRouterOutputs['getUserDocumentsDashboard'];

// Types pour getUserDocuments
export type UserDocuments = DocumentsRouterOutputs['getUserDocuments'];

// Types pour getById
export type GetDocumentByIdInput = DocumentsRouterInputs['getById'];
export type DocumentDetails = DocumentsRouterOutputs['getById'];

// Types pour create
export type CreateDocumentInput = DocumentsRouterInputs['create'];
export type CreateDocumentResult = DocumentsRouterOutputs['create'];

// Types pour updateMetadata
export type UpdateDocumentMetadataInput = DocumentsRouterInputs['updateMetadata'];
export type UpdateDocumentMetadataResult = DocumentsRouterOutputs['updateMetadata'];

// Types pour delete
export type DeleteDocumentInput = DocumentsRouterInputs['delete'];
export type DeleteDocumentResult = DocumentsRouterOutputs['delete'];
