"use client"

import { FullProfile } from '@/types'
import { useTranslations } from 'next-intl'
import { ProfileStatusBadge } from '@/components/profile/profile-status-badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProfilesTableProps {
  profiles: FullProfile[]
}

export function ProfilesTable({ profiles }: ProfilesTableProps) {
  const t_countries = useTranslations('countries')
  const t_profiles = useTranslations('admin.profiles')

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t_profiles('table.name')}</TableHead>
            <TableHead>{t_profiles('table.nationality')}</TableHead>
            <TableHead>{t_profiles('table.status')}</TableHead>
            <TableHead>{t_profiles('table.submitted_at')}</TableHead>
            <TableHead>{t_profiles('table.updated_at')}</TableHead>
            <TableHead className="w-[80px]">{t_profiles('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">
                {profile.firstName} {profile.lastName}
              </TableCell>
              <TableCell>{t_countries(profile.nationality)}</TableCell>
              <TableCell>
                <ProfileStatusBadge status={profile.status} />
              </TableCell>
              <TableCell>
                {profile.submittedAt
                  ? format(new Date(profile.submittedAt), 'Pp', { locale: fr })
                  : '-'}
              </TableCell>
              <TableCell>
                {format(new Date(profile.updatedAt), 'Pp', { locale: fr })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.admin_profiles_review(profile.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t_profiles('actions.review')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}