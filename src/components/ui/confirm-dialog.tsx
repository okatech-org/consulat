import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from 'next-intl'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'secondary' | 'success' | 'default'
}

export function ConfirmDialog({
                                open,
                                onOpenChange,
                                onConfirm,
                                title,
                                description,
                                confirmText,
                                cancelText,
                                variant = 'default'
                              }: ConfirmDialogProps) {
  const t = useTranslations('common.confirm')

  const variantClass = {
    destructive: '!bg-red-500 text-white',
    secondary: '!bg-gray-500 text-white',
    success: '!bg-green-500 text-white',
    default: '!bg-primary-500 text-white'
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText || t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={variantClass[variant]}>
            {confirmText || t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}