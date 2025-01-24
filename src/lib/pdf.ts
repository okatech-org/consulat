import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FullProfile } from '@/types';

export async function generatePDF(profile: FullProfile): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([350, 200]); // Format carte de crédit

  // Charger la police
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Ajouter la photo si disponible
  if (profile.identityPicture) {
    const photoBytes = await fetch(profile.identityPicture.fileUrl).then((res) =>
      res.arrayBuffer(),
    );
    const photoImage = await pdfDoc.embedJpg(photoBytes);
    page.drawImage(photoImage, {
      x: 20,
      y: page.getHeight() - 90,
      width: 60,
      height: 80,
    });
  }

  // Ajouter les informations
  page.drawText('RÉPUBLIQUE GABONAISE', {
    x: 150,
    y: page.getHeight() - 30,
    font: boldFont,
    size: 12,
  });

  page.drawText('CARTE CONSULAIRE', {
    x: 150,
    y: page.getHeight() - 45,
    font: boldFont,
    size: 10,
  });

  // Ajouter les autres informations...

  return pdfDoc.save();
}
