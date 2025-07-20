'use client';

import { useState } from 'react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { DocumentPreview } from '@/components/ui/document-preview';
import { UserDocument } from '@/components/documents/user-document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { DocumentType } from '@prisma/client';

export default function TestBackgroundRemovalPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleCropComplete = (file: File) => {
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    const url = URL.createObjectURL(file);
    setCroppedImageUrl(url);
    setCropperOpen(false);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
  };

  const openCropper = () => {
    if (selectedFile) {
      setCropperOpen(true);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test de suppression d&apos;arrière-plan avec Remove.bg</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">1. Sélectionner une image</h3>
            <FileInput
              onChangeAction={handleFileSelect}
              accept="image/*"
              fileUrl={imageUrl}
            />
          </div>

          {selectedFile && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-medium mb-3">2. Options de traitement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button onClick={openCropper} className="w-full">
                    Éditeur d&apos;image (avec recadrage)
                  </Button>
                  <Button
                    onClick={() => setPreviewOpen(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Prévisualisation simple
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  3. UserDocument avec suppression d&apos;arrière-plan
                </h3>
                <UserDocument
                  label="Photo d'identité"
                  description="Testez la suppression d'arrière-plan directement dans le composant UserDocument"
                  expectedType={DocumentType.IDENTITY_PHOTO}
                  enableBackgroundRemoval={true}
                  enableEditor={true}
                  accept="image/*"
                  onUpload={(doc) => {
                    console.log('Document uploadé:', doc);
                  }}
                />
              </div>
            </>
          )}

          {croppedImageUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">3. Résultat</h3>
              <div className="border rounded-lg p-4">
                <img
                  src={croppedImageUrl}
                  alt="Image traitée"
                  className="max-w-full h-auto mx-auto"
                />
              </div>
            </div>
          )}

          {cropperOpen && selectedFile && (
            <ImageCropper
              imageUrl={selectedFile}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
              open={cropperOpen}
              fileName="bg-removed-image.png"
            />
          )}

          {previewOpen && imageUrl && (
            <DocumentPreview
              url={imageUrl}
              title="Aperçu du document avec suppression d'arrière-plan"
              type="image"
              isOpen={previewOpen}
              setIsOpenAction={setPreviewOpen}
              enableBackgroundRemoval={true}
              onProcessedImageChange={setProcessedImageUrl}
            />
          )}

          {processedImageUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">Image traitée (Remove.bg)</h3>
              <div className="border rounded-lg p-4">
                <img
                  src={processedImageUrl}
                  alt="Image avec arrière-plan supprimé"
                  className="max-w-full h-auto mx-auto"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
