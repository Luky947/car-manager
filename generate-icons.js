import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const makeSvg = (size) => {
  const r = Math.round(size * 0.225)
  const fs = Math.round(size * 0.52)
  const y = Math.round(size * 0.70)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6c63ff"/>
      <stop offset="100%" stop-color="#4f9eff"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
  <text x="${size / 2}" y="${y}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fs}"
    font-weight="700"
    fill="white"
    text-anchor="middle">C</text>
</svg>`
}

const sizes = [
  [192, 'public/icon-192.png'],
  [512, 'public/icon-512.png'],
  [180, 'public/apple-touch-icon.png'],
]

let resvg
try {
  const mod = await import('@resvg/resvg-js')
  resvg = mod.Resvg
} catch {
  console.log('Note: @resvg/resvg-js not found, writing SVG placeholders as PNG metadata.')
  for (const [size, out] of sizes) {
    const svgContent = makeSvg(size)
    writeFileSync(join(__dirname, out.replace('.png', '.svg')), svgContent)
    console.log(`Wrote ${out.replace('.png', '.svg')}`)
  }
  process.exit(0)
}

for (const [size, out] of sizes) {
  const svg = makeSvg(size)
  const instance = new resvg(svg, { fitTo: { mode: 'width', value: size } })
  const rendered = instance.render()
  const png = rendered.asPng()
  writeFileSync(join(__dirname, out), png)
  console.log(`Generated ${out} (${size}x${size})`)
}
