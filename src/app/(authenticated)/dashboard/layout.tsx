import DashboardSidebar from '@/app/(authenticated)/dashboard/_utils/components/dashboard-sidebar';

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DashboardSidebar />
      <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden py-6'}>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
