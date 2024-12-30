import { db } from '@/lib/prisma'
import { Phone } from '@prisma/client'

export class PhoneService {
  static async createOrFind(phoneData: {
    number: string
    countryCode: string
  }): Promise<Phone> {
    const normalizedNumber = this.normalizePhoneNumber(phoneData.number)

    // Chercher un numéro existant
    const existingPhone = await db.phone.findUnique({
      where: { number: normalizedNumber }
    })

    if (existingPhone) {
      return existingPhone
    }

    // Créer un nouveau numéro
    return db.phone.create({
      data: {
        number: normalizedNumber,
        countryCode: phoneData.countryCode
      }
    })
  }

  static async update(id: string, phoneData: {
    number: string
    countryCode: string
  }): Promise<Phone> {
    const normalizedNumber = this.normalizePhoneNumber(phoneData.number)

    return db.phone.update({
      where: { id },
      data: {
        number: normalizedNumber,
        countryCode: phoneData.countryCode
      }
    })
  }

  static normalizePhoneNumber(phone: string): string {
    // Supprime tous les caractères non numériques sauf le +
    return phone.replace(/[^\d+]/g, '')
  }

  static formatPhoneNumber(phone: Phone): string {
    const { number, countryCode } = phone

    // Format selon le pays
    switch (countryCode) {
      case 'FR':
        return number.replace(/(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6')
      case 'GA':
        return number.replace(/(\+241)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
      default:
        return number
    }
  }

  static parsePhoneNumber(phone: string): {
    number: string
    countryCode: string
  } {
    const normalizedNumber = this.normalizePhoneNumber(phone)

    // Détecter le pays selon l'indicatif
    if (normalizedNumber.startsWith('+33')) {
      return { number: normalizedNumber, countryCode: 'FR' }
    }
    if (normalizedNumber.startsWith('+241')) {
      return { number: normalizedNumber, countryCode: 'GA' }
    }

    // Par défaut
    return {
      number: normalizedNumber,
      countryCode: 'UNKNOWN'
    }
  }
}