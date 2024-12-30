import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ProfileActions = {
  contact?: boolean
  share?: boolean
  message?: boolean
  card?: boolean
  edit?: boolean
  cardPreview?: boolean
}

type VCardData = {
  firstName?: string
  lastName?: string
  fullName?: string
  title?: string
  emails?: { value: string }[]
  phones?: { value: string }[]
  addresses?: {
    firstLine: string
    secondLine?: string | null
    city: string
    zipCode?: string | null
    country: string
  }[]
  socialLinks?: { type: string; url: string }[]
  links?: { url: string }[]
  note?: string
  photoUrl?: string
}

export function generateVCardString(data: VCardData): string {
  let vCardString = `BEGIN:VCARD\nVERSION:3.0\nPRODID:-//Apple Inc.//macOS 14.4//EN\n`

  if (data.firstName && data.lastName) {
    vCardString += `N:${data.lastName};${data.firstName};;;\n`
    vCardString += `FN:${data.firstName} ${data.lastName}\n`
  }

  if (data.fullName) {
    vCardString += `NICKNAME:${data.fullName}\n`
  }

  if (data.title) {
    vCardString += `ORG:${data.title};\n`
  }

  data.emails && (data.emails.forEach((email) => {
    vCardString += `EMAIL;type=INTERNET;type=pref:${email.value}\n`
  }))

  data.phones && (data.phones.forEach((phone) => {
    vCardString += `TEL;type=CELL;type=VOICE;type=pref:${phone.value}\n`
  }))

  data.addresses && (data.addresses.forEach((address, index) => {
    const addressType = index === 0 ? 'WORK;type=pref' : 'HOME'
    vCardString += `ADR;type=${addressType}:;;${address.firstLine};${address.city};;${address.zipCode};${address.country}\n`
  }))

  data.socialLinks && (data.socialLinks.forEach((socialLink, index) => {
    vCardString += `item${index + 1}.URL;type=pref:${socialLink.url}\n`
    vCardString += `item${index + 1}.X-ABLabel:${socialLink.type}\n`
  }))

  data.links && (data.links?.forEach((link, index) => {
    const linkType = index === 0 ? 'pref' : ''
    vCardString += `item${index + 1}.URL;type=${linkType.toLocaleUpperCase()}:${link.url}\n`
    if (linkType === 'pref') {
      vCardString += `item${index + 1}.X-ABLabel:_$!<HomePage>!$_\n`
    }
  }))

  data.note && (vCardString += `NOTE:${data.note}\n`)

  vCardString += `END:VCARD`

  return vCardString
}

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB
export const ACCEPTED_FILE_TYPES = [
  'image/*',
  'application/pdf',
]

export const phoneRegex = new RegExp(
  /(?:([+]\d{1,4})[-.\s]?)?(?:[(](\d{1,3})[)][-.\s]?)?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/g
)

export function checkFileSize(
  files: FileList | File[] | undefined,
  size: number
) {
  if (!files || files.length === 0) return true
  return files[0].size <= size
}

export function checkFileType(
  files: FileList | File[] | undefined,
  types: string[]
) {
  if (!files || files.length === 0) return true
  return types.includes(files?.[0].type)
}

export const APP_NAME = 'Consulat'
export const APP_DEFAULT_TITLE =
  'Contact.ga - Développez votre réseau en toute simplicité !'
export const APP_TITLE_TEMPLATE = '%s - Consulat'
export const APP_DESCRIPTION =
  'Consulat vous permet de partager vos informations de contact simplement et sans contact par QR Code, en NFC ou en lien direct. Vous pouvez aussi acceder à un vaste réseau de professionnels et d\'entreprises gabonais.'

type CountryItem = {
  name: string
  code: string
}
export async function getApiCountries(): Promise<CountryItem[]> {
  const response = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,cca2'
  )
  const data = await response.json()

  return data.map((country: { name: { common: string }; cca2: string }) => ({
    name: country.name.common,
    code: country.cca2,
  }))
}

export async function getCountryCode(name: string): Promise<string | null> {
  const response = await fetch(
    `https://restcountries.com/v3.1/name/${name}?fields=name,cca2`
  )
  const data = await response.json()

  return data[0]?.cca2 ?? name
}

export interface DocumentField {
  name: string
  description: string
  required?: boolean
  type?: 'string' | 'date' | 'address'
}

const STORAGE_KEY = 'consular_form_data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveFormData(data: any) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving form data:', error)
  }
}

export function loadFormData() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading form data:', error)
    return null
  }
}

export function clearFormData() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing form data:', error)
  }
}

export function useFormStorage() {
  const loadSavedData = () => {
    return loadFormData()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveData = (data: any) => {
    saveFormData(data)
  }

  const clearData = () => {
    clearFormData()
  }

  return {
    loadSavedData,
    saveData,
    clearData,
  }
}

import { Profile } from '@prisma/client'
import { phoneCountries } from '@/assets/autocomplete-datas'
import { FullProfile } from '@/types'

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

export function getProfileFieldsStatus(profile: Profile | null): ProfileFieldStatus {
  if (!profile) {
    return {
      required: { total: 0, completed: 0, fields: [] },
      optional: { total: 0, completed: 0, fields: [] }
    }
  }

  const requiredFields: {
    key: keyof FullProfile
    name: string
  }[] = [
    { key: 'firstName', name: 'first_name' },
    { key: 'lastName', name: 'last_name' },
    { key: 'birthDate', name: 'birth_date' },
    { key: 'nationality', name: 'nationality' },
    { key: 'gender', name: 'gender' },
    { key: 'identityPicture', name: 'identity_photo' },
    { key: 'passport', name: 'passport' },
    { key: 'birthCertificate', name: 'birth_certificate' },
    { key: 'phone', name: 'phone' },
    { key: 'address', name: 'address' },
    {key: "addressProof", name: "address_proof"},
    { key: 'profession', name: 'profession' },
    { key: 'addressInGabon', name: 'gabon_address' },
    { key: 'activityInGabon', name: 'gabon_activity' },
    { key: 'maritalStatus', name: 'marital_status' },
    { key: 'profession', name: 'profession' },
    { key: 'addressInGabon', name: 'gabon_address' },
    { key: 'activityInGabon', name: 'gabon_activity' },
    { key: 'maritalStatus', name: 'marital_status' },
  ]

  if (profile.workStatus === 'EMPLOYEE') {
    requiredFields.push({ key: 'employer', name: 'employer' })
    requiredFields.push({ key: 'employerAddress', name: 'work_address' })
  }

  if (profile.maritalStatus === 'MARRIED' || profile.maritalStatus === 'COHABITING') {
    requiredFields.push({ key: 'spouseFullName', name: 'spouse_name' })
  }

  const requiredStatus = requiredFields.map(field => ({
    ...field,
    completed: !!profile[field.key as keyof Profile]
  }))

  return {
    required: {
      total: requiredFields.length,
      completed: requiredStatus.filter(f => f.completed).length,
      fields: requiredStatus.sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1)
    },
    optional: {
      total: 0,
      completed: 0,
      fields: []
    }
  }
}

export const extractNumber = (fullPhoneNumber: string) => {
  const countryCodes = phoneCountries.map((country) => country.value)
  let countryCode = ''
  let number = fullPhoneNumber

  for (const code of countryCodes) {
    if (fullPhoneNumber.startsWith(code)) {
      countryCode = code
      number = fullPhoneNumber.slice(code.length).trim()
      break
    }
  }

  return { countryCode, number }
}