import { RoleBasedDataProvider } from '@/contexts/role-data-context';
import { loadRoleBasedData } from '@/lib/role-data-loader';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roleData = await loadRoleBasedData();
  return <RoleBasedDataProvider initialData={roleData}>{children}</RoleBasedDataProvider>;
}
