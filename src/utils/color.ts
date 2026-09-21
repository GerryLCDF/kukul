export function alpha(hex: string, opacity: number): string {
  const c = /^#?([a-f\d]{6})$/i.exec(hex.trim())
  if (!c) return hex
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 100)
  return `color-mix(in srgb, ${hex} ${a}%, transparent)`
}

export function grad135(primary: string, accent: string, flat?: boolean) {
  return flat ? primary : `linear-gradient(135deg, ${primary}, ${accent})`
}

export function grad90(primary: string, accent: string, flat?: boolean) {
  return flat ? primary : `linear-gradient(90deg, ${primary}, ${accent})`
}

export function grad180(accent: string, primary: string, flat?: boolean) {
  return flat ? primary : `linear-gradient(180deg, ${accent}, ${primary})`
}