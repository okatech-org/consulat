export interface Country {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  flag?: string | null;
  metadata: CountryMetadata | null;
  _count?: {
    organizations: number;
    users: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryMetadata {
  currency?: {
    code?: string;
    symbol?: string;
    format?: string;
    symbolPosition?: 'before' | 'after';
  };
  language?: {
    defaultLocale?: string;
    locales?: string[];
  };
  dateFormat?: string;
  timeFormat?: string;
  timeZone?: string;
  addressFormat?: {
    fieldsOrder?: string[];
    requiredFields?: string[];
  };
  holidays?: Array<{ date?: string; name?: string }>;
}

export interface CreateCountryInput {
  id?: string;
  name: string;
  code: string;
  status?: 'ACTIVE' | 'INACTIVE';
  flag?: string;
}

export interface UpdateCountryInput extends Partial<CreateCountryInput> {
  id: string;
}
