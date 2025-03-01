import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/user';
import { createChildProfile } from '@/actions/child-profiles';
import { canPerform } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'Vous devez être connecté et avoir un profil' },
        { status: 401 },
      );
    }

    // 2. Vérifier les permissions
    const canCreateChild = await canPerform('profiles.createChild', user, user.profile);
    if (!canCreateChild) {
      return NextResponse.json(
        { error: "Vous n'avez pas les permissions nécessaires" },
        { status: 403 },
      );
    }

    // 3. Récupérer et valider les données du formulaire
    const formData = await request.formData();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const gender = formData.get('gender') as 'MALE' | 'FEMALE';
    const birthDate = formData.get('birthDate') as string;
    const birthPlace = formData.get('birthPlace') as string;
    const birthCountry = formData.get('birthCountry') as string;
    const nationality = formData.get('nationality') as string;
    const parentRole = formData.get('parentRole') as
      | 'FATHER'
      | 'MOTHER'
      | 'LEGAL_GUARDIAN';

    // Validation simple
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !birthDate ||
      !birthPlace ||
      !birthCountry ||
      !nationality ||
      !parentRole
    ) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 },
      );
    }

    // 4. Créer le profil enfant
    const childProfile = await createChildProfile({
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      birthCountry,
      nationality,
      passportNumber: '', // Facultatif
      passportIssueDate: new Date(), // Facultatif
      passportExpiryDate: new Date(), // Facultatif
      passportIssueAuthority: '', // Facultatif
      parentUserId: user.id,
      parentRole,
    });

    // 5. Répondre avec le profil créé
    return NextResponse.json({ profile: childProfile }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du profil enfant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 },
    );
  }
}
