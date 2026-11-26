import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Maximize2, MonitorPlay, StickyNote, X } from 'lucide-react'
import { Quiz, type Q } from './ui'

/* =====================================================================
   modo de visualização: aluno (/) ou professor (/professor/)
   ===================================================================== */

export type Modo = 'aluno' | 'professor'
export const ModoCtx = createContext<Modo>('aluno')
export const useModo = () => useContext(ModoCtx)
export const ehProfessor = () => /\/professor\/?$/.test(location.pathname.replace(/index\.html$/, ''))

const BASE = import.meta.env.BASE_URL
/** figura gerada (public/fig/x.jpg) ou print de trabalho (public/artigos/x.jpg) */
export const fig = (n: string) => (n.includes('/') ? `${BASE}${n}.jpg` : `${BASE}fig/${n}.jpg`)

/* =====================================================================
   modelo
   ===================================================================== */

export type Ponto = React.ReactNode | [React.ReactNode, React.ReactNode[]]

export type SlideSpec = {
  titulo: string
  img?: string
  legenda?: string
  pontos?: Ponto[]
  tex?: string // fórmula em LaTeX
  formula?: React.ReactNode
  notas?: string // só na visão do professor
}

export type Prof = {
  roteiro: [string, string][] // [tempo, o que fazer]
  perguntas?: React.ReactNode[]
  erros?: React.ReactNode[]
  materiais?: React.ReactNode[]
}

export type Bloco = {
  id: string
  cod: string
  titulo: string
  min: number
  tipo: 'conceito' | 'lab' | 'leitura'
  slides: SlideSpec[]
  teoria: React.ReactNode
  exemplo: React.ReactNode
  pratica: React.ReactNode
  exercicios?: Ex[]
  prof?: Prof
}

export type Ex = { q: React.ReactNode; r: React.ReactNode; nivel?: 'básico' | 'médio' | 'desafio' }
export type Artigo = { ref: string; link: string; tag: string; porque: string; br?: boolean; perguntas?: string[] }

export type Aula = {
  id: string
  n: number
  titulo: string
  ideia: string
  chips: string[]
  objetivos: string[]
  encontros: { n: number; titulo: string; inicio: string }[] // bloco em que cada encontro começa
  intervalos: string[] // blocos depois dos quais há intervalo de 20 min
  blocos: Bloco[]
  quiz: Q[]
  artigos: Artigo[]
  notebooks: { nome: string; arquivo: string; descricao: string }[]
  entregas: React.ReactNode[]
  limitacoes: React.ReactNode[]
  referencias: string[]
  prof: { preparo: React.ReactNode[]; planoB: React.ReactNode[]; avaliacao?: React.ReactNode }
}

/* =====================================================================
   tipografia matemática e ambientes à LaTeX
   ===================================================================== */

export function M({ t }: { t: string }) {
  const h = useMemo(() => katex.renderToString(t, { throwOnError: false }), [t])
  return <span dangerouslySetInnerHTML={{ __html: h }} />
}

export function MM({ t, n }: { t: string; n?: number | string }) {
  const h = useMemo(() => katex.renderToString(t, { throwOnError: false, displayMode: true }), [t])
  return (
    <div className="eq">
      <div dangerouslySetInnerHTML={{ __html: h }} />
      {n !== undefined && <span className="eq-n">({n})</span>}
    </div>
  )
}

const THM = { def: 'Definição', prop: 'Proposição', ex: 'Exemplo', obs: 'Observação' }
export function Thm({ k, n, nome, children }: { k: keyof typeof THM; n?: string; nome?: string; children: React.ReactNode }) {
  return (
    <div className={`thm ${k}`}>
      <span className="thm-h">
        {THM[k]}
        {n ? ` ${n}` : ''}
        {nome && <i> ({nome})</i>}.{' '}
      </span>
      <div className="thm-b">{children}</div>
    </div>
  )
}

export function Fig({ n, cap, w }: { n: string; cap: React.ReactNode; w?: number }) {
  return (
    <figure className="fig-real" style={w ? { maxWidth: w } : undefined}>
      <a href={fig(n)} target="_blank" rel="noreferrer" title="abrir em tamanho real">
        <img src={fig(n)} alt={typeof cap === 'string' ? cap : n} loading="lazy" />
      </a>
      <figcaption>{cap}</figcaption>
    </figure>
  )
}

/* =====================================================================
   trabalhos da UTFPR com prints do PDF
   ===================================================================== */

export type TrabalhoSpec = {
  id: string // número do handle no RIUT; os prints ficam em public/artigos/<id>_*.jpg
  titulo: string
  autor: string
  tipo: string
  onde: string
  ano: number
  orientacao: string
  pdf: string
  prints: { p: string; cap: string }[]
  resumo: React.ReactNode
  discutir?: React.ReactNode[]
}

export function Trabalho({ t }: { t: TrabalhoSpec }) {
  const handle = `https://repositorio.utfpr.edu.br/jspui/handle/1/${t.id}`
  return (
    <article className="trab" id={`trab-${t.id}`}>
      <div className="trab-top">
        <a href={t.pdf} target="_blank" rel="noreferrer" title="abrir o PDF no RIUT">
          <img className="trab-capa" src={fig(`artigos/${t.id}_capa`)} alt={`folha de rosto: ${t.titulo}`} loading="lazy" />
        </a>
        <div>
          <h3>{t.titulo}</h3>
          <p className="ref">
            {t.autor}. {t.tipo}, {t.onde}, {t.ano}. Orientação: {t.orientacao}.
          </p>
          <p className="ref">
            <a href={handle} target="_blank" rel="noreferrer">registro no RIUT <ExternalLink size={12} /></a> ·{' '}
            <a href={t.pdf} target="_blank" rel="noreferrer">PDF <ExternalLink size={12} /></a>
          </p>
          <div className="prose" style={{ marginTop: 8, fontSize: '0.95rem' }}>{t.resumo}</div>
        </div>
      </div>
      <div className="trab-prints">
        {t.prints.map((p) => (
          <figure key={p.p}>
            <a href={fig(`artigos/${t.id}_${p.p}`)} target="_blank" rel="noreferrer">
              <img src={fig(`artigos/${t.id}_${p.p}`)} alt={p.cap} loading="lazy" />
            </a>
            <figcaption>{p.cap} Reprodução de {t.autor.split(',')[0]} ({t.ano}), {p.p.replace('p', 'p. ')}.</figcaption>
          </figure>
        ))}
      </div>
      {t.discutir && (
        <>
          <p style={{ marginTop: 10, fontWeight: 700, fontSize: '0.95rem' }}>Questões para a leitura crítica</p>
          <ol className="trab-q">{t.discutir.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </>
      )}
    </article>
  )
}

/* =====================================================================
   teoria → exemplos → prática
   ===================================================================== */

const ETAPA = { teoria: 'Teoria', exemplo: 'Exemplos', pratica: 'Prática' }

function Etapa({ k, cod, i, children }: { k: keyof typeof ETAPA; cod: string; i: number; children: React.ReactNode }) {
  return (
    <div className={`etapa etapa-${k}`}>
      <h3 className="etapa-t">
        <span className="etapa-n">{cod}.{i}</span> {ETAPA[k]}
      </h3>
      <div className="prose etapa-body">{children}</div>
    </div>
  )
}

export function Exercicios({ itens }: { itens: Ex[] }) {
  const prof = useModo() === 'professor'
  const [abertos, setAbertos] = useState<Set<number>>(new Set())
  const alterna = (i: number) => setAbertos((a) => { const n = new Set(a); if (n.has(i)) n.delete(i); else n.add(i); return n })
  return (
    <div className="exs">
      <p className="exs-t">Exercícios</p>
      <ol>
        {itens.map((e, i) => (
          <li key={i}>
            {e.nivel && <span className="ex-nivel">{e.nivel}</span>}
            <div className="ex-q">{e.q}</div>
            {!prof && <button className="btn ghost ex-btn" onClick={() => alterna(i)}>{abertos.has(i) ? 'esconder solução' : 'ver solução'}</button>}
            {(prof || abertos.has(i)) && <div className="ex-r">{e.r}</div>}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* =====================================================================
   SLIDES
   ===================================================================== */

type DeckSlide =
  | { kind: 'capa'; titulo: string; sub?: string; rodape: string; notas?: string }
  | { kind: 'secao'; kicker: string; titulo: string; sub?: string; notas?: string }
  | { kind: 'conteudo'; s: SlideSpec; secao?: string }

function Pontos({ pts }: { pts: Ponto[] }) {
  return (
    <ul className="s-list">
      {pts.map((p, i) =>
        Array.isArray(p) ? (
          <li key={i}>
            {p[0]}
            <ul>{(p[1] as React.ReactNode[]).map((q, j) => <li key={j}>{q}</li>)}</ul>
          </li>
        ) : (
          <li key={i}>{p}</li>
        ),
      )}
    </ul>
  )
}

export function SlideView({ d, n, rodape }: { d: DeckSlide; n: number; rodape?: string }) {
  if (d.kind === 'capa' || d.kind === 'secao')
    return (
      <div className={`slide capa ${d.kind === 'secao' ? 'secao' : ''}`}>
        <div className="c-top">
          {d.kind === 'secao' && <p className="kicker">{d.kicker}</p>}
          <h2>{d.titulo}</h2>
          {d.sub && <p>{d.sub}</p>}
        </div>
        <div className="c-bot">
          <div className="o" />
          <div className="b">{d.kind === 'capa' ? d.rodape : rodape}</div>
        </div>
      </div>
    )
  return <SlideConteudo s={d.s} n={n} rodape={rodape} secao={d.secao} />
}

const aspectos: Record<string, number> = {}

/** reduz a fonte (em cqw) até o conteúdo caber na caixa, como o "shrink" do Beamer */
function useCaber(ref: React.RefObject<HTMLElement | null>, base: number, min: number, deps: unknown[], pelaFilha = false) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ajustar = () => {
      if (!el.clientWidth) return
      let f = base
      el.style.fontSize = `${f}cqw`
      const alvo = pelaFilha ? ((el.firstElementChild as HTMLElement | null) ?? el) : el
      const estoura = () =>
        alvo === el
          ? el.scrollHeight > el.clientHeight + 3
          : alvo.getBoundingClientRect().height > el.getBoundingClientRect().height + 2 || alvo.scrollWidth > el.clientWidth + 2
      while (f > min && estoura()) {
        f = Math.max(min, f - 0.1)
        el.style.fontSize = `${f}cqw`
      }
    }
    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(el)
    document.fonts?.ready.then(ajustar)
    el.querySelectorAll('img').forEach((i) => i.addEventListener('load', ajustar))
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function SlideConteudo({ s, n, rodape, secao }: { s: SlideSpec; n: number; rodape?: string; secao?: string }) {
  const [asp, setAsp] = useState(() => (s.img ? aspectos[s.img] ?? 1.5 : 1.5))
  const temTexto = !!(s.pontos?.length || s.tex || s.formula)
  const largo = !!s.img && temTexto && asp > 1.9
  const tRef = useRef<HTMLDivElement>(null)
  const bRef = useRef<HTMLDivElement>(null)
  useCaber(tRef, 5.2, 2.6, [s.titulo], true)
  useCaber(bRef, 2.35, 1.3, [s, largo])
  return (
    <div className="slide">
      <div className="s-title" ref={tRef}><span>{s.titulo}</span></div>
      <div className="s-bar"><span className="s-num">{n}</span><span className="s-rule" /></div>
      <div className="s-body" ref={bRef}>
        <div className={`s-grid ${!s.img ? 'only-text' : !temTexto ? 'only-img' : largo ? 'wide' : ''}`}>
          {temTexto && (
            <div>
              {s.tex && <div className="s-formula"><M t={s.tex} /></div>}
              {s.formula && <div className="s-formula">{s.formula}</div>}
              {s.pontos && <Pontos pts={s.pontos} />}
            </div>
          )}
          {s.img && (
            <figure className="s-fig">
              <img src={fig(s.img)} alt={s.legenda ?? s.titulo} onLoad={(e) => { const r = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight; aspectos[s.img!] = r; if (Math.abs(r - asp) > 0.01) setAsp(r) }} />
              {s.legenda && <figcaption>{s.legenda}</figcaption>}
            </figure>
          )}
        </div>
      </div>
      <div className="s-foot"><span>{rodape}</span><span>{secao}</span></div>
    </div>
  )
}

/** número do encontro a que o bloco pertence */
export function encontroDe(aula: Aula, id: string) {
  const idx = aula.blocos.findIndex((b) => b.id === id)
  let n = 1
  aula.encontros.forEach((e) => { if (aula.blocos.findIndex((b) => b.id === e.inicio) <= idx) n = e.n })
  return n
}

const notasDe = (d: DeckSlide) => (d.kind === 'conteudo' ? d.s.notas : d.notas)

export function buildDeck(aula: Aula): { slides: DeckSlide[]; inicio: Record<string, number> } {
  const slides: DeckSlide[] = []
  const inicio: Record<string, number> = {}
  slides.push({ kind: 'capa', titulo: aula.titulo, sub: `2 encontros de 5 horas · continuação da Aula 5 (Reconhecimento de Padrões)`, rodape: 'Processamento de Imagens Aplicado à Agroindústria', notas: 'Abrir com a pergunta que fecha a Aula 5: como passar de classificar um objeto isolado para encontrar e contar vários objetos numa imagem de campo?' })
  const partes = <T,>(xs: T[], n: number) => { const k = Math.ceil(xs.length / n); const t = Math.ceil(xs.length / k); return Array.from({ length: k }, (_, i) => xs.slice(i * t, (i + 1) * t)) }
  partes(aula.objetivos, 4).forEach((g, i, all) =>
    slides.push({ kind: 'conteudo', s: { titulo: all.length > 1 ? `Objetivos (${i + 1}/${all.length})` : 'Objetivos', pontos: g.map((o) => o.replace(/\.$/, '')), notas: 'Ler os objetivos em voz alta e indicar em qual bloco cada um é avaliado.' } }))
  aula.blocos.forEach((b) => {
    const enc = aula.encontros.find((e) => e.inicio === b.id)
    if (enc) slides.push({ kind: 'secao', kicker: `Encontro ${enc.n} de ${aula.encontros.length} · 300 min`, titulo: enc.titulo, sub: 'Processamento de Imagens Aplicado à Agroindústria' })
    inicio[b.id] = slides.length
    slides.push({ kind: 'secao', kicker: `Bloco ${b.cod} · ${b.min} min`, titulo: b.titulo, sub: 'teoria → exemplos → prática', notas: b.prof?.roteiro.map((r) => `${r[0]}: ${r[1]}`).join(' · ') })
    b.slides.forEach((s) => slides.push({ kind: 'conteudo', s, secao: `${b.cod} ${b.titulo}` }))
    if (aula.intervalos.includes(b.id)) slides.push({ kind: 'secao', kicker: 'Intervalo', titulo: '20 minutos', sub: encontroDe(aula, b.id) === 2 ? 'O treinamento continua em execução na GPU.' : 'Conferir se todos têm acesso ao CVAT e ao Colab.' })
  })
  partes(aula.artigos, 6).forEach((g, i, all) =>
    slides.push({ kind: 'conteudo', s: { titulo: all.length > 1 ? `Leituras (${i + 1}/${all.length})` : 'Leituras', pontos: g.map((a) => <><b>{a.tag}</b>: {a.ref.length > 120 ? a.ref.slice(0, 118) + '…' : a.ref}</>) } }))
  return { slides, inicio }
}

/** emulador de slides embutido: tela 16:9, tira de miniaturas e notas (professor) */
export function Emulador({ slides, rodape, inicio = 0, primeiro = 0, onPresent }: { slides: DeckSlide[]; rodape: string; inicio?: number; primeiro?: number; onPresent: (i: number) => void }) {
  const prof = useModo() === 'professor'
  const [i, setI] = useState(primeiro)
  const [thumbs, setThumbs] = useState(false)
  const scr = useRef<HTMLDivElement>(null)
  const go = (k: number) => setI(Math.max(0, Math.min(slides.length - 1, k)))
  const notas = notasDe(slides[i])
  return (
    <div className="emu">
      <div
        className="emu-screen"
        ref={scr}
        tabIndex={0}
        aria-label={`slide ${i + 1} de ${slides.length}; use as setas para navegar`}
        onKeyDown={(e) => {
          if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(i + 1) }
          if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1) }
          if (e.key === 'f' || e.key === 'F') onPresent(inicio + i)
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          go(e.clientX - r.left > r.width / 3 ? i + 1 : i - 1)
        }}
      >
        <SlideView d={slides[i]} n={inicio + i + 1} rodape={rodape} />
      </div>
      <div className="emu-bar">
        <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="slide anterior"><ChevronLeft size={16} /></button>
        <button onClick={() => go(i + 1)} disabled={i === slides.length - 1} aria-label="próximo slide"><ChevronRight size={16} /></button>
        <span className="t">{i + 1} / {slides.length}</span>
        <span className="grow" />
        <button onClick={() => setThumbs((t) => !t)} aria-pressed={thumbs}>miniaturas</button>
        <button onClick={() => onPresent(inicio + i)}><MonitorPlay size={15} /> apresentar</button>
      </div>
      {thumbs && (
        <div className="emu-strip">
          {slides.map((d, k) => (
            <button key={k} className={`emu-thumb ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`ir ao slide ${k + 1}`}>
              <SlideView d={d} n={inicio + k + 1} rodape={rodape} />
            </button>
          ))}
        </div>
      )}
      {prof && notas && (
        <div className="emu-notes"><b><StickyNote size={13} /> Notas:</b> {notas}</div>
      )}
    </div>
  )
}

function useRelogio() {
  const [t0] = useState(() => Date.now())
  const [, tick] = useState(0)
  useEffect(() => { const h = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(h) }, [])
  const s = Math.floor((Date.now() - t0) / 1000)
  return `${String(Math.floor(s / 3600))}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** modo apresentação em tela cheia; na visão do professor mostra notas, próximo slide e cronômetro */
export function SlideDeck({ aula, start = 0, onClose }: { aula: Aula; start?: number; onClose: () => void }) {
  const prof = useModo() === 'professor'
  const { slides } = useMemo(() => buildDeck(aula), [aula])
  const [cur, setCur] = useState(start)
  const [presenter, setPresenter] = useState(prof)
  const relogio = useRelogio()
  const rodape = aula.titulo
  const prev = () => setCur((c) => Math.max(0, c - 1))
  const next = () => setCur((c) => Math.min(slides.length - 1, c + 1))
  const full = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) prev()
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next() }
      if (e.key === 'Escape') onClose()
      if (e.key === 'f' || e.key === 'F') full()
      if ((e.key === 'p' || e.key === 'P') && prof) setPresenter((p) => !p)
    }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const notas = notasDe(slides[cur])
  return (
    <div className={`deck ${presenter && prof ? 'presenter' : ''}`}>
      <div className="deck-stage">
        <SlideView d={slides[cur]} n={cur + 1} rodape={rodape} />
        {presenter && prof && (
          <aside className="presenter-side">
            <div className="timer">{relogio}<small>desde a abertura</small></div>
            <div className="notes">{notas ?? 'Sem notas para este slide.'}</div>
            {cur < slides.length - 1 && (
              <div className="nx"><p>Próximo</p><SlideView d={slides[cur + 1]} n={cur + 2} rodape={rodape} /></div>
            )}
          </aside>
        )}
      </div>
      <div className="deck-bar">
        <button onClick={onClose} title="Fechar (Esc)"><X size={18} /></button>
        <button onClick={full} title="Tela cheia (F)"><Maximize2 size={16} /></button>
        {prof && <button onClick={() => setPresenter((p) => !p)} title="Notas do apresentador (P)"><StickyNote size={16} /> notas</button>}
        <button onClick={prev} disabled={cur === 0}><ChevronLeft size={20} /></button>
        <span>{cur + 1} / {slides.length}</span>
        <button onClick={next} disabled={cur === slides.length - 1}><ChevronRight size={20} /></button>
      </div>
    </div>
  )
}

/* =====================================================================
   notas do professor por bloco
   ===================================================================== */

function ProfBloco({ b }: { b: Bloco }) {
  if (!b.prof) return null
  const p = b.prof
  return (
    <div className="prof-box">
      <h4>Roteiro docente do bloco {b.cod} ({b.min} min)</h4>
      <table className="tbl">
        <thead><tr><th style={{ width: '18%' }}>tempo</th><th>condução</th></tr></thead>
        <tbody>{p.roteiro.map(([t, o], i) => <tr key={i}><td>{t}</td><td>{o}</td></tr>)}</tbody>
      </table>
      {p.perguntas && (<><h5>Perguntas para a turma</h5><ol>{p.perguntas.map((q, i) => <li key={i}>{q}</li>)}</ol></>)}
      {p.erros && (<><h5>Dificuldades frequentes</h5><ul>{p.erros.map((q, i) => <li key={i}>{q}</li>)}</ul></>)}
      {p.materiais && (<><h5>Materiais</h5><ul>{p.materiais.map((q, i) => <li key={i}>{q}</li>)}</ul></>)}
    </div>
  )
}

/* =====================================================================
   cronograma
   ===================================================================== */

const COR = { conceito: '#ebddc3', lab: '#94b6d2', leitura: '#f0c4a4', pausa: 'repeating-linear-gradient(45deg,#fff 0 5px,#ddd 5px 10px)' }
const hm = (m: number) => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`

type Item = { t: string; cod: string; min: number; tipo: keyof typeof COR; id?: string; ini: number }

function itensDo(aula: Aula, enc: number) {
  const itens: Item[] = []
  let t0 = 0
  aula.blocos.filter((b) => encontroDe(aula, b.id) === enc).forEach((b) => {
    itens.push({ t: b.titulo, cod: b.cod, min: b.min, tipo: b.tipo, id: b.id, ini: t0 }); t0 += b.min
    if (aula.intervalos.includes(b.id)) { itens.push({ t: 'Intervalo', cod: '—', min: 20, tipo: 'pausa', ini: t0 }); t0 += 20 }
  })
  return { itens, total: t0 }
}

function Roteiro({ aula }: { aula: Aula }) {
  return <>{aula.encontros.map((e) => <RoteiroEnc key={e.n} aula={aula} enc={e.n} titulo={e.titulo} />)}</>
}

function RoteiroEnc({ aula, enc, titulo }: { aula: Aula; enc: number; titulo: string }) {
  const { itens, total } = itensDo(aula, enc)
  return (
    <div className="roteiro">
      <p className="roteiro-t"><b>Encontro {enc}.</b> {titulo}</p>
      <div className="roteiro-bar">
        {itens.map((s, i) => (
          <a key={i} href={s.id ? `#${s.id}` : undefined} style={{ flex: s.min, background: COR[s.tipo] }} title={`${hm(s.ini)}–${hm(s.ini + s.min)} · ${s.t}`}
            onClick={(e) => { if (s.id) { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) } }}>
            {s.cod !== '—' ? s.cod : ''} {s.min}′
          </a>
        ))}
      </div>
      <div className="roteiro-legend">
        <span>Total: {total} min</span>
        <span><i style={{ background: COR.conceito }} />conceito</span>
        <span><i style={{ background: COR.lab }} />laboratório</span>
        <span><i style={{ background: COR.leitura }} />leitura</span>
        <span><i style={{ background: COR.pausa }} />intervalo</span>
      </div>
    </div>
  )
}

function PlanoDocente({ aula }: { aula: Aula }) {
  return (
    <section className="sec" id="plano">
      <div className="sec-head"><span className="n">0</span><h2>Plano docente</h2><span className="min">visível só em /professor</span></div>
      <div className="prof-box" style={{ maxWidth: 'none' }}>
        {aula.encontros.map((e) => <TabelaEnc key={e.n} aula={aula} enc={e.n} titulo={e.titulo} />)}
        <h5>Preparação antes dos encontros</h5>
        <ol>{aula.prof.preparo.map((p, i) => <li key={i}>{p}</li>)}</ol>
        <h5>Plano B (sem GPU, sem internet ou com CVAT fora do ar)</h5>
        <ul>{aula.prof.planoB.map((p, i) => <li key={i}>{p}</li>)}</ul>
        {aula.prof.avaliacao}
      </div>
    </section>
  )
}

function TabelaEnc({ aula, enc, titulo }: { aula: Aula; enc: number; titulo: string }) {
  const { itens } = itensDo(aula, enc)
  return (
      <>
        <h4>Encontro {enc}: {titulo}</h4>
        <table className="tbl">
          <thead><tr><th>início</th><th>duração</th><th>bloco</th><th>conteúdo e estratégia</th></tr></thead>
          <tbody>
            {itens.map((s, i) => {
              const b = aula.blocos.find((x) => x.id === s.id)
              return (
                <tr key={i}>
                  <td>{hm(s.ini)}</td><td>{s.min} min</td><td>{s.cod}</td>
                  <td>{s.t}{b?.prof ? `. ${b.prof.roteiro.map((r) => r[1].split('.')[0]).slice(0, 3).join('; ')}.` : s.tipo === 'pausa' ? (enc === 2 ? '. O treino segue na GPU.' : '. Checagem dos acessos ao CVAT e ao Colab.') : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
  )
}

/* =====================================================================
   página da aula
   ===================================================================== */

export function AulaPage({ aula }: { aula: Aula }) {
  const prof = useModo() === 'professor'
  const [deck, setDeck] = useState<number | null>(null)
  const { slides, inicio } = useMemo(() => buildDeck(aula), [aula])
  const rodape = aula.titulo
  const extras: [string, string][] = [['artigos', 'Leituras'], ['quiz', 'Avaliação formativa'], ['entregas', 'Atividade avaliativa'], ['limitacoes', 'Pressupostos e limitações'], ['referencias', 'Referências']]
  const ids = [...(prof ? ['plano'] : []), 'slides', ...aula.blocos.map((b) => b.id), ...extras.map((e) => e[0])]
  const [on, setOn] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (v[0]) setOn(v[0].target.id)
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aula.id, prof])
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }
  const nbUrl = (a: string) => `https://colab.research.google.com/github/tassid/pdi-object-agro/blob/main/notebooks/${a}`
  const nExtra = Number(aula.blocos[aula.blocos.length - 1].cod) + 1
  return (
    <main className="page">
      {deck !== null && <SlideDeck aula={aula} start={deck} onClose={() => setDeck(null)} />}
      <div className="wrap">
        <header className="lesson-head">
          <h1>{aula.titulo}</h1>
          <p className="sub">2 encontros de 300 minutos, cada um com intervalo de 20 minutos · continuação da Aula 5{prof ? ' · visão do professor' : ''}</p>
          <div className="head-acts">
            <button className="btn-slides" onClick={() => setDeck(0)}><MonitorPlay size={16} /> Apresentar ({slides.length} slides)</button>
            {aula.encontros.map((e) => (
              <button key={e.n} className="btn ghost" onClick={() => setDeck(slides.findIndex((d) => d.kind === 'secao' && d.kicker.startsWith(`Encontro ${e.n} `)))}>Começar no encontro {e.n}</button>
            ))}
          </div>
          <div className="bigidea"><b>Resumo.</b> {aula.ideia}</div>
          <p className="chips"><b>Palavras-chave:</b> {aula.chips.join('; ')}.</p>
          <Roteiro aula={aula} />
          <div className="head-cols">
            <div>
              <p style={{ fontWeight: 700, marginBottom: 6 }}>Objetivos de aprendizagem</p>
              <p style={{ marginBottom: 6 }}>Ao final dos dois encontros, o estudante deverá ser capaz de:</p>
              <ol className="objs">{aula.objetivos.map((o) => <li key={o}>{o}</li>)}</ol>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {aula.notebooks.map((n) => (
                <a key={n.arquivo} className="nb-card" href={nbUrl(n.arquivo)} target="_blank" rel="noreferrer">
                  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Abrir no Colab" width={117} height={20} />
                  <b>{n.nome}</b>
                  <span>{n.descricao}</span>
                </a>
              ))}
            </div>
          </div>
        </header>
        <div className="lesson-grid">
          <nav className="toc" aria-label="Sumário da aula">
            <p className="toc-t">Sumário</p>
            <ol>
              {prof && <li><a href="#plano" onClick={go('plano')} className={on === 'plano' ? 'on' : ''}><span className="n">0</span><span>Plano docente</span></a></li>}
              <li><a href="#slides" onClick={go('slides')} className={on === 'slides' ? 'on' : ''}><span className="n">▸</span><span>Slides</span></a></li>
              {aula.blocos.map((b) => {
                const enc = aula.encontros.find((e) => e.inicio === b.id)
                return (
                  <React.Fragment key={b.id}>
                    {enc && <li className="toc-enc">Encontro {enc.n}</li>}
                    <li><a href={`#${b.id}`} onClick={go(b.id)} className={on === b.id ? 'on' : ''}><span className="n">{b.cod}</span><span>{b.titulo}</span></a></li>
                  </React.Fragment>
                )
              })}
              <li className="toc-enc">Fechamento</li>
              {extras.map(([id, t], i) => (
                <li key={id}><a href={`#${id}`} onClick={go(id)} className={on === id ? 'on' : ''}><span className="n">{nExtra + i}</span><span>{t}</span></a></li>
              ))}
            </ol>
          </nav>
          <div className="content">
            {prof && <PlanoDocente aula={aula} />}
            <section className="sec" id="slides">
              <div className="sec-head"><h2>Slides</h2><span className="min">{slides.length} slides</span></div>
              <p className="prose">
                Os slides abaixo reúnem os dois encontros. Clique na tela ou use as setas para avançar; <i>apresentar</i> abre o modo de tela cheia (tecla F).
                {prof ? ' Na visão do professor, as notas de cada slide aparecem abaixo da tela e, no modo apresentação, ao lado, com o próximo slide e o cronômetro (tecla P alterna).' : ' Cada bloco também tem o seu conjunto de slides junto do texto.'}
              </p>
              <Emulador slides={slides} rodape={rodape} onPresent={(i) => setDeck(i)} />
            </section>
            {aula.blocos.map((b) => (
              <React.Fragment key={b.id}>
                {aula.encontros.filter((e) => e.inicio === b.id).map((e) => (
                  <div key={e.n} className="encontro" id={`encontro${e.n}`}><h2>Encontro {e.n}: {e.titulo}</h2></div>
                ))}
                <section className="sec" id={b.id}>
                  <div className="sec-head"><span className="n">{b.cod}</span><h2>{b.titulo}</h2><span className="min">{b.min} min</span></div>
                  {prof && <ProfBloco b={b} />}
                  <Emulador slides={slides.slice(inicio[b.id], inicio[b.id] + b.slides.length + 1)} inicio={inicio[b.id]} primeiro={1} rodape={rodape} onPresent={(i) => setDeck(i)} />
                  <Etapa k="teoria" cod={b.cod} i={1}>{b.teoria}</Etapa>
                  <Etapa k="exemplo" cod={b.cod} i={2}>{b.exemplo}</Etapa>
                  <Etapa k="pratica" cod={b.cod} i={3}>
                    {b.pratica}
                    {b.exercicios && <Exercicios itens={b.exercicios} />}
                  </Etapa>
                </section>
                {aula.intervalos.includes(b.id) && <div className="intervalo">Intervalo de 20 minutos</div>}
              </React.Fragment>
            ))}
            <section className="sec" id="artigos">
              <div className="sec-head"><span className="n">{nExtra}</span><h2>Leituras</h2></div>
              <div className="artigos">
                {aula.artigos.map((a) => (
                  <article key={a.ref} className="artigo">
                    <p className="artigo-ref">{a.ref}</p>
                    <p className="artigo-tag">{a.tag}{a.br ? ', estudo brasileiro' : ''}</p>
                    <p>{a.porque}</p>
                    {a.perguntas && (
                      <details className="ficha" open={prof}>
                        <summary>ficha de leitura crítica</summary>
                        <ol>{a.perguntas.map((q) => <li key={q}>{q}</li>)}</ol>
                      </details>
                    )}
                    <a href={a.link} target="_blank" rel="noreferrer">abrir <ExternalLink size={12} /></a>
                  </article>
                ))}
              </div>
            </section>
            <section className="sec" id="quiz">
              <div className="sec-head"><span className="n">{nExtra + 1}</span><h2>Avaliação formativa</h2><span className="min">{aula.quiz.length} questões</span></div>
              <Quiz qs={aula.quiz} />
            </section>
            <section className="sec" id="entregas">
              <div className="sec-head"><span className="n">{nExtra + 2}</span><h2>Atividade avaliativa (em dupla)</h2></div>
              <ol className="desafios">{aula.entregas.map((d, i) => <li key={i}>{d}</li>)}</ol>
            </section>
            <section className="sec" id="limitacoes">
              <div className="sec-head"><span className="n">{nExtra + 3}</span><h2>Pressupostos e limitações</h2></div>
              <ol className="desafios">{aula.limitacoes.map((d, i) => <li key={i}>{d}</li>)}</ol>
            </section>
            <section className="sec" id="referencias">
              <div className="sec-head"><span className="n">{nExtra + 4}</span><h2>Referências</h2></div>
              <ul className="refs">{[...aula.referencias].sort((a, b) => a.localeCompare(b, 'pt')).map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
            <nav className="pager" aria-label="Navegação">
              <a href="#inicio"><small><ArrowLeft size={12} /> Início</small>Apresentação</a>
              <a href="#top" className="next" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><small>Topo <ArrowRight size={12} /></small>Sumário</a>
            </nav>
          </div>
        </div>
      </div>
    </main>
  )
}
