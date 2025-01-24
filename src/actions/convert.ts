'use server';

import sharp from 'sharp';

interface ConvertAPIResponse {
  Files: Array<{
    Url: string;
    FileName?: string;
    FileSize?: number;
  }>;
}

interface ConvertAPIError {
  Code?: string;
  Message?: string;
}

export async function pdfToImages(file: File): Promise<Buffer[]> {
  const apiKey = process.env.CONVERT_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ConvertAPI key');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Expected PDF');
  }

  try {
    const formData = new FormData();
    formData.append('File', file);

    // Add parameters to improve conversion quality and reliability
    formData.append('StoreFile', 'true');
    formData.append('ImageQuality', '80');
    formData.append('ScaleImage', 'true');
    formData.append('ScaleProportions', 'true');
    formData.append('Timeout', '180'); // 3 minutes timeout

    const response = await fetch(
      `https://eu-v2.convertapi.com/convert/pdf/to/jpg?auth=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      let errorMessage = `ConvertAPI request failed: ${response.statusText}`;

      try {
        const errorBody = (await response.json()) as ConvertAPIError;
        if (errorBody.Message) {
          errorMessage += ` - ${errorBody.Message}`;
        }
      } catch {
        // If we can't parse the error JSON, just use the status text
      }

      throw new Error(errorMessage);
    }

    const result = (await response.json()) as ConvertAPIResponse;

    if (!result.Files || !Array.isArray(result.Files) || result.Files.length === 0) {
      throw new Error('No images were generated from the PDF');
    }

    const images = await Promise.all(
      result.Files.map(async (file, index) => {
        try {
          const imageResponse = await fetch(file.Url);

          if (!imageResponse.ok) {
            throw new Error(
              `Failed to fetch image ${index + 1}: ${imageResponse.statusText}`,
            );
          }

          const imageBuffer = await imageResponse.arrayBuffer();

          return await sharp(Buffer.from(imageBuffer))
            .resize(1024, 1024, {
              fit: 'inside',
              withoutEnlargement: true,
              position: 'center',
            })
            .jpeg({
              quality: 80,
              progressive: true,
              force: false, // Don't force JPEG if input is PNG
            })
            .toBuffer();
          // eslint-disable-next-line
        } catch (error: any) {
          console.error(`Error processing image ${index + 1}:`, error);
          throw new Error(`Failed to process image ${index + 1}: ${error.message}`);
        }
      }),
    );

    return images;

    // eslint-disable-next-line
  } catch (error: any) {
    // Log the full error for debugging
    console.error('PDF conversion error:', error);

    if (error.message.includes('413')) {
      throw new Error('PDF file is too large. Please try a smaller file.');
    } else if (error.message.includes('429')) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      throw new Error('Authentication failed. Please check your API key.');
    } else {
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }
}
