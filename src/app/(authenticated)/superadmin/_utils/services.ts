import { create } from 'zustand';
import { ServiceStore } from '@/types/consular-service';

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,

  setServices: (services) => set({ services }),
  setSelectedService: (service) => set({ selectedService: service }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
