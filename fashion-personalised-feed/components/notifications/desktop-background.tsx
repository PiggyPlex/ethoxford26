"use client"

export function DesktopBackground({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 30%, #BFDBFE 60%, #93C5FD 100%)",
      }}
    >
      {/* Subtle decorative circles */}
      <div
        className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-32 right-40 w-96 h-96 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
        }}
      />

      {/* Dim overlay */}
      {dimmed && (
        <div className="absolute inset-0 bg-foreground/10 transition-opacity duration-300" />
      )}
    </div>
  )
}
