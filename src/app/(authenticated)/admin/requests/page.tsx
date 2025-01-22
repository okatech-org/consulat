import { getTranslations } from 'next-intl/server'

export default async function RequestsPage() {
  const t_profiles = await getTranslations('actions.profiles')

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t_profiles('title')}
        </h1>
        <p className="text-muted-foreground">
          {t_profiles('description')}
        </p>
      </div>
    </div>
  )
}