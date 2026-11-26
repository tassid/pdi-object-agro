/* Gera o .pptx no navegador, a partir dos mesmos slides do site, no tema da Aula 5. */
import type React from 'react'
import type { DeckSlide, Ponto } from './curso'
import { fig, textoDe } from './curso'

const MARROM = '775F55', LARANJA = 'DD8047', AZUL = '94B6D2', CREME = 'EBDDC3'
const FONTE = 'Gill Sans MT'
const W = 13.333, H = 7.5

/** LaTeX simples → texto legível no PowerPoint */
function texSimples(t: string) {
  let s = t
  for (let i = 0; i < 4; i++) s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
  return s
    .replace(/\\(text|mathrm|mathbf|operatorname)\{([^{}]*)\}/g, '$2')
    .replace(/\\(cdot)/g, '·').replace(/\\(geq|ge)/g, '≥').replace(/\\(leq|le)/g, '≤').replace(/\\(times)/g, '×')
    .replace(/\\(cap)/g, '∩').replace(/\\(cup)/g, '∪').replace(/\\(eta)/g, 'η').replace(/\\(nabla)/g, '∇').replace(/\\(lambda)/g, 'λ')
    .replace(/\\(top)/g, 'ᵀ').replace(/\\(hat)\s*/g, '').replace(/\\(qquad|quad|;|,|!)/g, ' ').replace(/\\(left|right|bigl|bigr)/g, '')
    .replace(/[{}]/g, '').replace(/_([a-zA-Z0-9]+)/g, '$1').replace(/\s+/g, ' ').trim()
}

function tamanho(url: string): Promise<[number, number]> {
  return new Promise((ok) => {
    const im = new Image()
    im.onload = () => ok([im.naturalWidth, im.naturalHeight])
    im.onerror = () => ok([4, 3])
    im.src = url
  })
}

function caber(iw: number, ih: number, bw: number, bh: number) {
  const r = Math.min(bw / iw, bh / ih)
  return { w: iw * r, h: ih * r }
}

export async function baixarPptx(slides: DeckSlide[], titulo: string, comNotas: boolean, nomeArquivo: string, aoAvancar?: (i: number, n: number) => void) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = titulo
  pptx.author = 'Tassiane Anzolin'
  const absoluta = (n: string) => new URL(fig(n), location.href).href

  for (let i = 0; i < slides.length; i++) {
    aoAvancar?.(i, slides.length)
    const d = slides[i]
    const sl = pptx.addSlide()
    sl.background = { color: 'FFFFFF' }
    const notas = d.kind === 'conteudo' ? d.s.notas : d.notas
    if (comNotas && notas) sl.addNotes(notas)

    if (d.kind === 'capa' || d.kind === 'secao') {
      sl.addShape('rect', { x: 0, y: 0, w: W, h: H * 0.875, fill: { color: MARROM }, line: { color: MARROM } })
      sl.addShape('rect', { x: 0, y: H * 0.89, w: W * 0.245, h: H * 0.1, fill: { color: LARANJA }, line: { color: LARANJA } })
      sl.addShape('rect', { x: W * 0.257, y: H * 0.89, w: W * 0.743, h: H * 0.1, fill: { color: AZUL }, line: { color: AZUL } })
      if (d.kind === 'secao' && d.kicker) sl.addText(d.kicker, { x: 1.1, y: 1.9, w: 11, h: 0.5, fontFace: FONTE, fontSize: 18, bold: true, color: LARANJA })
      sl.addText(d.kind === 'capa' ? d.titulo.toUpperCase() : d.titulo, {
        x: 1.1, y: 2.3, w: 11, h: 2.4, fontFace: FONTE, fontSize: d.kind === 'capa' ? 40 : 36, bold: true, color: CREME, valign: 'top',
      })
      if (d.sub) sl.addText(d.sub, { x: 1.1, y: 4.8, w: 11, h: 0.8, fontFace: FONTE, fontSize: 18, color: CREME })
      sl.addText(d.kind === 'capa' ? d.rodape : titulo, { x: W * 0.27, y: H * 0.89, w: W * 0.71, h: H * 0.1, fontFace: FONTE, fontSize: 16, color: 'FFFFFF', align: 'right' })
      continue
    }

    const s = d.s
    sl.addText(s.titulo, { x: 1.05, y: 0.25, w: 11.8, h: 1.1, fontFace: FONTE, fontSize: 34, color: MARROM, valign: 'bottom', fit: 'shrink' })
    sl.addShape('rect', { x: 0, y: 1.43, w: 0.79, h: 0.23, fill: { color: LARANJA }, line: { color: LARANJA } })
    sl.addText(String(i + 1), { x: 0, y: 1.4, w: 0.79, h: 0.29, fontFace: 'Times New Roman', fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' })
    sl.addShape('rect', { x: 0.87, y: 1.43, w: W - 0.87, h: 0.23, fill: { color: AZUL }, line: { color: AZUL } })
    sl.addText(titulo, { x: 1.05, y: H - 0.45, w: 6, h: 0.3, fontFace: FONTE, fontSize: 9, color: '888888' })
    if (d.secao) sl.addText(d.secao, { x: 6.8, y: H - 0.45, w: 6, h: 0.3, fontFace: FONTE, fontSize: 9, color: '888888', align: 'right' })

    const temTexto = !!(s.pontos?.length || s.tex || s.formula)
    let iw = 4, ih = 3
    if (s.img) [iw, ih] = await tamanho(absoluta(s.img))
    const largo = !!s.img && temTexto && iw / ih > 1.9
    const topo = 1.95, base = H - 0.55

    // parágrafos do texto
    const paras: { t: string; nivel: number; formula?: boolean }[] = []
    const formula = s.tex ? texSimples(s.tex) : s.formula ? textoDe(s.formula) : ''
    if (formula) paras.push({ t: formula, nivel: 0, formula: true })
    ;(s.pontos ?? []).forEach((p: Ponto) => {
      if (Array.isArray(p)) {
        paras.push({ t: textoDe(p[0] as React.ReactNode), nivel: 0 })
        ;(p[1] as React.ReactNode[]).forEach((q) => paras.push({ t: textoDe(q), nivel: 1 }))
      } else paras.push({ t: textoDe(p as React.ReactNode), nivel: 0 })
    })
    // altura que o texto ocupa com fonte fs numa caixa de largura w (polegadas)
    const altura = (fs: number, w: number) =>
      paras.reduce((a, q) => {
        const porLinha = Math.max(10, Math.floor(((w - 0.4 - q.nivel * 0.3) * 72) / (fs * 0.5)))
        return a + Math.ceil(Math.max(1, q.t.length) / porLinha) * ((fs * 1.2) / 72) + 0.09
      }, 0.1)

    let tx = 1.05, tw = 11.8, th = base - topo
    let ix = 1.05, iy = topo, ibw = 11.8, ibh = base - topo - 0.35
    if (s.img && temTexto && !largo) { tw = 6.1; ix = 7.35; ibw = 5.6 }
    let fs = 20
    if (largo) {
      fs = 18
      while (fs > 12 && altura(fs, tw) > 2.4) fs--
      th = Math.min(2.6, altura(fs, tw) + 0.1)
      iy = topo + th + 0.1; ibh = base - iy - 0.35
    } else {
      while (fs > 11 && altura(fs, tw) > th) fs--
    }

    if (temTexto) {
      const runs = paras.map((q) => ({
        text: q.t,
        options: q.formula
          ? { fontFace: 'Cambria Math', fontSize: fs, color: '222222', breakLine: true, paraSpaceAfter: 6 }
          : q.nivel === 0
            ? { bullet: { code: '25A1' }, fontSize: fs, color: '222222', breakLine: true }
            : { bullet: { code: '25A3' }, indentLevel: 1, fontSize: Math.max(10, fs - 2), color: '333333', breakLine: true },
      }))
      sl.addText(runs, { x: tx, y: topo, w: tw, h: th, fontFace: FONTE, valign: 'top', paraSpaceAfter: 4 })
    }
    if (s.img) {
      const t = caber(iw, ih, ibw, ibh)
      const x = largo || !temTexto ? ix + (ibw - t.w) / 2 : ix
      sl.addImage({ path: absoluta(s.img), x, y: iy, w: t.w, h: t.h })
      if (s.legenda) sl.addText(s.legenda, { x: ix, y: iy + t.h + 0.03, w: ibw, h: 0.32, fontFace: FONTE, fontSize: s.legenda.length > 120 ? 8 : 10, color: '777777' })
    }
  }
  await pptx.writeFile({ fileName: nomeArquivo })
}
