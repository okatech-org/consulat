'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Step } from '@/components/consular-services/service-form/index'

interface StepIndicatorProps {
  steps:  Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="relative">
      {/* Barre de progression */}
      <div className="absolute left-0 top-[15px] h-[2px] w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Étapes */}
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCurrent = currentStep === index
          const isComplete = index < currentStep

          return (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              {/* Indicateur */}
              <motion.div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  !isCurrent && !isComplete && "border-muted bg-background"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-2 hidden text-center md:block">
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-primary",
                  !isCurrent && !isComplete && "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Titre de l'étape courante (mobile) */}
      <div className="mt-4 text-center md:hidden">
        <p className="font-medium">
          {steps[currentStep].title}
        </p>
        <p className="text-sm text-muted-foreground">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  )
}