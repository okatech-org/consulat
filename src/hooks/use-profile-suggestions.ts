import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { FullProfile } from '@/types'
import { analyzeProfile } from '@/actions/profile-suggestions'

export interface ProfileSuggestion {
  id: string
  field: 'documents' | 'contact' | 'family' | 'professional'
  priority: 'high' | 'medium' | 'low'
  message: string
  action?: {
    type: 'add' | 'update' | 'complete'
    target: string
  }
}

export function useProfileSuggestions(profile: FullProfile) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('profile.assistant')

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await analyzeProfile(profile)

        if (result.suggestions) {
          // Traduire les messages
          const translatedSuggestions = result.suggestions.map((suggestion: ProfileSuggestion) => ({
            ...suggestion,
            message: suggestion.message
          }))

          setSuggestions(translatedSuggestions)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setError(t('errors.fetch_failed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [profile, t])

  return {
    suggestions,
    isLoading,
    error
  }
}