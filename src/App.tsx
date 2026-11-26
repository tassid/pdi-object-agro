import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { AulaPage, encontroDe, fig, Fig, Trabalho, useModo } from './curso'
import { curso } from './aulas/Curso'
import { T } from './trabalhos'

const AULAS = [curso]
const BASE = import.meta.env.BASE_URL

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || 'inicio')
  useEffect(() => {
    const f = () => {
      const n = location.hash.slice(1) || 'inicio'
      const pagina = n === 'inicio' || AULAS.some((a) => a.id === n)
      if (!pagina) return // âncora interna (#b11 etc.): o navegador rola sozinho
      setH(n)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

function Inicio() {
  const prof = useModo() === 'professor'
  return (
    <main className="page">
      <div className="wrap">
        <header className="titlepage">
          <h1>Detecção de objetos em imagens agrícolas com CVAT e YOLO</h1>
          <p className="autor">Tassiane Anzolin</p>
          <p className="inst">Processamento de Imagens Aplicado à Agroindústria · PPGTCA, UTFPR Medianeira</p>
          <p className="data">Continuação da Aula 5 (Reconhecimento de Padrões, Prof. Pedro Luiz de Paula Filho) · 2 encontros de 5 horas{prof ? ' · visão do professor' : ''}</p>
          <div className="abstract">
            <h2>Resumo</h2>
            <p>
              A Aula 5 terminou com um sistema clássico que recebe um objeto já isolado, extrai características e decide a classe por uma fronteira de decisão. Os dois encontros
              continuam a partir dali: o que muda entre classificar, detectar e segmentar, como encontrar, delimitar e contar <i>vários</i> objetos numa foto de campo, como produzir os rótulos que um detector precisa (CVAT), como treinar e
              avaliar um YOLO com rigor e como saber se o modelo funciona em outra propriedade. Cada bloco segue a ordem <b>teoria → exemplos → prática</b>, tem slides integrados no
              tema da Aula 5 e exercícios com solução. As figuras foram geradas em Python com fotos reais do WGISD (Embrapa) e com <b>treinos reais</b> de YOLO11n feitos para este
              material; os estudos de caso são trabalhos de conclusão e dissertações da UTFPR, com prints das páginas originais.
            </p>
          </div>
        </header>

        <div className="aula-cards">
          {curso.encontros.map((e) => {
            const bl = curso.blocos.filter((b) => encontroDe(curso, b.id) === e.n)
            return (
              <a key={e.n} href="#curso" className="aula-card">
                <img src={fig(e.n === 1 ? 'real_tres_tarefas' : 'real_predicoes_teste')} alt="" style={{ border: '1px solid var(--rule)' }} />
                <h2>Encontro {e.n}: {e.titulo}</h2>
                <p className="meta">300 minutos, com intervalo de 20 · {bl.length} blocos · notebook no Colab</p>
                <ol className="mini-blocos">
                  {bl.map((b) => <li key={b.id}><b>{b.cod}</b><span>{b.titulo}</span><small>{b.min}′</small></li>)}
                </ol>
              </a>
            )
          })}
        </div>

        <section className="sec">
          <div className="sec-head"><span className="n">1</span><h2>Ponto de partida: a Aula 5</h2></div>
          <div className="prose">
            <p>
              Na Aula 5, o problema do salmão e do robalo foi resolvido em etapas definidas pelo projetista: aquisição, pré-processamento, segmentação, extração de características e
              classificação. A figura abaixo refaz esse raciocínio com dados reais do WGISD: cada ponto do histograma é um cacho anotado, e a característica é o brilho médio do cacho.
              O limiar de menor erro e o limiar de menor custo não coincidem, exatamente como no exemplo do salmão embalado com robalo.
            </p>
          </div>
          <Fig n="aula5_limiar_cachos" cap={<>Chardonnay e Syrah do WGISD (SANTOS et al., 2020): recortes reais e histograma do brilho médio de 814 cachos anotados. Limiar de menor erro (marrom) e de menor custo quando confundir Syrah custa quatro vezes mais (laranja).</>} />
          <div className="prose">
            <p>
              O que muda nestas aulas é o ponto de entrada: em vez de um objeto recortado, a rede recebe a foto inteira e precisa responder onde estão os objetos, quantos são e de que
              classe. Essa é a tarefa de <b>detecção de objetos</b>.
            </p>
          </div>
          <Fig n="aula5_recorte_vs_deteccao" cap={<>Da classificação de um recorte (Aula 5) à detecção na imagem inteira (encontros 1 e 2). Foto e caixas do WGISD.</>} />
        </section>

        <section className="sec">
          <div className="sec-head"><span className="n">2</span><h2>Experimentos reais deste material</h2></div>
          <div className="prose">
            <p>
              Para que as figuras de métricas, limiares, NMS, curvas e mudança de domínio mostrem saídas reais, três modelos YOLO11n (Ultralytics 8.3) foram treinados numa RTX 5060 Ti com
              entrada de 1024 pixels, até 80 épocas e paciência de 20. Os scripts estão em <code>scripts/treinar_wgisd.py</code> e <code>scripts/figuras_reais.py</code>.
            </p>
            <table className="tbl">
              <caption>Tabela 1. Experimentos e partições (WGISD, 300 imagens, 5 variedades).</caption>
              <thead><tr><th>experimento</th><th>pesos iniciais</th><th>treino / validação / teste</th><th>pergunta</th></tr></thead>
              <tbody>
                <tr><td>A, transferência</td><td>COCO</td><td>205 / 37 / 58 (partição oficial)</td><td>desempenho dentro do domínio</td></tr>
                <tr><td>A, do zero</td><td>aleatórios</td><td>205 / 37 / 58</td><td>quanto vale a transferência de aprendizagem</td></tr>
                <tr><td>B, domínio</td><td>COCO</td><td>222 / 30 sem Syrah; teste: 48 Syrah</td><td>o modelo generaliza para uma variedade nunca vista?</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="sec">
          <div className="sec-head"><span className="n">3</span><h2>Trabalhos da UTFPR usados como estudos de caso</h2></div>
          <p className="prose">
            Os trabalhos abaixo foram obtidos no Repositório Institucional da UTFPR (RIUT) e aparecem nos blocos em que cada técnica é discutida. Os prints reproduzem figuras das páginas
            indicadas, para leitura crítica em sala.
          </p>
          <Trabalho t={T.mosca} />
          <ul className="desafios" style={{ marginTop: 12 }}>
            {Object.values(T).filter((t) => t.id !== T.mosca.id).map((t) => (
              <li key={t.id}><a href={`https://repositorio.utfpr.edu.br/jspui/handle/1/${t.id}`} target="_blank" rel="noreferrer">{t.titulo}</a>. {t.autor}, {t.onde}, {t.ano}.</li>
            ))}
          </ul>
        </section>

        <section className="sec">
          <div className="sec-head"><span className="n">4</span><h2>Dados e ferramentas</h2></div>
          <div className="artigos">
            <article className="artigo">
              <p className="artigo-ref">WGISD, Embrapa Wine Grape Instance Segmentation Dataset</p>
              <p className="artigo-tag">Embrapa, CC BY-NC 4.0</p>
              <p>300 fotos de cinco variedades de uva (Vinícola Guaspari, SP), com caixas no formato YOLO e máscaras de instância (SANTOS et al., 2020). Usado em todos os experimentos.</p>
              <a href="https://github.com/thsant/wgisd" target="_blank" rel="noreferrer">repositório <ExternalLink size={12} /></a>
            </article>
            <article className="artigo">
              <p className="artigo-ref">CWFID, Crop/Weed Field Image Dataset</p>
              <p className="artigo-tag">uso acadêmico</p>
              <p>Cenoura e plantas daninhas com rótulo por pixel (HAUG; OSTERMANN, 2014). Usado nos exemplos de PDI clássico, convolução e segmentação.</p>
              <a href="https://github.com/cwfid/dataset" target="_blank" rel="noreferrer">repositório <ExternalLink size={12} /></a>
            </article>
            <article className="artigo">
              <p className="artigo-ref">CVAT, Computer Vision Annotation Tool</p>
              <p className="artigo-tag">software livre (MIT)</p>
              <p>Ferramenta de anotação usada no Laboratório 1. As capturas de tela reproduzidas nos blocos vêm da documentação oficial.</p>
              <a href="https://docs.cvat.ai/" target="_blank" rel="noreferrer">documentação <ExternalLink size={12} /></a>
            </article>
            <article className="artigo">
              <p className="artigo-ref">Ultralytics YOLO</p>
              <p className="artigo-tag">AGPL-3.0</p>
              <p>Implementação de referência para treino, validação, rastreamento e exportação nos notebooks.</p>
              <a href="https://docs.ultralytics.com/" target="_blank" rel="noreferrer">documentação <ExternalLink size={12} /></a>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const h = useHash()
  const prof = useModo() === 'professor'
  const i = AULAS.findIndex((a) => a.id === h)
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <a href="#inicio" className="brand">Detecção de objetos · CVAT e YOLO</a>
          <nav className="topnav">
            <a href="#inicio" aria-current={i < 0 ? 'page' : undefined}>Início</a>
            <a href="#curso" aria-current={h === 'curso' ? 'page' : undefined}>Curso</a>
            <a href="https://github.com/tassid/pdi-object-agro" target="_blank" rel="noreferrer">GitHub</a>
            {prof && <a className="modo-prof" href={`${BASE}${location.hash}`} title="voltar à visão dos alunos">Professor · ver como aluno</a>}
          </nav>
        </div>
      </header>
      {i >= 0 ? <AulaPage key={h} aula={AULAS[i]} /> : <Inicio />}
      <footer className="foot">
        Tassiane Anzolin · PPGTCA / UTFPR Medianeira · fotos: WGISD (Embrapa, CC BY-NC 4.0) e CWFID · capturas do CVAT: documentação oficial · prints de trabalhos: RIUT/UTFPR
      </footer>
    </>
  )
}
