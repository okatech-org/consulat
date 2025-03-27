# Image Cropper for User Documents

This feature allows users to crop and resize images before uploading them, providing a better user experience especially for profile pictures and other images that require specific aspect ratios.

## Features

- Circular cropping (perfect for profile pictures)
- Custom aspect ratio support (16:9, 4:3, etc.)
- Image zoom functionality
- Outputs PNG format for consistency
- Mobile-friendly

## Usage

The image cropping functionality is integrated into the `UserDocument` component. To enable it, simply set the `enableEditor` prop to `true`.

```tsx
<UserDocument
  label="Profile Picture"
  description="Upload a profile picture"
  expectedType={DocumentType.IDENTITY_PHOTO}
  userId="user-id"
  enableEditor={true}
  aspectRatio="1:1" // Optional: defaults to 1:1
/>
```

### Props

| Prop           | Type    | Default | Description                                         |
| -------------- | ------- | ------- | --------------------------------------------------- |
| `enableEditor` | boolean | `false` | Enable the image cropper functionality              |
| `aspectRatio`  | string  | `"1"`   | Aspect ratio in format "width:height" (e.g. "16:9") |

## How It Works

1. When a user selects an image file and `enableEditor` is enabled, a cropping dialog appears
2. The user can drag, zoom, and reposition the image inside the crop area
3. When the user clicks "Apply", the image is cropped according to the selected area
4. The cropped image is converted to PNG format and uploaded
5. The original upload process continues as normal with the cropped image

## Notes

- The cropper only activates for image files. PDFs and other non-image files will upload directly.
- The cropper uses a circular mask by default, which is ideal for profile pictures.
- The cropped image is always saved as a PNG for consistent quality.

## Example

See `docs/examples/image-cropper-example.tsx` for a complete usage example.
