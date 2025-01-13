export interface Country {
  id: string
  name: string
  code: string
  status: 'ACTIVE' | 'INACTIVE'
  flag?: string
  organizationsCount: number
  usersCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCountryInput {
  id?: string
  name: string
  code: string
  status?: 'ACTIVE' | 'INACTIVE'
  flag?: string
}

export interface UpdateCountryInput extends Partial<CreateCountryInput> {
  id: string
}