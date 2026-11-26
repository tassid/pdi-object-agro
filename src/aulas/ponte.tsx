import type { Bloco } from '../curso'
import { Fig, M, MM, Thm } from '../curso'
import { Callout, Code } from '../ui'

/* Bloco 1.0: retomada da Aula 5 (Reconhecimento de Padrões, Prof. Pedro Luiz de Paula Filho) */

export const blocoPonte: Bloco = {
  id: 'b10',
  cod: '1.0',
  titulo: 'Da Aula 5 à detecção de objetos',
  min: 30,
  tipo: 'conceito',
  slides: [
    { titulo: 'Onde paramos na Aula 5', img: 'aula5/s17', legenda: 'Aula 5, slide 17 (Prof. Pedro Luiz de Paula Filho)', pontos: ['Sistema clássico: aquisição → pré-processamento → segmentação → características → classificação', 'O objeto chega à classificação já isolado', 'O projetista escolhe as características'], notas: 'Mostrar o slide original da Aula 5 e perguntar: quem decidiu que “tamanho” e “cor” eram as características certas? Essa pergunta guia o resto do dia.' },
    { titulo: 'Salmão e robalo com dados reais', img: 'aula5_limiar_cachos', legenda: 'WGISD: 814 cachos anotados', pontos: ['Uma característica: brilho médio do cacho', 'Limiar de menor erro: t* ≈ 0,54 (26% de erro)', 'Limiar de menor custo: desloca a fronteira', 'Mesmo raciocínio do slide 27 da Aula 5'], notas: 'Os histogramas são reais: cada barra conta cachos anotados no WGISD. A Syrah foi fotografada antes da maturação, por isso quase não difere da Chardonnay. Perguntar que outra característica ajudaria.' },
    { titulo: 'Fronteiras: simples, linear, complexa', img: 'aula5_fronteiras_cachos', pontos: ['Subajuste: erro alto no treino e no teste', 'Linear (perceptron): melhor erro de teste', 'Sobreajuste: erro de treino 0%, teste pior', 'Generalizar é o objetivo (Aula 5, slides 35–36)'], notas: 'Os três erros foram calculados com 60% dos cachos para treino e 40% para teste. Destacar que o 1-NN decora o treino.' },
    { titulo: 'Das taxas da Aula 5 às métricas de detecção', tex: String.raw`\text{Confiabilidade}=\frac{N_{rec}}{N_{rec}+N_{err}}\;\longleftrightarrow\;P=\frac{VP}{VP+FP}`, pontos: ['Taxa de reconhecimento ↔ revocação (com rejeição)', 'Confiabilidade ↔ precisão', 'Em detecção, um objeto não encontrado vira FN', 'Uma caixa onde não há objeto vira FP'], notas: 'Ligação explícita com o slide 38 da Aula 5. A rejeição corresponde, em detecção, às previsões abaixo do limiar de confiança.' },
    { titulo: 'O que muda: o objeto não vem recortado', img: 'aula5_recorte_vs_deteccao', pontos: ['Onde está? (localização)', 'O que é? (classe)', 'Quantos são? (contagem)', 'A rede aprende as características a partir de exemplos anotados'] },
    { titulo: 'Roteiro das duas aulas', pontos: [['Aula 1: dados', ['tarefas, arquiteturas, formatos', 'IoU, NMS, GSD', 'protocolo no CVAT, auditoria e partição']], ['Aula 2: YOLO na prática', ['montar o Colab e treinar na GPU', 'ler resultados, contar, rastrear, exportar', 'testar em outro lugar e trabalhos da UTFPR']]] },
  ],
  teoria: (
    <>
      <h4>O sistema clássico de reconhecimento de padrões</h4>
      <p>
        Na Aula 5, um sistema de reconhecimento de padrões foi descrito como a composição de um sensor, de um mecanismo de extração de características e de um classificador. No exemplo
        da indústria de pescado, a câmera adquire a imagem do peixe na esteira, o pré-processamento e a segmentação isolam o objeto, e o classificador decide entre salmão e robalo a
        partir de medidas como comprimento, largura e luminosidade (DUDA; HART; STORK, 2001). O ponto central é que <b>o objeto chega isolado</b> à etapa de classificação, e que as
        características são <b>escolhidas pelo projetista</b>.
      </p>
      <Thm k="def" n="1" nome="regra de decisão por limiar">
        Seja <M t="x" /> uma característica escalar e <M t="\omega_1, \omega_2" /> duas classes. A regra de limiar atribui <M t="\omega_2" /> quando <M t="x \geq t" /> e{' '}
        <M t="\omega_1" /> caso contrário. O limiar de menor erro minimiza
      </Thm>
      <MM n="1" t={String.raw`E(t) = P(x \geq t \mid \omega_1)\,P(\omega_1) + P(x < t \mid \omega_2)\,P(\omega_2).`} />
      <p>
        Quando os erros têm custos diferentes, como no exemplo em que salmão embalado com robalo é aceitável mas o contrário não, minimiza-se o custo esperado, com <M t="c_{12}" /> o
        custo de decidir <M t="\omega_2" /> sendo <M t="\omega_1" /> e <M t="c_{21}" /> o custo inverso:
      </p>
      <MM n="2" t={String.raw`C(t) = c_{12}\,P(x \geq t \mid \omega_1)\,P(\omega_1) + c_{21}\,P(x < t \mid \omega_2)\,P(\omega_2).`} />
      <p>
        Com mais de uma característica, a regra passa a ser uma <b>fronteira de decisão</b> no espaço de características. A Aula 5 mostrou que fronteiras muito simples subajustam e
        fronteiras muito complexas sobreajustam: decoram o treino e generalizam mal. O perceptron (slide 31 da Aula 5) é o modelo linear mais simples para essa fronteira.
      </p>
      <h4>Das taxas da Aula 5 às métricas de detecção</h4>
      <p>
        A Aula 5 definiu taxa de reconhecimento, taxa de erro, taxa de rejeição e confiabilidade, esta última como a razão entre reconhecimentos corretos e o total de decisões
        tomadas (reconhecimentos mais erros). Em detecção de objetos, os mesmos conceitos reaparecem com outros nomes: uma caixa prevista que corresponde a um objeto anotado é um
        verdadeiro positivo (VP), uma caixa sem objeto é um falso positivo (FP) e um objeto sem caixa é um falso negativo (FN). A confiabilidade corresponde à <b>precisão</b> e a
        fração de objetos encontrados, à <b>revocação</b>:
      </p>
      <MM n="3" t={String.raw`P = \frac{VP}{VP + FP}, \qquad R = \frac{VP}{VP + FN}.`} />
      <p>
        A rejeição da Aula 5 tem um análogo direto: previsões abaixo do limiar de confiança são descartadas. Aumentar o limiar rejeita mais, eleva a precisão e reduz a revocação. A
        Seção 1.3 retoma esse compromisso com previsões reais.
      </p>
      <h4>O que muda na detecção</h4>
      <p>
        A diferença essencial é o ponto de entrada. O detector recebe a imagem inteira e precisa responder, para cada objeto, onde ele está (uma caixa), o que ele é (uma classe) e com que
        confiança. As características deixam de ser escolhidas pelo projetista e passam a ser aprendidas a partir de exemplos anotados (LECUN; BENGIO; HINTON, 2015). Com isso, o
        principal custo do projeto se desloca do desenho das características para a <b>obtenção e a qualidade dos rótulos</b>, tema da Seção 1.4.
      </p>
    </>
  ),
  exemplo: (
    <>
      <Fig n="aula5/s17" w={720} cap={<>O sistema clássico apresentado na Aula 5 (slide 17, material do Prof. Pedro Luiz de Paula Filho, adaptado de Duda, Hart e Stork).</>} />
      <Thm k="ex" n="1" nome="salmão e robalo com cachos de uva">
        Cada cacho anotado de duas variedades do WGISD (SANTOS et al., 2020) foi recortado pela sua caixa e descrito por uma única característica, o brilho médio <M t="V" /> no
        espaço HSV. A Figura 2 mostra que as distribuições se sobrepõem: o melhor limiar ainda erra cerca de um quarto dos cachos. Se confundir Syrah com Chardonnay custar quatro
        vezes mais, o limiar de menor custo desloca-se para a esquerda e o erro total aumenta, mas o custo diminui, exatamente como no slide 27 da Aula 5.
      </Thm>
      <Fig n="aula5_limiar_cachos" cap={<>Recortes reais e histograma do brilho médio de 402 cachos de Chardonnay e 412 de Syrah (WGISD). Linhas: limiar de menor erro e limiar de menor custo.</>} />
      <Thm k="ex" n="2" nome="subajuste e sobreajuste">
        Com duas características (brilho e saturação), três classificadores foram ajustados em 60% dos cachos e avaliados nos 40% restantes (Figura 3). O modelo constante erra cerca de
        metade; o perceptron obtém o menor erro de teste; o vizinho mais próximo zera o erro de treino e piora no teste.
      </Thm>
      <Fig n="aula5_fronteiras_cachos" cap={<>Fronteiras de decisão com dados reais. Erros de treino e de teste calculados pelo script <code>scripts/figuras_reais.py</code>.</>} />
      <Callout kind="pegadinha" title="Observação">
        <p>As fotos de Syrah do WGISD foram feitas antes da maturação, quando os cachos ainda são verdes. A característica “cor” que parecia óbvia não separa as classes nesse conjunto: o mesmo problema reaparece em detectores treinados numa época do ciclo e usados em outra (Seção 2.5).</p>
      </Callout>
      <Fig n="aula5_recorte_vs_deteccao" cap={<>À esquerda, a entrada típica da Aula 5: um objeto já recortado. À direita, a entrada de um detector: a foto inteira, com todos os cachos anotados.</>} />
    </>
  ),
  pratica: (
    <>
      <p><b>Atividade em duplas (10 min).</b> Reproduzir o histograma da Figura 2 para outra característica (saturação média ou matiz média) e encontrar o limiar de menor erro. Discutir: alguma característica isolada separa as duas variedades?</p>
      <Code title="Python · Colab · característica de cada cacho anotado" code={`import numpy as np, cv2, urllib.request
URL = "https://raw.githubusercontent.com/thsant/wgisd/master/data/"
def cachos(nome):
    urllib.request.urlretrieve(URL + nome + ".jpg", "f.jpg")
    urllib.request.urlretrieve(URL + nome + ".txt", "f.txt")
    img = cv2.cvtColor(cv2.imread("f.jpg"), cv2.COLOR_BGR2HSV); H, W = img.shape[:2]
    for linha in open("f.txt"):
        _, xc, yc, w, h = map(float, linha.split())
        x1, y1 = int((xc - w/2) * W), int((yc - h/2) * H)
        x2, y2 = int((xc + w/2) * W), int((yc + h/2) * H)
        yield img[y1:y2, x1:x2, 1].mean() / 255        # saturação média do cacho

chard = [s for n in ["CDY_2015", "CDY_2017", "CDY_2024"] for s in cachos(n)]
syrah = [s for n in ["SYH_2017-04-27_1232", "SYH_2017-04-27_1236"] for s in cachos(n)]
ts = np.linspace(0, 1, 201)
erro = [(np.sum(np.array(chard) >= t) + np.sum(np.array(syrah) < t)) / (len(chard) + len(syrah)) for t in ts]
print("limiar:", ts[np.argmin(erro)], "erro:", min(erro))`} />
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'Um detector encontrou 45 dos 50 cachos de uma imagem e gerou 5 caixas sem cacho. Calcular precisão e revocação.', r: <p>VP = 45, FN = 5, FP = 5. <M t="P = 45/50 = 0{,}90" /> e <M t="R = 45/50 = 0{,}90" />.</p> },
    { nivel: 'básico', q: 'Relacionar a confiabilidade da Aula 5 à precisão em detecção.', r: <p>Ambas dividem os acertos pelo total de decisões tomadas (acertos mais erros), desconsiderando os casos rejeitados ou não detectados.</p> },
    { nivel: 'médio', q: 'Na Figura 2, por que o limiar de menor custo produz erro total maior que o limiar de menor erro?', r: <p>Ele aceita mais erros baratos (Chardonnay classificada como Syrah) para evitar erros caros (Syrah como Chardonnay). Minimizar o custo esperado (Eq. 2) não é o mesmo que minimizar o número de erros (Eq. 1).</p> },
    { nivel: 'desafio', q: 'Explicar por que o vizinho mais próximo tem erro de treino zero e por que isso não é evidência de bom modelo.', r: <p>Cada ponto de treino é o seu próprio vizinho mais próximo, logo é sempre classificado corretamente. O erro relevante é o de dados não vistos; a Figura 3 mostra que ele piora em relação ao perceptron, caracterizando sobreajuste.</p> },
  ],
}
