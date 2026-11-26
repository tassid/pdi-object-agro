import type { Bloco } from '../curso'
import { Callout } from '../ui'
import { secaoTomate } from '../casos/Tomate'
import { secaoAviario } from '../casos/Aviario'
import { LabSoja, casoSoja } from '../casos/Soja'
import { secaoLaranjeira } from '../casos/Laranjeira'
import { LabCitros, casoCitros, codeCitros } from '../casos/Citros'

/* Exemplos trazidos do site anterior (pdi-agro, archive/site-v1): cada tarefa resolvida com PDI clássico,
   em trabalhos reais, com laboratórios que rodam no navegador. */

export const blocoClassicos: Bloco = {
  id: 'bC',
  cod: '',
  titulo: 'As mesmas tarefas sem rede neural: cinco casos reais',
  min: 0,
  tipo: 'lab',
  slides: [
    { titulo: 'Antes do YOLO', pontos: ['Classificar, contar e segmentar já eram feitos com PDI clássico', 'Cor, limiar, morfologia, contornos', 'O projetista escolhe cada regra'] },
    { titulo: 'Classificação clássica: tomates pela cor', pontos: ['Artigo da UNIARA (Revista FT)', 'Tabela de faixas de matiz (HSV) por cor', 'Uma pegadinha: H em graus × H do OpenCV'] },
    { titulo: 'Contagem clássica: frangos no aviário', pontos: ['TCC da UTFPR Medianeira (orientação: Prof. Pedro)', 'Subtração de fundo e limiar', 'Pixels brancos ÷ área de uma ave'] },
    { titulo: 'Contagem clássica: plantas de soja por drone', pontos: ['Artigo em Energia na Agricultura', 'Falhas e duplas na linha de plantio', 'Resolução do voo decide o que se vê'] },
    { titulo: 'Segmentação clássica: doença em folhas de laranjeira', pontos: ['TCC da UTFPR Medianeira (coorientação: Prof. Pedro)', 'Área de lesão ÷ área da folha', 'Da folha ao mapa do pomar'] },
    { titulo: 'Segmentação treinável: cobertura do solo em citros', pontos: ['Boletim da Embrapa Mandioca e Fruticultura', 'O usuário pinta exemplos e um classificador aprende os pixels', 'Um passo entre o clássico e a rede neural'] },
    { titulo: 'O que muda com o YOLO', pontos: ['As regras saem da cabeça do projetista e vêm dos exemplos anotados', 'O trabalho se desloca para a anotação (CVAT)', 'A avaliação continua igual: comparar com a verdade'] },
  ],
  teoria: (
    <>
      <p>
        Cada uma das tarefas já era resolvida antes das redes neurais, com as ferramentas de processamento de imagens vistas nas aulas anteriores: espaços de cor, limiares, morfologia,
        contornos e descritores. Os cinco casos desta seção são trabalhos reais, três deles do Oeste do Paraná, e cada um vem com um laboratório que roda no navegador sobre uma cena
        sintética montada para imitar as condições do trabalho.
      </p>
      <table className="tbl">
        <caption>Quadro 2. Os casos clássicos organizados pela tarefa que resolvem.</caption>
        <thead><tr><th>tarefa</th><th>caso</th><th>como o trabalho resolveu</th><th>o que um YOLO faria</th></tr></thead>
        <tbody>
          <tr><td>classificação</td><td>tomates por cor</td><td>faixas de matiz em HSV escolhidas à mão</td><td><code>yolo11n-cls</code> com fotos de cada classe</td></tr>
          <tr><td>detecção / contagem</td><td>frangos no aviário</td><td>subtração de fundo, limiar e pixels ÷ área da ave</td><td><code>yolo11n</code> com uma caixa por ave</td></tr>
          <tr><td>detecção / contagem</td><td>plantas de soja</td><td>canal de cor, limiar e distância entre plantas</td><td><code>yolo11n</code> com uma caixa por planta</td></tr>
          <tr><td>segmentação</td><td>lesões em folhas de laranjeira</td><td>limiar de cor e razão de áreas</td><td><code>yolo11n-seg</code> ou U-Net</td></tr>
          <tr><td>segmentação</td><td>cobertura do solo em citros</td><td>classificador de pixels treinado com exemplos pintados</td><td>U-Net (segmentação semântica)</td></tr>
        </tbody>
      </table>
      <Callout kind="campo" title="Por que olhar para trás">
        <p>Os métodos clássicos continuam úteis: rodam em qualquer computador, não pedem milhares de anotações e servem como linha de base. Se o YOLO não superar a regra simples, algo está errado nos dados.</p>
      </Callout>
    </>
  ),
  exemplo: (
    <>
      <h4>Classificação: tomates pela cor</h4>
      {secaoTomate.body}
      <h4>Contagem: frangos no aviário</h4>
      {secaoAviario.body}
      <h4>Contagem: plantas de soja vistas de um drone</h4>
      <div className="prose">
        {casoSoja}
        <LabSoja />
      </div>
      <h4>Segmentação: doença em folhas de laranjeira</h4>
      {secaoLaranjeira.body}
      <h4>Segmentação treinável: cobertura do solo em pomares de citros</h4>
      <div className="prose">
        {casoCitros}
        <LabCitros />
        {codeCitros}
      </div>
    </>
  ),
  pratica: (
    <>
      <p><b>Em duplas.</b> Escolher um dos cinco laboratórios, encontrar uma situação em que a regra clássica falha (mude luz, câmera ou densidade) e responder:</p>
      <ol>
        <li>Que tarefa o trabalho resolve, e que ferramenta do CVAT seria usada para anotar o mesmo problema?</li>
        <li>Quantas imagens anotadas seriam necessárias para substituir a regra por um YOLO? De onde viriam?</li>
        <li>A regra clássica ainda serve como linha de base? Como compará-la com o modelo?</li>
      </ol>
    </>
  ),
  exercicios: [
    { nivel: 'básico', q: 'No caso do aviário, por que contar contornos falha quando as aves se encostam?', r: <p>Aves encostadas formam uma única mancha branca, que vira um único contorno. Um detector treinado com caixas separadas aprende a separar indivíduos encostados.</p> },
    { nivel: 'médio', q: 'A tabela de cores dos tomates foi feita com peças coloridas, não com tomates. Que risco isso traz para um classificador treinado?', r: <p>O mesmo da mudança de domínio: o modelo aprende com uma condição e é usado em outra. Fotos reais de tomates, em várias luzes, deveriam entrar no treino e no teste.</p> },
  ],
}
