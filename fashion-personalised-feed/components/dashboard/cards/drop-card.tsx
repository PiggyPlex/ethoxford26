import { Card, CardContent } from "@/components/ui/card"
import { CardActions } from "@/components/dashboard/card-actions"
import { BrandLogo } from "@/components/shared/brand-logo"
import { cn } from "@/lib/utils"

interface DropCardProps {
  compact?: boolean
}

export function DropCard({ compact = false }: DropCardProps) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]", compact && "shadow-none")}>
      {/* Cinematic lookbook hero — 16:9 */}
      <div className={cn("relative overflow-hidden bg-neutral-900", compact ? "aspect-[4/3]" : "aspect-[16/9]")}>
        <img
          src="https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png"
          alt="Stüssy Spring 2025"
          className="h-full w-full object-cover opacity-80"
        />
        {/* Dark gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        {/* Brand logo — top-left */}
        {!compact && (
          <div className="absolute left-4 top-4">
            <BrandLogo
              logoUrl="https://img.logo.dev/stussy.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw"
              brandName="Stüssy"
              size="md"
              overlay
            />
          </div>
        )}
        {/* Collection text — bottom-left */}
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
            Stüssy
          </p>
          <h3 className="text-[15px] font-bold text-white leading-snug mt-0.5">
            Spring 2025 Collection
          </h3>
          <p className="text-[12px] text-white/70 mt-0.5">
            Friday, 10:00 AM
          </p>
        </div>
      </div>

      <CardContent className={cn("flex flex-col gap-3", compact ? "p-3 gap-2" : "p-4")}>
        {/* Compact: show title below */}
        {compact && (
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Stüssy</p>
            <h3 className="text-sm font-medium text-neutral-900 leading-snug">
              Spring 2025 Collection
            </h3>
          </div>
        )}

        {/* Preview thumbnail strip */}
        <div className="flex gap-1.5">
          {[
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
          ].map((url, i) => (
            <div key={i} className={cn("flex-1 overflow-hidden rounded-lg bg-neutral-100", compact ? "h-12" : "h-20")}>
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <CardActions
          compact={compact}
          actions={[
            { label: "Shop Collection" },
            { label: "Remind Me", variant: "outline" },
            { label: "Not Interested", variant: "ghost" },
          ]}
        />
      </CardContent>
    </Card>
  )
}
