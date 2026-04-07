/**
 * Prefix for static files in /public/assets (copied to dist as-is).
 * Required on GitHub Pages where the app lives under import.meta.env.BASE_URL.
 */
export function assetUrl(path) {
    const base = import.meta.env.BASE_URL || "/"
    const p = path.replace(/^\//, "")
    return base.endsWith("/") ? `${base}${p}` : `${base}/${p}`
}
