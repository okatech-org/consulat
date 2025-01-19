// src/lib/ai/question-manager.ts

import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export class QuestionManager {
  static async storeQuestion(question: string, userRole: UserRole) {
    // Vérifier si la question est pertinente
    const isRelevant = await this.isQuestionRelevant(question);

    if (!isRelevant) return;

    // Vérifier si la question existe déjà
    const existingQuestion = await db.aIQuestion.findFirst({
      where: {
        question: {
          contains: question,
          mode: 'insensitive'
        }
      }
    });

    if (existingQuestion) {
      // Mettre à jour la fréquence
      await db.aIQuestion.update({
        where: { id: existingQuestion.id },
        data: { frequency: { increment: 1 } }
      });
    } else {
      // Créer une nouvelle question
      await db.aIQuestion.create({
        data: {
          question,
          userRole,
          category: await this.categorizeQuestion(question),
          isRelevant: true
        }
      });
    }
  }

  static async getFrequentQuestions() {
    return db.aIQuestion.findMany({
      where: { isRelevant: true },
      orderBy: { frequency: 'desc' },
      take: 20
    })
  }

  private static async isQuestionRelevant(question: string): Promise<boolean> {
    // Implémenter la logique pour déterminer si une question est pertinente
    // Par exemple, longueur minimale, mots-clés spécifiques, etc.
    return question.length >= 10 && !question.includes('bonjour') && !question.includes('merci');
  }

  private static async categorizeQuestion(question: string): Promise<string> {
    // Implémenter la logique de catégorisation
    // Par exemple, basée sur des mots-clés
    if (question.includes('passeport')) return 'Documents';
    if (question.includes('mariage')) return 'État civil';
    return 'Général';
  }
}