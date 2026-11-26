import type { Bloco } from '../curso'
import { Fig } from '../curso'
import { Callout } from '../ui'

/* Linha do tempo: quem criou cada técnica e ferramenta, e para resolver que problema. */

type Marco = [string, string, string, string] // ano, o quê, quem, para quê

const CLASSICOS: Marco[] = [
  ['1958', 'Perceptron', 'Frank Rosenblatt, Cornell Aeronautical Laboratory', 'Uma máquina que aprendesse sozinha a separar padrões visuais, ajustando pesos a partir de exemplos.'],
  ['1962', 'Transformada de Hough', 'Paul Hough', 'Encontrar trajetórias retas de partículas em fotografias de câmaras de bolhas, na física.'],
  ['1979', 'Limiar de Otsu', 'Nobuyuki Otsu', 'Escolher automaticamente o limiar que separa objeto e fundo pelo histograma, sem tentativa e erro.'],
  ['1998', 'LeNet-5, rede convolucional', 'Yann LeCun e colegas, AT&T Bell Labs', 'Ler dígitos manuscritos em cheques bancários.'],
  ['2001', 'Detector de Viola–Jones', 'Paul Viola e Michael Jones', 'Detectar rostos em tempo real, rápido o bastante para câmeras comuns.'],
  ['2004', 'SIFT', 'David Lowe, University of British Columbia', 'Reconhecer o mesmo objeto em fotos com escala, rotação e luz diferentes, por pontos-chave.'],
  ['2005', 'HOG', 'Navneet Dalal e Bill Triggs, INRIA', 'Detectar pedestres descrevendo a forma pelos gradientes da imagem.'],
  ['2005–2012', 'PASCAL VOC', 'Mark Everingham e colegas', 'Uma competição anual com as mesmas fotos e métricas para comparar detectores de forma justa.'],
  ['2008', 'LabelMe', 'Bryan Russell, Antonio Torralba e colegas, MIT', 'Anotar imagens pela web, de forma colaborativa.'],
  ['2009', 'ImageNet', 'Fei-Fei Li e colegas', 'Reunir milhões de fotos rotuladas para que os algoritmos tivessem exemplos suficientes para aprender.'],
  ['2012', 'AlexNet', 'Alex Krizhevsky, Ilya Sutskever e Geoffrey Hinton, Universidade de Toronto', 'Mostrar que uma rede convolucional treinada em GPU vencia por larga margem os métodos clássicos no ImageNet.'],
  ['2014', 'R-CNN e COCO', 'Ross Girshick e colegas (UC Berkeley); Tsung-Yi Lin e colegas (Microsoft)', 'Levar as redes convolucionais para a detecção de objetos; e criar um conjunto com objetos pequenos e cenas cheias.'],
  ['2015', 'Faster R-CNN e U-Net', 'Shaoqing Ren e colegas (Microsoft Research); Olaf Ronneberger e colegas (Universidade de Freiburg)', 'Detecção mais rápida, com a rede propondo as regiões; e segmentação de imagens biomédicas com poucos exemplos.'],
]

const YOLOS: Marco[] = [
  ['2016', 'YOLO (v1)', 'Joseph Redmon, Santosh Divvala, Ross Girshick e Ali Farhadi (Universidade de Washington, Allen AI, Facebook AI)', 'Detectar em tempo real olhando a imagem uma única vez, em vez de examinar milhares de regiões candidatas.'],
  ['2017–2018', 'YOLO v2 e v3', 'Joseph Redmon e Ali Farhadi', 'Mais classes, mais precisão e várias escalas, mantendo a velocidade.'],
  ['2020', 'Redmon deixa a área', 'Joseph Redmon', 'Anunciou que parava de pesquisar visão computacional por preocupação com usos militares e com a privacidade.'],
  ['2020', 'YOLO v4', 'Alexey Bochkovskiy, Chien-Yao Wang e Hong-Yuan Mark Liao', 'Reunir num só detector as melhores técnicas de treino da época, rodando numa GPU comum.'],
  ['2020', 'YOLO v5', 'Ultralytics (Glenn Jocher)', 'Uma implementação em PyTorch fácil de instalar, treinar e exportar: o começo da biblioteca usada nesta aula.'],
  ['2022', 'YOLO v6 e v7', 'Meituan; Chien-Yao Wang e colegas', 'Detectores voltados à indústria e a aplicações em tempo real.'],
  ['2023', 'YOLO v8', 'Ultralytics', 'Uma só biblioteca para detecção, segmentação, classificação, pose e rastreamento.'],
  ['2024', 'YOLO v9, v10 e YOLO11', 'Chien-Yao Wang e colegas; Universidade Tsinghua; Ultralytics', 'Treino mais eficiente; detecção sem a etapa de NMS; modelos menores e mais precisos.'],
  ['2025', 'YOLO v12', 'Yunjie Tian, Qixiang Ye e David Doermann', 'Trazer mecanismos de atenção para o YOLO sem perder velocidade.'],
  ['2025–2026', 'YOLO26', 'Ultralytics (apresentado em set/2025, lançado em jan/2026)', 'Rodar bem em celulares e computadores de borda: dispensa o NMS na inferência e é mais rápido em CPU.'],
]

const FERRAMENTAS: Marco[] = [
  ['2015', 'LabelImg', 'Tzutalin (comunidade)', 'Um programa simples para desenhar caixas e salvar no formato do PASCAL VOC e, depois, do YOLO.'],
  ['2017–2018', 'CVAT', 'Intel; arquiteto original: Nikita Manovich', 'A equipe da Intel precisava anotar muitas imagens e vídeos para treinar seus próprios modelos e criou a ferramenta; abriu o código no GitHub em 2018.'],
  ['2019', 'CVAT anunciado pela Intel', 'Intel', 'Divulgação pública como ferramenta aberta para rotular dados de visão computacional.'],
  ['2020', 'DETR', 'Nicolas Carion e colegas, Facebook AI', 'Detecção com transformers, prevendo o conjunto de objetos de uma vez, sem NMS.'],
  ['2022', 'CVAT.ai', 'Equipe original, como empresa independente', 'Manter o CVAT aberto (licença MIT) e oferecer a versão online usada em sala.'],
  ['2023', 'SAM (Segment Anything)', 'Meta AI', 'Segmentar qualquer objeto com um clique; o CVAT passou a usar modelos assim para acelerar a anotação.'],
]

function Tabela({ titulo, linhas }: { titulo: string; linhas: Marco[] }) {
  return (
    <table className="tbl">
      <caption>{titulo}</caption>
      <thead><tr><th>ano</th><th>o quê</th><th>quem</th><th>para quê</th></tr></thead>
      <tbody>{linhas.map((l) => <tr key={l[0] + l[1]}><td>{l[0]}</td><td><b>{l[1]}</b></td><td>{l[2]}</td><td>{l[3]}</td></tr>)}</tbody>
    </table>
  )
}

export const blocoHistoria: Bloco = {
  id: 'bH',
  cod: '',
  titulo: 'Linha do tempo: de onde vieram as técnicas, o CVAT e o YOLO',
  min: 0,
  tipo: 'conceito',
  slides: [
    { titulo: 'Do perceptron às redes profundas', img: 'timeline_classica', notas: 'Percorrer da esquerda para a direita: cada técnica nasceu de um problema concreto (dígitos de cheques, rostos em câmeras, pedestres).' },
    { titulo: 'O que mudou em 2012', img: 'timeline_classica', pontos: ['ImageNet: milhões de fotos rotuladas', 'GPUs baratas', 'AlexNet vence com folga', 'As características passam a ser aprendidas'] },
    { titulo: 'A família YOLO e as ferramentas', img: 'timeline_yolo', notas: 'Destacar que o YOLO começou num laboratório universitário e hoje é mantido por várias equipes; os números das versões não são uma sequência de um único autor.' },
    { titulo: 'YOLO: “você só olha uma vez”', img: 'grade_yolo', pontos: ['2016: Joseph Redmon e colegas', 'Detectar em tempo real', 'Uma passada pela imagem, em vez de milhares de regiões'] },
    { titulo: 'Quem mantém o YOLO hoje', img: 'timeline_yolo', pontos: ['Redmon parou em 2020 (uso militar e privacidade)', 'v4 e v7: Wang, Bochkovskiy, Liao', 'v5, v8, YOLO11 e YOLO26: Ultralytics', 'v10: Tsinghua · v12: Tian et al.'] },
    { titulo: 'YOLO26', img: 'real_tres_tarefas', pontos: ['Ultralytics, lançado em jan/2026', 'Dispensa o NMS na inferência', 'Mais rápido em CPU, celular e Raspberry Pi', 'Detecção, segmentação e classificação'] },
    { titulo: 'CVAT: nasceu de uma necessidade', img: 'cvat/image013_detrac', legenda: 'Editor do CVAT (documentação oficial)', pontos: ['Intel precisava anotar muitos vídeos', 'Código aberto no GitHub em 2018', 'Desde 2022: CVAT.ai, licença MIT', 'Hoje usa modelos como o SAM para pré-anotar'] },
  ],
  teoria: (
    <>
      <p>
        Nenhuma das técnicas desta aula surgiu do nada. Cada uma foi criada por alguém, num lugar e numa época, para resolver um problema concreto, quase sempre fora da agricultura:
        ler cheques, achar rostos, contar pedestres, rotular milhões de fotos. Saber essa história ajuda a entender por que as ferramentas são como são, e por que as perguntas da
        agricultura (objetos pequenos, cenas cheias, luz de campo) continuam desafiando os modelos.
      </p>
      <h4>Antes do aprendizado profundo</h4>
      <p>
        Até o começo dos anos 2010, o projetista escolhia as características à mão: cor, borda, textura, forma. O perceptron já existia desde 1958, e as redes convolucionais desde
        os anos 1990, mas faltavam duas coisas: muitos exemplos rotulados e computação barata. O ImageNet resolveu a primeira em 2009, as placas de vídeo (GPUs) resolveram a segunda, e
        em 2012 a AlexNet mostrou que uma rede convolucional vencia os métodos clássicos por larga margem.
      </p>
      <Tabela titulo="Quadro 3. Técnicas clássicas e o início das redes profundas." linhas={CLASSICOS} />
      <h4>A família YOLO</h4>
      <p>
        O YOLO (<i>You Only Look Once</i>, “você só olha uma vez”) foi criado em 2016 por Joseph Redmon e colegas, na Universidade de Washington, para detectar objetos em tempo real:
        em vez de examinar milhares de regiões candidatas, como a família R-CNN, a rede olha a imagem inteira uma única vez. Redmon publicou as versões 2 e 3 e, em 2020, anunciou que
        deixava a pesquisa em visão computacional por preocupação com usos militares e com a privacidade. A partir daí, o nome passou a ser usado por grupos diferentes: as versões não
        são uma sequência de um único autor, e um número maior não significa, por si só, um modelo melhor para o seu problema.
      </p>
      <Tabela titulo="Quadro 4. A família YOLO." linhas={YOLOS} />
      <h4>As ferramentas de anotação e o CVAT</h4>
      <p>
        Modelos que aprendem com exemplos precisam de exemplos anotados, e anotar é caro. O CVAT foi criado dentro da Intel, a partir de 2017, porque a própria equipe precisava rotular
        grandes volumes de imagens e vídeos para treinar seus modelos. O código foi aberto no GitHub em 2018 e, desde 2022, é mantido pela CVAT.ai, empresa formada pela equipe original,
        com licença MIT.
      </p>
      <Tabela titulo="Quadro 5. Ferramentas de anotação e marcos recentes." linhas={FERRAMENTAS} />
    </>
  ),
  exemplo: (
    <>
      <Fig n="timeline_classica" cap="Do perceptron às redes profundas. Acima, técnicas; abaixo, conjuntos de dados e ferramentas que tornaram o aprendizado possível." />
      <Fig n="timeline_yolo" cap="A família YOLO e as ferramentas de anotação, de 2015 a 2026. O nome YOLO passou por vários grupos depois de 2020." />
      <Callout kind="campo" title="E a agricultura?">
        <p>Nenhuma dessas técnicas nasceu para o campo. Quando chegam à lavoura, encontram objetos pequenos, parecidos com o fundo, encostados uns nos outros e sob luz que muda o dia todo. É por isso que os trabalhos da UTFPR desta aula gastam tanto esforço em anotação e em testar o modelo em outro lugar.</p>
      </Callout>
    </>
  ),
  pratica: (
    <>
      <p><b>Em duplas.</b> Escolher uma técnica da linha do tempo e responder em três frases: que problema ela resolvia, por que não resolvia bem o problema agrícola da dupla e o que veio depois para corrigir isso.</p>
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'Por que as redes convolucionais, que existiam desde os anos 1990, só se popularizaram depois de 2012?', r: <p>Faltavam muitos exemplos rotulados (o ImageNet veio em 2009) e computação barata (as GPUs). Com os dois, a AlexNet mostrou a vantagem em 2012.</p> },
    { nivel: 'médio', q: 'O YOLO26 tem um número maior que o YOLO v12. Isso garante que ele seja melhor para contar cachos de uva?', r: <p>Não. As versões vêm de grupos diferentes, com objetivos diferentes (o YOLO26 prioriza velocidade em CPU e borda). A única forma de saber é testar os dois no próprio conjunto de dados.</p> },
  ],
}
