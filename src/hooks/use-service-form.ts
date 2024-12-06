import { useCallback, useReducer } from 'react'
import { ServiceFormState, ServiceFormAction, ServiceFormData, ServiceStep } from '@/types/consular-service'

const initialState: ServiceFormState = {
  currentStep: 0,
  formData: {
    documents: {},
  },
  isSubmitting: false,
  validation: {},
}

function reducer(state: ServiceFormState, action: ServiceFormAction): ServiceFormState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      }
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }
    case 'UPDATE_VALIDATION':
      return {
        ...state,
        validation: {
          ...state.validation,
          [action.payload.field]: action.payload.isValid,
        },
      }
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

interface UseServiceFormProps {
  steps: ServiceStep[]
  onSubmit: (data: ServiceFormData) => Promise<void>
  defaultValues?: Partial<ServiceFormData>
}

export function useServiceForm({ steps, onSubmit, defaultValues }: UseServiceFormProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    formData: defaultValues ? { ...initialState.formData, ...defaultValues } : initialState.formData,
  })

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    const currentStep = steps[step]
    if (!currentStep) return false

    switch (currentStep.stepType) {
      case 'DOCUMENTS': {
        // Vérifier que tous les documents requis sont présents
        const hasAllRequired = currentStep.requiredDocuments.every(
          docType => state.formData.documents[docType]
        )
        dispatch({
          type: 'UPDATE_VALIDATION',
          payload: { field: `step_${step}`, isValid: hasAllRequired },
        })
        return hasAllRequired
      }

      case 'FORM': {
        // Vérifier tous les champs requis du formulaire
        const requiredFields = currentStep.fields.filter(field => field.required)
        const hasAllRequired = requiredFields.every(
          field => state.formData[field.name]
        )
        dispatch({
          type: 'UPDATE_VALIDATION',
          payload: { field: `step_${step}`, isValid: hasAllRequired },
        })
        return hasAllRequired
      }

      case 'APPOINTMENT': {
        // Vérifier qu'un rendez-vous a été sélectionné
        const hasAppointment = !!state.formData.appointment
        dispatch({
          type: 'UPDATE_VALIDATION',
          payload: { field: `step_${step}`, isValid: hasAppointment },
        })
        return hasAppointment
      }

      case 'REVIEW':
        // L'étape de revue est toujours valide
        return true

      default:
        return false
    }
  }, [steps, state.formData])

  const isStepValid = useCallback(
    (step: number): boolean => {
      return !!state.validation[`step_${step}`]
    },
    [state.validation]
  )

  const handleNext = useCallback(async () => {
    const isValid = await validateStep(state.currentStep)
    if (isValid) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 })
    }
  }, [state.currentStep, validateStep])

  const handlePrevious = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 })
    }
  }, [state.currentStep])

  const handleSubmit = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: undefined })

      // Valider toutes les étapes
      const validations = await Promise.all(
        steps.map((_, index) => validateStep(index))
      )

      if (validations.every(Boolean)) {
        await onSubmit(state.formData)
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Veuillez compléter tous les champs requis',
        })
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }, [steps, validateStep, onSubmit, state.formData])

  return {
    state,
    dispatch,
    handleNext,
    handlePrevious,
    handleSubmit,
    validateStep,
    isStepValid,
  }
}