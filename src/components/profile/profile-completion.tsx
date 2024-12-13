'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProfileFieldStatus {
  required: {
    total: number
    completed: number
    fields: Array<{
      key: string
      name: string
      completed: boolean
    }>
  }
  optional: {
    total: number
    completed: number
    fields: Array<{
      key: string
      name: string
      completed: boolean
    }>
  }
}

interface ProfileCompletionProps {
  completionRate: number
  fieldStatus: ProfileFieldStatus
}

export function ProfileCompletion({
                                    completionRate,
                                    fieldStatus
                                  }: ProfileCompletionProps) {
  const t = useTranslations('profile')

  const getCompletionColor = (rate: number) => {
    if (rate >= 100) return 'text-success'
    if (rate >= 70) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('completion.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barre de progression globale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('completion.progress')}
            </span>
            <span className={`font-medium ${getCompletionColor(completionRate)}`}>
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} />
        </div>

        {/* Sections d'informations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations requises */}
          <FieldsSection
            title={t('completion.required_information')}
            fields={fieldStatus.required.fields}
            completed={fieldStatus.required.completed}
            total={fieldStatus.required.total}
            type="required"
          />

          {/* Informations optionnelles */}
          <FieldsSection
            title={t('completion.optional_information')}
            fields={fieldStatus.optional.fields}
            completed={fieldStatus.optional.completed}
            total={fieldStatus.optional.total}
            type="optional"
          />
        </div>
      </CardContent>
    </Card>
  )
}

const FieldsList = ({
                      fields,
                      isExpanded,
                      type,
                    }: {
  fields: Array<{ key: string; name: string; completed: boolean }>
  isExpanded: boolean
  type: 'required' | 'optional'
}) => {
  const t = useTranslations('profile')
  const visibleFields = isExpanded ? fields : fields.slice(0, 2)

  return (
    <ul className="space-y-2">
      {visibleFields.map((field) => (
        <motion.li
          key={field.key}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            {field.completed ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className={cn(
                "h-4 w-4",
                type === 'required' ? "text-destructive" : "text-muted-foreground"
              )} />
            )}
            {t(`fields.${field.name}`)}
          </div>
          {!field.completed && (
            <Badge
              variant={type === 'required' ? "destructive" : "warning"}
              className="text-xs"
            >
              {t(`completion.${type}`)}
            </Badge>
          )}
        </motion.li>
      ))}
    </ul>
  )
}

const FieldsSection = ({
                         title,
                         fields,
                         completed,
                         total,
                         type
                       }: {
  title: string
  fields: Array<{ key: string; name: string; completed: boolean }>
  completed: number
  total: number
  type: 'required' | 'optional'
}) => {
  const t = useTranslations('profile')
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMoreFields = fields.length > 2

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {title}
        </h4>
        <Badge variant="outline">
          {completed}/{total}
        </Badge>
      </div>

      <FieldsList
        fields={fields}
        isExpanded={isExpanded}
        type={type}
      />

      {hasMoreFields && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              {t('completion.show_less')}
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              {t('completion.show_more', { count: fields.length - 2 })}
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}