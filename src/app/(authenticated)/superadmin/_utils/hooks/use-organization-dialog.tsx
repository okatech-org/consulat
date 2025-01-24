import { create } from 'zustand';
import { Organization } from '@/types/organization';

interface OrganizationDialogStore {
  isOpen: boolean;
  organization?: Organization;
  openCreateDialog: () => void;
  openEditDialog: (organization: Organization) => void;
  closeDialog: () => void;
}

export const useOrganizationDialog = create<OrganizationDialogStore>((set) => ({
  isOpen: false,
  organization: undefined,
  openCreateDialog: () => set({ isOpen: true, organization: undefined }),
  openEditDialog: (organization) => set({ isOpen: true, organization }),
  closeDialog: () => set({ isOpen: false, organization: undefined }),
}));
