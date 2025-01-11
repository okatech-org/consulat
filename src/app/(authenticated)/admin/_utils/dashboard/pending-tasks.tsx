import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'
import { ArrowRight } from 'lucide-react'

interface Task {
  id: string
  type: 'PROFILE_REVIEW' | 'DOCUMENT_VALIDATION'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  createdAt: Date
}

interface PendingTasksProps {
  tasks: Task[]
}

export function PendingTasks({ tasks }: PendingTasksProps) {
  const t = useTranslations('actions.dashboard.tasks')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('title')}</CardTitle>
        <Link href={ROUTES.admin_profiles}>
          <Button variant="ghost" size="sm">
            {t('view_all')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant={getPriorityVariant(task.priority)}>
                    {t(`priority.${task.priority.toLowerCase()}`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
              <Button size="sm">
                {t('actions.review')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getPriorityVariant(priority: string): "default" | "destructive" | "warning" {
  switch (priority) {
    case 'HIGH':
      return 'destructive'
    case 'MEDIUM':
      return 'warning'
    default:
      return 'default'
  }
}