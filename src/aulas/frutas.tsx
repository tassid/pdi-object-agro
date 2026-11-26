import type { Bloco } from '../curso'
import { Fig } from '../curso'
import { Callout, Code } from '../ui'
import F from '../frutas.json'

const d2 = (v: number) => v.toFixed(2).replace('.', ',')
const pct = (v: number) => `${(100 * v).toFixed(1).replace('.', ',')}%`
const NB = 'https://colab.research.google.com/github/tassid/pdi-object-agro/blob/main/notebooks/CVAT_YOLO_na_pratica.ipynb'

const porClasse = Object.entries(F.det.por_classe_mAP50).sort((a, b) => b[1] - a[1])

export const blocoFrutas: Bloco = {
  id: 'bF',
  cod: '',
  titulo: 'Projeto: contar frutas, saber qual é e se está estragada, com YOLO26',
  min: 0,
  tipo: 'lab',
  slides: [
    { titulo: 'O projeto das frutas', img: 'frutas_amostras', pontos: ['Quantas frutas há na foto?', 'Qual fruta é cada uma?', 'Está sadia ou estragada?'], notas: 'Apresentar as três perguntas e mostrar que cada uma pede uma tarefa diferente.' },
    { titulo: 'Três perguntas, duas tarefas', img: 'esq_fluxo', pontos: ['Contar e identificar → detecção (yolo26n.pt)', 'Sadia ou estragada → classificação (yolo26n-cls.pt)', 'Juntas → pipeline'] },
    { titulo: 'Dados do Hugging Face, sem login', img: 'frutas_amostras', pontos: ['DeepFruits: 565 fotos, 3.132 caixas, 7 frutas', 'fresh_rotten: 3.200 fotos de 8 frutas', 'snapshot_download baixa direto no Colab'] },
    { titulo: 'Contar e identificar (resultado real)', img: 'frutas_deteccao', pontos: [`mAP50 no teste: ${d2(F.det.mAP50)}`, `Precisão ${d2(F.det.P)}, revocação ${d2(F.det.R)}`, `Melhor: ${porClasse[0][0]}; pior: ${porClasse[porClasse.length - 1][0]}`] },
    { titulo: 'Sadia ou estragada (resultado real)', img: 'frutas_classificacao', pontos: [`Acerto no teste: ${pct(F.cls_acc_teste)}`, `${F.cls_n_teste} fotos de teste, 8 frutas`, 'Os erros se concentram nas frutas pequenas'] },
    { titulo: 'O pipeline completo', img: 'frutas_pipeline', pontos: ['O detector acha e conta', 'Cada recorte vai para o classificador', 'Saída: tabela por foto e por fruta'] },
    { titulo: 'Atenção: mudança de domínio', img: 'frutas_pipeline', pontos: ['O classificador viu frutas isoladas, de perto', 'No pomar, os recortes são pequenos e com folhas', 'Conferir os recortes antes de confiar nos números'] },
  ],
  teoria: (
    <>
      <p>
        Este é o projeto que fecha a aula, para fazer em dupla no Colab. Ele junta tudo o que veio antes num problema concreto: a partir de fotos de pomar, responder <b>quantas
        frutas há</b>, <b>qual fruta é cada uma</b> e <b>se está sadia ou estragada</b>. As duas primeiras perguntas são de detecção (uma caixa e uma classe por fruta); a terceira é de
        classificação (um rótulo para cada fruta recortada). O modelo é o <b>YOLO26</b>, lançado pela Ultralytics em janeiro de 2026 e pensado para rodar rápido mesmo sem GPU.
      </p>
      <h4>Os dados</h4>
      <p>
        Os dois conjuntos estão no Hugging Face e são baixados direto no Colab, sem cadastro:
      </p>
      <table className="tbl">
        <caption>Tabela 1. Conjuntos usados no projeto.</caption>
        <thead><tr><th>conjunto</th><th>o que tem</th><th>tarefa</th><th>origem</th></tr></thead>
        <tbody>
          <tr><td><code>Project-AgML/fruit_detection_worldwide</code></td><td>565 fotos de pomar, 3.132 caixas de abacate, melão, maçã, laranja, morango, manga e pimentão</td><td>detecção</td><td>DeepFruits (SA et al., 2016)</td></tr>
          <tr><td><code>Project-AgML/fresh_rotten_fruit_classification</code></td><td>3.200 fotos de 8 frutas, metade sadias e metade estragadas</td><td>classificação</td><td>AgML, licença CC BY 4.0</td></tr>
        </tbody>
      </table>
      <p>
        Conjuntos do Kaggle também servem: a biblioteca <code>kagglehub</code> baixa um conjunto com uma linha, mas alguns pedem a chave pessoal do Kaggle (<code>kaggle.json</code>).
        Por isso o notebook usa o Hugging Face.
      </p>
      <h4>As três etapas</h4>
      <ol>
        <li><b>Detecção:</b> treinar o <code>yolo26n.pt</code> no DeepFruits. Cada caixa sai com o nome da fruta; a contagem é a soma das caixas de cada classe.</li>
        <li><b>Classificação:</b> treinar o <code>yolo26n-cls.pt</code> com as fotos de frutas sadias e estragadas.</li>
        <li><b>Pipeline:</b> passar cada caixa encontrada pelo classificador e montar uma tabela por foto.</li>
      </ol>
      <Callout kind="pegadinha" title="Mudança de domínio">
        <p>O classificador aprendeu com fotos de frutas inteiras, de perto, quase sempre com fundo limpo. No pomar, os recortes são pequenos, com folhas e sombra ao redor. É o mesmo problema da Syrah: antes de confiar no número de estragadas, olhar os recortes e, se preciso, anotar alguns exemplos do próprio pomar.</p>
      </Callout>
    </>
  ),
  exemplo: (
    <>
      <p>
        Os resultados abaixo são de treinos reais feitos para este material com os mesmos dados e o mesmo código do notebook, numa GPU RTX 5060 Ti (80 épocas para a detecção e 30
        para a classificação).
      </p>
      <Fig n="frutas_amostras" cap="Os dois conjuntos: uma foto de cada fruta do DeepFruits, com as caixas anotadas, e um exemplo de maçã sadia e estragada do segundo conjunto." />
      <table className="tbl">
        <caption>Tabela 2. Resultados reais no conjunto de teste.</caption>
        <thead><tr><th>etapa</th><th>modelo</th><th className="num">resultado</th></tr></thead>
        <tbody>
          <tr><td>contar e identificar (7 frutas)</td><td>yolo26n</td><td className="num">mAP50 {d2(F.det.mAP50)} · precisão {d2(F.det.P)} · revocação {d2(F.det.R)}</td></tr>
          <tr><td>sadia × estragada (8 frutas)</td><td>yolo26n-cls</td><td className="num">acerto {pct(F.cls_acc_teste)}</td></tr>
        </tbody>
      </table>
      <Fig n="frutas_deteccao" cap={`Detecção real em fotos de teste: o título de cada foto traz a contagem por fruta e quantas estavam anotadas. mAP50 por fruta: ${porClasse.map(([k, v]) => `${k} ${d2(v)}`).join(', ')}.`} />
      <Fig n="frutas_classificacao" cap={`Classificação real entre sadia e estragada: matriz de confusão e acerto por fruta, em ${F.cls_n_teste} fotos de teste.`} />
      <Fig n="frutas_pipeline" cap="O pipeline em duas fotos de teste: cada caixa do detector foi recortada e classificada. Verde: sadia; vermelho: estragada. Os recortes de pomar são diferentes das fotos de treino do classificador: confira-os antes de usar os números." />
    </>
  ),
  pratica: (
    <>
      <p>
        <b>No Colab:</b> abrir o <a href={NB} target="_blank" rel="noreferrer">notebook da aula</a> e rodar a parte 1 e as partes 11, 12 e 13. Leva cerca de 25 minutos numa GPU T4.
      </p>
      <Code title="Parte 11 · baixar do Hugging Face" code={`from huggingface_hub import snapshot_download
snapshot_download("Project-AgML/fruit_detection_worldwide", repo_type="dataset", local_dir="frutas/worldwide")
snapshot_download("Project-AgML/fresh_rotten_fruit_classification", repo_type="dataset",
                  local_dir="frutas/fresh_rotten", allow_patterns=["raw/*"])`} />
      <Code title="Partes 12 e 13 · treinar com YOLO26" code={`from ultralytics import YOLO
det = YOLO("yolo26n.pt").train(data="frutas/det/data.yaml", epochs=60, imgsz=640)
cls = YOLO("yolo26n-cls.pt").train(data="frutas/cls", epochs=20, imgsz=224)`} />
      <Code title="Parte 13 · contar, identificar e classificar" code={`tabela, desenho = analisar("foto_do_pomar.jpg")
# Counter({('maçã', 'sadia'): 11, ('maçã', 'estragada'): 1, ...})`} />
      <p><b>Desafios para a dupla:</b></p>
      <ol>
        <li>Rodar o pipeline em fotos de frutas tiradas com o celular (feira, cozinha, pomar). Onde ele erra?</li>
        <li>Anotar no CVAT 30 fotos com caixas “sadia” e “estragada” e treinar um único detector que faça as duas coisas. Comparar com o pipeline.</li>
        <li>Trocar o <code>yolo26n.pt</code> pelo <code>yolo26s.pt</code> (maior) e comparar acerto e tempo.</li>
      </ol>
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'Por que contar e identificar a fruta é uma tarefa de detecção, e não de classificação?', r: <p>Porque há várias frutas na mesma foto: é preciso localizar cada uma (caixa) e dar uma classe a cada caixa. A classificação dá um rótulo só para a imagem inteira.</p> },
    { nivel: 'médio', q: 'O classificador acerta mais de 95% no teste, mas no pomar marca frutas sadias como estragadas. Por quê?', r: <p>O teste do classificador tem fotos parecidas com as de treino (frutas isoladas, de perto). Os recortes do pomar são outro domínio: menores, com folhas e sombra. A solução é anotar exemplos do próprio pomar.</p> },
  ],
}
