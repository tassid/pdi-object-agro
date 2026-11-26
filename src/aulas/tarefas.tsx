import type { Bloco } from '../curso'
import { Fig, Thm, Trabalho } from '../curso'
import { Callout, Code } from '../ui'
import { T } from '../trabalhos'
import R from '../resultados.json'

const d2 = (v: number) => v.toFixed(2).replace('.', ',')
const pct = (v: number) => `${(100 * v).toFixed(1).replace('.', ',')}%`

/* ---------------------------------------------------------------- tabela-mestra das tarefas */
function QuadroTarefas() {
  return (
    <table className="tbl tbl-tarefas">
      <caption>Quadro 1. As tarefas de visão computacional lado a lado, da pergunta ao modelo.</caption>
      <thead>
        <tr><th /><th>classificação</th><th>detecção</th><th>segmentação semântica</th><th>segmentação de instâncias</th></tr>
      </thead>
      <tbody>
        <tr><th>pergunta</th><td>O que é esta imagem (ou este recorte)?</td><td>Onde estão os objetos e quantos são?</td><td>Que pixels são de cada classe?</td><td>Que pixels são de cada objeto?</td></tr>
        <tr><th>saída</th><td>uma classe e a probabilidade</td><td>uma caixa, uma classe e uma confiança por objeto</td><td>um mapa com a classe de cada pixel</td><td>uma máscara por objeto, com classe e confiança</td></tr>
        <tr><th>conta objetos?</th><td>não</td><td>sim</td><td>não (objetos encostados se fundem)</td><td>sim</td></tr>
        <tr><th>mede área ou forma?</th><td>não</td><td>só aproximada (caixa)</td><td>área total da classe</td><td>área e forma de cada objeto</td></tr>
        <tr><th>anotação no CVAT</th><td><b>tag</b> (rótulo da imagem)</td><td><b>retângulo</b></td><td><b>pincel</b> ou polígono, por classe</td><td><b>polígono</b> ou pincel, um por objeto</td></tr>
        <tr><th>custo de anotar</th><td>segundos por imagem</td><td>alguns segundos por objeto</td><td>minutos por imagem</td><td>o mais alto: contorno de cada objeto</td></tr>
        <tr><th>exportar do CVAT</th><td>formato de classificação (uma pasta por classe)</td><td>Ultralytics YOLO Detection</td><td>Segmentation mask</td><td>Ultralytics YOLO Segmentation</td></tr>
        <tr><th>arquivo de rótulo</th><td>nenhum: a pasta é a classe</td><td><code>classe xc yc w h</code></td><td>imagem PNG com a classe por pixel</td><td><code>classe x1 y1 x2 y2 … xn yn</code></td></tr>
        <tr><th>modelo YOLO</th><td><code>yolo11n-cls.pt</code></td><td><code>yolo11n.pt</code></td><td>fora do YOLO (U-Net, por exemplo)</td><td><code>yolo11n-seg.pt</code></td></tr>
        <tr><th>métrica principal</th><td>acerto top-1 (e top-5)</td><td>mAP de caixa</td><td>IoU médio por classe</td><td>mAP de máscara</td></tr>
        <tr><th>exemplo agrícola</th><td>variedade de um cacho; grão bom ou avariado</td><td>contar cachos, frutos, animais, insetos</td><td>% da área com daninha ou doença</td><td>área de cada cacho ou folha</td></tr>
      </tbody>
    </table>
  )
}

/* ================================================================== bloco do encontro 1 */
export const blocoTarefas: Bloco = {
  id: 'bT1',
  cod: '2',
  titulo: 'Classificação, detecção e segmentação: etapas e diferenças',
  min: 50,
  tipo: 'conceito',
  slides: [
    { titulo: 'Quatro perguntas sobre a mesma foto', img: 'quatro_tarefas', legenda: 'WGISD, anotações originais', pontos: ['O que é? → classificação', 'Onde e quantos? → detecção', 'Que pixels? → segmentação semântica', 'Que pixels de cada objeto? → instâncias'], notas: 'Fazer as quatro perguntas à turma antes de mostrar os nomes das tarefas.' },
    { titulo: 'Três modelos reais, a mesma foto', img: 'real_tres_tarefas', notas: 'Os três modelos foram treinados de verdade no WGISD para este material: classificação de recortes por variedade, detecção e segmentação de instâncias.' },
    { titulo: 'Classificação', pontos: ['Entrada: a imagem inteira ou um recorte', 'Saída: uma classe e a probabilidade', 'É o problema da Aula 5 (salmão ou robalo)', 'CVAT: tag · YOLO: yolo11n-cls.pt'] },
    { titulo: 'Detecção', pontos: ['Entrada: a foto inteira', 'Saída: caixa + classe + confiança, por objeto', 'Permite contar', 'CVAT: retângulo · YOLO: yolo11n.pt'] },
    { titulo: 'Segmentação', pontos: ['Semântica: classe de cada pixel (área)', 'Instâncias: máscara de cada objeto (área e forma de cada um)', 'CVAT: polígono ou pincel · YOLO: yolo11n-seg.pt'] },
    { titulo: 'No CVAT, cada tarefa tem a sua ferramenta', img: 'cvat/image249', legenda: 'Tags no CVAT (documentação oficial)', pontos: ['Tag → classificação', 'Retângulo → detecção', 'Polígono / pincel → segmentação', 'O formato de exportação muda junto'] },
    { titulo: 'O mesmo fluxo, cinco etapas', pontos: ['1. Definir a pergunta e a tarefa', '2. Anotar no CVAT com a ferramenta da tarefa', '3. Exportar no formato da tarefa', '4. Treinar o YOLO com os pesos da tarefa', '5. Avaliar com a métrica da tarefa'] },
    { titulo: 'Resultados reais por tarefa', pontos: [`Classificação de variedade: acerto de ${pct(R.cls.test.top1)} no teste`, `Detecção de cachos: mAP50 de ${d2(R.A_pre.test.mAP50)}`, `Segmentação de cachos: mAP50 de máscara de ${d2(R.seg.test.mask_mAP50)}`], notas: 'Os números não são comparáveis entre si: cada tarefa tem sua métrica. Servem para mostrar que as três funcionam no mesmo conjunto.' },
    { titulo: 'Como escolher', pontos: ['Preciso contar? → detecção', 'Preciso de área ou forma de cada objeto? → instâncias', 'Só a área total importa? → semântica', 'Cada foto (ou recorte) tem um objeto? → classificação', 'Escolher a mais barata que responde à pergunta'] },
  ],
  teoria: (
    <>
      <p>
        Visão computacional resolve perguntas diferentes sobre uma imagem, e cada pergunta é uma <b>tarefa</b>. A tarefa decide tudo o que vem depois: que ferramenta usar no CVAT,
        em que formato exportar, que modelo YOLO treinar, que métrica olhar e quanto tempo de anotação o projeto vai consumir. Por isso ela é a primeira decisão do projeto, antes de
        qualquer código.
      </p>
      <h4>As tarefas, uma a uma</h4>
      <Thm k="def" n="2" nome="classificação">
        Atribuir <i>uma</i> classe à imagem inteira, ou a um recorte dela, com uma probabilidade. É exatamente o problema da Aula 5: o peixe já isolado na esteira é salmão ou robalo.
        Não diz onde está o objeto nem quantos existem.
      </Thm>
      <Thm k="def" n="3" nome="detecção de objetos">
        Encontrar cada objeto na foto e devolver, para cada um, uma caixa delimitadora, uma classe e uma confiança. Como cada objeto vira uma caixa, a detecção permite <b>contar</b>.
      </Thm>
      <Thm k="def" n="4" nome="segmentação semântica">
        Atribuir uma classe a cada pixel. Responde “quanto da imagem é daninha?”, mas não separa dois objetos encostados da mesma classe.
      </Thm>
      <Thm k="def" n="5" nome="segmentação de instâncias">
        Atribuir uma máscara a cada objeto. Combina as duas anteriores: conta como a detecção e mede área e forma de cada objeto como a segmentação.
      </Thm>
      <p>
        Uma forma prática de lembrar: a classificação olha <i>a imagem</i>, a detecção olha <i>cada objeto</i> como um retângulo e a segmentação olha <i>cada pixel</i>. A informação
        cresce nessa ordem, e o custo de anotar também.
      </p>
      <h4>O quadro completo</h4>
      <QuadroTarefas />
      <h4>As cinco etapas e o que muda em cada uma</h4>
      <ol>
        <li><b>Pergunta → tarefa.</b> “Quantos cachos há na planta?” pede detecção. “Qual a variedade deste cacho?” pede classificação. “Qual o tamanho de cada cacho?” pede segmentação de instâncias.</li>
        <li><b>Anotação no CVAT.</b> Classificação usa <i>tags</i> (um clique por imagem); detecção usa <i>retângulos</i>; segmentação usa <i>polígonos</i> ou o <i>pincel</i>. No projeto do CVAT, o tipo de rótulo pode ser restringido à ferramenta certa.</li>
        <li><b>Exportação.</b> Cada tarefa tem um formato. Para o YOLO: pastas por classe (classificação), <code>Ultralytics YOLO Detection</code> (caixas) ou <code>Ultralytics YOLO Segmentation</code> (polígonos).</li>
        <li><b>Treino.</b> Só muda o arquivo de pesos: <code>yolo11n-cls.pt</code>, <code>yolo11n.pt</code> ou <code>yolo11n-seg.pt</code>. O comando <code>train</code> é o mesmo.</li>
        <li><b>Avaliação.</b> Classificação mede o acerto (top-1); detecção, o mAP das caixas; segmentação, o mAP das máscaras. Os números não são comparáveis entre tarefas.</li>
      </ol>
      <Callout kind="campo" title="Combinações">
        <p>Tarefas podem ser encadeadas. Um detector acha os grãos e um classificador decide se cada grão está avariado: foi o que fez a dissertação da soja, abaixo. Num projeto, a pergunta é qual combinação resolve o problema com o menor custo de anotação.</p>
      </Callout>
    </>
  ),
  exemplo: (
    <>
      <p>
        Para mostrar as três tarefas no mesmo material, três modelos YOLO11n foram treinados no WGISD: um <b>classificador</b> que recebe o recorte de um cacho e diz a variedade
        (cinco classes), um <b>detector</b> de cachos e um modelo de <b>segmentação de instâncias</b> treinado nas 137 fotos que têm máscaras. A figura abaixo aplica os três à mesma foto
        de teste.
      </p>
      <Fig n="real_tres_tarefas" cap="Saídas reais dos três modelos numa foto de teste do WGISD: (a) classificação de recortes, com as três variedades mais prováveis; (b) detecção; (c) segmentação de instâncias." />
      <table className="tbl">
        <caption>Tabela 1. Resultados reais no conjunto de teste, cada tarefa com a sua métrica.</caption>
        <thead><tr><th>tarefa</th><th>modelo</th><th>o que o modelo aprende</th><th className="num">resultado no teste</th></tr></thead>
        <tbody>
          <tr><td>classificação</td><td>yolo11n-cls</td><td>variedade de um cacho recortado (5 classes)</td><td className="num">acerto top-1 {pct(R.cls.test.top1)}</td></tr>
          <tr><td>detecção</td><td>yolo11n</td><td>caixa de cada cacho</td><td className="num">mAP50 {d2(R.A_pre.test.mAP50)}</td></tr>
          <tr><td>segmentação de instâncias</td><td>yolo11n-seg</td><td>máscara de cada cacho</td><td className="num">mAP50 de máscara {d2(R.seg.test.mask_mAP50)}</td></tr>
        </tbody>
      </table>
      <Fig n="real_cls_matriz" w={600} cap={`Matriz de confusão real do classificador de variedades, em ${R.cls_n_test} recortes de teste. Cachos da mesma foto ficam sempre no mesmo conjunto.`} />
      <Fig n="real_seg_pred" cap="Segmentação de instâncias: contornos anotados no WGISD (esquerda) e máscaras previstas pelo YOLO11n-seg (direita), na mesma foto de teste." />
      <h4>No CVAT</h4>
      <Fig n="cvat/image249" w={520} cap="Classificação: tags aplicadas ao quadro inteiro. Fonte: documentação do CVAT." />
      <Fig n="cvat/image013_detrac" cap="Detecção: um retângulo por objeto. Fonte: documentação do CVAT." />
      <Fig n="cvat/poligono" w={360} cap="Segmentação de instâncias: polígono ajustado ao contorno de um objeto. Fonte: documentação do CVAT." />
      <h4>Em trabalhos da UTFPR</h4>
      <p>O mesmo problema agroindustrial pode pedir tarefas diferentes. A dissertação abaixo usa segmentação (U-Net), detecção (YOLO) e classificação (EfficientNet, MobileNet) em grãos de soja:</p>
      <Trabalho t={T.soja} />
      <p>E este TCC de Medianeira escolheu segmentação de instâncias, e não detecção, para reconhecer espécies florestais pelas folhas:</p>
      <Trabalho t={T.florestais} />
    </>
  ),
  pratica: (
    <>
      <p><b>Em duplas (10 min).</b> Para cada problema dos exercícios, indicar a tarefa, a ferramenta do CVAT e o arquivo de pesos do YOLO. Justificar pela pergunta e pelo custo de anotação.</p>
      <Code title="Python · as três tarefas usam o mesmo comando" code={`from ultralytics import YOLO
YOLO("yolo11n-cls.pt").train(data="recortes/", imgsz=224)          # classificação: pasta com uma subpasta por classe
YOLO("yolo11n.pt").train(data="dataset/data.yaml", imgsz=640)      # detecção: caixas
YOLO("yolo11n-seg.pt").train(data="dataset_seg/data.yaml", imgsz=640)  # segmentação: polígonos`} />
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'Estimar o número de aves mortas num aviário a partir de uma câmera no teto.', r: <p>Detecção (retângulo no CVAT, <code>yolo11n.pt</code>): é preciso localizar e contar.</p> },
    { nivel: 'básico', q: 'Separar grãos de café bons e defeituosos numa esteira, com uma foto por grão.', r: <p>Classificação (tag no CVAT, <code>yolo11n-cls.pt</code>): cada foto tem um único objeto.</p> },
    { nivel: 'básico', q: 'Estimar a porcentagem de área foliar com ferrugem na soja.', r: <p>Segmentação semântica (pincel no CVAT): a variável é uma área, não importa separar lesões.</p> },
    { nivel: 'médio', q: 'Estimar o peso de cada cacho a partir do tamanho dele na foto.', r: <p>Segmentação de instâncias (polígono no CVAT, <code>yolo11n-seg.pt</code>): é preciso a área de cada cacho, separadamente.</p> },
    { nivel: 'médio', q: 'Uma foto de bandeja tem 200 grãos de soja, e a pergunta é quantos estão avariados. Que combinação de tarefas usar?', r: <p>Detecção para achar cada grão e classificação de cada recorte (bom ou avariado), ou um detector com duas classes. A cascata permite anotar a classificação só com tags, que é mais barato.</p> },
    { nivel: 'desafio', q: <>Por que o acerto de {pct(R.cls.test.top1)} do classificador e o mAP50 de {d2(R.A_pre.test.mAP50)} do detector não dizem qual modelo é “melhor”?</>, r: <p>São tarefas e métricas diferentes, com entradas diferentes (um recorte já isolado contra a foto inteira). Só faz sentido comparar modelos da mesma tarefa, na mesma métrica e no mesmo conjunto.</p> },
  ],
}

/* ================================================================== bloco do encontro 2 */
export const blocoClsSeg: Bloco = {
  id: 'bT2',
  cod: '10',
  titulo: 'Classificação e segmentação com YOLO na prática',
  min: 35,
  tipo: 'lab',
  slides: [
    { titulo: 'O que muda no código', pontos: ['Pesos: -cls, (nada) ou -seg', 'Dados: pasta por classe ou data.yaml', 'Saída: r.probs, r.boxes ou r.masks', 'Métrica: top-1, mAP de caixa ou de máscara'] },
    { titulo: 'Classificação real: variedade do cacho', img: 'real_cls_matriz', pontos: [`Acerto top-1 no teste: ${pct(R.cls.test.top1)}`, 'Erros concentrados nas variedades parecidas', 'Recortes da mesma foto nunca separados'] },
    { titulo: 'Segmentação real: máscara de cada cacho', img: 'real_seg_pred', pontos: [`mAP50 de máscara no teste: ${d2(R.seg.test.mask_mAP50)}`, `mAP50 de caixa do mesmo modelo: ${d2(R.seg.test.box_mAP50)}`, 'Só 137 fotos têm máscara: anotar contorno custa caro'] },
    { titulo: 'Da caixa ao recorte', pontos: ['As caixas do detector viram recortes', 'Os recortes alimentam o classificador', 'Detectar + classificar = cascata'] },
  ],
  teoria: (
    <>
      <p>Depois de treinar um detector, as outras duas tarefas exigem poucas mudanças no notebook. A tabela resume o que muda:</p>
      <table className="tbl">
        <caption>Tabela 2. O que muda no código entre as tarefas.</caption>
        <thead><tr><th /><th>classificação</th><th>detecção</th><th>segmentação de instâncias</th></tr></thead>
        <tbody>
          <tr><th>pesos</th><td><code>yolo11n-cls.pt</code></td><td><code>yolo11n.pt</code></td><td><code>yolo11n-seg.pt</code></td></tr>
          <tr><th>argumento <code>data</code></th><td>pasta com <code>train/classe/*.jpg</code> e <code>val/classe/*.jpg</code></td><td><code>data.yaml</code></td><td><code>data.yaml</code> (rótulos com polígonos)</td></tr>
          <tr><th><code>imgsz</code> típico</th><td>224</td><td>640 a 1280</td><td>640 a 1280</td></tr>
          <tr><th>resultado de <code>predict</code></th><td><code>r.probs.top1</code>, <code>r.probs.top5</code></td><td><code>r.boxes.xyxy</code>, <code>.conf</code>, <code>.cls</code></td><td><code>r.masks.xy</code> e também <code>r.boxes</code></td></tr>
          <tr><th>métrica do <code>val</code></th><td><code>top1</code>, <code>top5</code></td><td><code>box.map50</code>, <code>box.map</code></td><td><code>seg.map50</code>, <code>seg.map</code></td></tr>
        </tbody>
      </table>
      <p>
        Uma forma barata de obter dados de classificação é reaproveitar a detecção: cada caixa anotada (ou prevista) vira um recorte, e a pasta em que o recorte é salvo é a classe. Foi
        assim que o classificador de variedades deste material foi treinado. A atenção está na partição: todos os recortes de uma mesma foto precisam ficar no mesmo conjunto.
      </p>
    </>
  ),
  exemplo: (
    <>
      <Fig n="real_cls_matriz" w={600} cap={`Classificação real: acerto top-1 de ${pct(R.cls.test.top1)} e top-5 de ${pct(R.cls.test.top5)} no teste.`} />
      <Fig n="real_seg_pred" cap={`Segmentação real: mAP50 de máscara de ${d2(R.seg.test.mask_mAP50)} e mAP50-95 de máscara de ${d2(R.seg.test.mask_mAP5095)} no teste.`} />
    </>
  ),
  pratica: (
    <>
      <p>Seção 8 do notebook: transformar as caixas do WGISD em recortes por variedade e treinar um classificador em poucos minutos; opcionalmente, treinar a segmentação.</p>
      <Code title="Seção 8 · classificação a partir das caixas" code={`import cv2, os, glob
VAR = {"CDY": "chardonnay", "CFR": "cabernet_franc", "CSV": "cabernet_sauvignon", "SVB": "sauvignon_blanc", "SYH": "syrah"}
for split in ["train", "val"]:
    for f in glob.glob(f"/content/dataset/images/{split}/*.jpg"):
        im = cv2.imread(f); H, W = im.shape[:2]; classe = VAR[os.path.basename(f)[:3]]
        os.makedirs(f"/content/recortes/{split}/{classe}", exist_ok=True)
        for k, l in enumerate(open(f.replace("images", "labels")[:-4] + ".txt")):
            _, xc, yc, w, h = map(float, l.split())
            x1, y1, x2, y2 = int((xc-w/2)*W), int((yc-h/2)*H), int((xc+w/2)*W), int((yc+h/2)*H)
            cv2.imwrite(f"/content/recortes/{split}/{classe}/{os.path.basename(f)[:-4]}_{k}.jpg", im[y1:y2, x1:x2])

cls = YOLO("yolo11n-cls.pt")
cls.train(data="/content/recortes", epochs=15, imgsz=224, project=f"{BASE}/runs", name="cls")
r = cls.predict("/content/recortes/val/syrah/" + os.listdir("/content/recortes/val/syrah")[0])[0]
print(r.names[r.probs.top1], float(r.probs.top1conf))`} />
      <Callout kind="pegadinha"><p>No notebook, a Syrah está só no teste da detecção. Para a classificação de variedades, ela precisa estar também no treino; por isso a seção 8 usa os recortes das quatro variedades do treino ou refaz a partição incluindo a Syrah.</p></Callout>
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'Qual atributo do resultado guarda a classe prevista por um classificador YOLO?', r: <p><code>r.probs.top1</code> (índice da classe) e <code>r.probs.top1conf</code> (probabilidade). O nome vem de <code>r.names[r.probs.top1]</code>.</p> },
    { nivel: 'médio', q: 'A dupla sorteou os recortes entre treino e validação, sem olhar de que foto vieram, e obteve 99% de acerto. O que desconfiar?', r: <p>Recortes de cachos da mesma foto (mesma luz, mesma planta) caíram em conjuntos diferentes: vazamento. A partição deve ser feita por foto, e de preferência por sessão de coleta.</p> },
  ],
}
