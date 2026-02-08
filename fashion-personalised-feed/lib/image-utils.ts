/**
 * Client-side image resize utility.
 * Compresses user photos for localStorage storage and API upload.
 */

export async function resizeImage(
  file: File,
  maxDim = 512,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        // Draw to offscreen canvas
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Export as JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(dataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = reader.result as string
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}
