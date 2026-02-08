"use client"

import { useRef } from "react"
import { Camera } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { resizeImage } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  currentPhotoUrl?: string
  onPhotoChange: (dataUrl: string) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE_MAP = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
} as const

const ICON_MAP = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
} as const

export function PhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
  size = "md",
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[PhotoUpload] No file selected")
      return
    }

    console.log(`[PhotoUpload] Processing image: ${file.name}, size: ${file.size} bytes`)

    try {
      const dataUrl = await resizeImage(file, 512, 0.8)
      console.log(`[PhotoUpload] Image processed successfully, data URL length: ${dataUrl.length}`)
      onPhotoChange(dataUrl)
    } catch (err) {
      console.error("[PhotoUpload] Failed to process image:", err)
    }

    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 rounded-full"
      >
        <Avatar className={cn(SIZE_MAP[size], "border-2 border-neutral-200 transition-all group-hover:border-neutral-400")}>
          {currentPhotoUrl ? (
            <AvatarImage src={currentPhotoUrl} alt="Your photo" />
          ) : null}
          <AvatarFallback className="bg-neutral-100">
            <Camera className={cn(ICON_MAP[size], "text-neutral-400")} />
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100",
          currentPhotoUrl ? "" : "group-hover:opacity-0"
        )}>
          <Camera className="h-5 w-5 text-white" />
        </div>

        {/* Label */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100">
          {currentPhotoUrl ? "Change" : "Add photo"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
