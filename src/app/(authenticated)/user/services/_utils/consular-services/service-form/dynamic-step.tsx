import { ServiceField, ServiceStep } from '@/types/consular-service'
import { DynamicField } from '@/components/ui/dynamic-field'
import { generateFormSchema } from '@/lib/form/schema-generator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect } from 'react'
import { FormNavigation } from '@/app/(authenticated)/user/services/_utils/consular-services/service-form/form-navigation'
import { MobileProgress } from '@/app/(public)/registration/_utils/components/mobile-progress'

interface DynamicStepProps {
  fields: ServiceField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  isLoading?: boolean
  defaultValues?: Record<string, unknown>
  navigation?: {
    steps: ServiceStep[]
    currentStep: number
    handleFinalSubmit: () => void
    handleNext: () => void
    handlePrevious: () => void
  }
}


export default function DynamicStep({fields, defaultValues, navigation, isLoading = false, onSubmit}: DynamicStepProps) {
  const ref = React.useRef<HTMLFormElement>(null)
  const stepSchema = generateFormSchema(fields)
  type StepSchemaType = z.infer<typeof stepSchema>
  const form = useForm<StepSchemaType>({
    resolver: zodResolver(stepSchema),
    defaultValues
  })

  function handleSubmit(data: StepSchemaType) {
    onSubmit(data)
  }

 return (
   <Form {...form}>
     <form ref={ref} onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-4"}>
       <Card className="overflow-hidden">
         <CardContent className={`grid grid-cols-1 gap-4 pt-4 ${fields.length > 1 && 'md:grid-cols-2'}`}>
           {fields.map((item, index) => {
             return (
               <DynamicField
                 key={item.name + index}
                 data={item}
                 form={form} />
             )
           })}
         </CardContent>
       </Card>
       {navigation && (
         <>
           <FormNavigation
             currentStep={navigation.currentStep}
             totalSteps={navigation.steps.length}
             isLoading={isLoading}
             onNext={() => {
               ref.current?.dispatchEvent(new Event('submit', {cancelable: true}))
             }}
             onPrevious={navigation.handlePrevious}
             isValid={true}
             onSubmit={navigation.handleFinalSubmit}
           />

           {/* Progression mobile */}
           <MobileProgress
             currentStep={navigation.currentStep}
             totalSteps={navigation.steps.length}
             stepTitle={navigation.steps[navigation.currentStep].title}
             isOptional={false}
           />
         </>
       )}
     </form>
   </Form>
 )
}