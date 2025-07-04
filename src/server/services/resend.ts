import { Resend } from 'resend';
import { env } from '@/env';

const resend = new Resend(env.RESEND_API_KEY);

export const resendService = {
  async sendOTPEmail(email: string, code: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: env.RESEND_SENDER,
        to: email,
        subject: 'Code de vérification - Consulat',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Votre code de vérification</h2>
            <p style="font-size: 16px; color: #666;">
              Utilisez le code suivant pour vous connecter :
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
                ${code}
              </span>
            </div>
            <p style="font-size: 14px; color: #999;">
              Ce code expire dans 5 minutes. Ne le partagez avec personne.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('Erreur Resend:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },

  async sendWelcomeEmail(email: string, name: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: env.RESEND_SENDER,
        to: email,
        subject: 'Bienvenue sur Consulat',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Bienvenue ${name} !</h1>
            <p style="font-size: 16px; color: #666;">
              Votre compte a été créé avec succès. Vous pouvez maintenant accéder à tous nos services consulaires.
            </p>
            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Prochaines étapes :</h3>
              <ul style="color: #666;">
                <li>Complétez votre profil</li>
                <li>Ajoutez vos documents</li>
                <li>Faites votre première demande</li>
              </ul>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Erreur Resend (welcome):', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },
};
