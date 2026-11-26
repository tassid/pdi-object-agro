import type { Bloco } from '../curso'
import { Callout } from '../ui'
import { Fig } from '../curso'
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
    { titulo: 'Antes do YOLO', img: 'pipeline_classico', legenda: 'Cadeia clássica sobre o CWFID', pontos: ['Classificar, contar e segmentar já eram feitos com PDI clássico', 'Cor, limiar, morfologia, contornos', 'O projetista escolhe cada regra'] },
    { titulo: 'Classificação clássica: tomates pela cor', img: 'artigos/cl_tomate_p10', legenda: 'Noguti Júnior et al. (2023), Revista FT', pontos: ['Artigo da UNIARA (Revista FT)', 'Tabela de faixas de matiz (HSV) por cor', 'Uma pegadinha: H em graus × H do OpenCV'] },
    { titulo: 'Laboratório: tomates classificados pela tabela HSV', img: 'lab_tomate', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['Mudar câmera e luz e ver qual tomate a tabela erra'] },
    { titulo: 'Contagem clássica: frangos no aviário', img: 'artigos/cl_aviario_p30', legenda: 'Berlanda (2015), UTFPR Medianeira', pontos: ['TCC da UTFPR Medianeira (orientação: Prof. Pedro)', 'Subtração de fundo e limiar', 'Pixels brancos ÷ área de uma ave'] },
    { titulo: 'Laboratório: aves contadas em seis regiões', img: 'lab_aviario', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['Pixels brancos ÷ área de uma ave, região por região'] },
    { titulo: 'Contagem clássica: plantas de soja por drone', img: 'artigos/cl_soja_p6', legenda: 'Souza et al. (2022), Energia na Agricultura', pontos: ['Artigo em Energia na Agricultura', 'Falhas e duplas na linha de plantio', 'Resolução do voo decide o que se vê'] },
    { titulo: 'Laboratório: falhas e duplas na linha de soja', img: 'lab_soja', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['Distância entre plantas vizinhas: longa demais é falha, curta demais é dupla'] },
    { titulo: 'Segmentação clássica: doença em folhas de laranjeira', img: 'artigos/cl_laranjeira_p50', legenda: 'Schenatto (2011), UTFPR Medianeira', pontos: ['TCC da UTFPR Medianeira (coorientação: Prof. Pedro)', 'Área de lesão ÷ área da folha', 'Da folha ao mapa do pomar'] },
    { titulo: 'Laboratório: severidade numa folha', img: 'lab_laranjeira', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['Área das lesões ÷ área da folha'] },
    { titulo: 'Laboratório: da folha ao mapa do pomar', img: 'lab_pomar', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['36 pontos amostrados viram um mapa do pomar'] },
    { titulo: 'Segmentação treinável: cobertura do solo em citros', img: 'artigos/cl_citros_p18', legenda: 'Carvalho e Carvalho (2022), Embrapa', pontos: ['Boletim da Embrapa Mandioca e Fruticultura', 'O usuário pinta exemplos e um classificador aprende os pixels', 'Um passo entre o clássico e a rede neural'] },
    { titulo: 'Laboratório: segmentação treinável', img: 'lab_citros', legenda: 'Captura do laboratório desta seção (cena sintética)', pontos: ['Pintar exemplos, treinar e ver o mapa de cobertura'] },
    { titulo: 'O que muda com o YOLO', img: 'classico_falha', legenda: 'A regra clássica falhando no WGISD', pontos: ['As regras saem da cabeça do projetista e vêm dos exemplos anotados', 'O trabalho se desloca para a anotação (CVAT)', 'A avaliação continua igual: comparar com a verdade'] },
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
      <Fig n="artigos/cl_tomate_p10" w={720} cap="Visão geral do sistema: o tomate passa pela webcam, o notebook classifica a cor e um braço robótico separa o fruto. Reprodução de Noguti Júnior, Santos e Florian (2023), Revista FT, p. 10." />
      <Fig n="artigos/cl_tomate_p11" cap="Interface do sistema e imagem captada pela webcam. Reprodução de Noguti Júnior, Santos e Florian (2023), p. 11." />
      <Fig n="artigos/cl_tomate_p18" w={620} cap="As peças coloridas usadas na avaliação, do verde ao vermelho. Reprodução de Noguti Júnior, Santos e Florian (2023), p. 18." />
      {secaoTomate.body}
      <h4>Contagem: frangos no aviário</h4>
      <Fig n="artigos/cl_aviario_p24" w={720} cap="Quadro original da câmera infravermelha do aviário e a imagem usada como modelo de fundo. Reprodução de Berlanda (2015), UTFPR Medianeira, p. 24." />
      <Fig n="artigos/cl_aviario_p30" cap="À esquerda, a soma das aves pretas com as aves erodidas; à direita, o resultado do Canny e do findContours sobre a imagem erodida. Reprodução de Berlanda (2015), p. 30." />
      <Fig n="artigos/cl_aviario_p33" cap="As janelas do sistema, com as regiões fixas onde as aves são contadas. Reprodução de Berlanda (2015), p. 33." />
      {secaoAviario.body}
      <h4>Contagem: plantas de soja vistas de um drone</h4>
      <Fig n="artigos/cl_soja_p6" cap="Ortomosaico do plantio de soja a 4 km/h, dividido em blocos, com as plantas identificadas pelo modelo. Reprodução de Souza et al. (2022), Energia na Agricultura, p. 6." />
      <Fig n="artigos/cl_soja_p8" cap="O mesmo levantamento no plantio a 8 km/h: com a semeadora mais rápida, aumentam falhas e duplas na linha. Reprodução de Souza et al. (2022), p. 8." />
      <div className="prose">
        {casoSoja}
        <LabSoja />
      </div>
      <h4>Segmentação: doença em folhas de laranjeira</h4>
      <Fig n="artigos/cl_laranjeira_p31" w={620} cap="Ambiente montado para fotografar as folhas com luz controlada. Reprodução de Schenatto (2011), UTFPR Medianeira, p. 31." />
      <Fig n="artigos/cl_laranjeira_p47" w={620} cap="A mesma folha no espaço RGB e no espaço HSL, em que as lesões se destacam. Reprodução de Schenatto (2011), p. 47." />
      <Fig n="artigos/cl_laranjeira_p50" w={720} cap="Folha segmentada e lesões isoladas: a severidade é a área das lesões dividida pela área da folha. Reprodução de Schenatto (2011), p. 50." />
      <Fig n="artigos/cl_laranjeira_p54" w={720} cap="Mapa temático do pomar com a severidade interpolada entre os pontos amostrados. Reprodução de Schenatto (2011), p. 54." />
      {secaoLaranjeira.body}
      <h4>Segmentação treinável: cobertura do solo em pomares de citros</h4>
      <Fig n="artigos/cl_citros_p12" w={640} cap="As duas fases da segmentação treinável: aprender com exemplos marcados e aplicar o modelo a imagens novas. Reprodução de Carvalho e Carvalho (2022), Embrapa, p. 12." />
      <Fig n="artigos/cl_citros_p18" w={560} cap="Treino no Fiji/Weka: o usuário pinta exemplos de gramínea e de outros alvos sobre a imagem do drone. Reprodução de Carvalho e Carvalho (2022), p. 18." />
      <Fig n="artigos/cl_citros_p39" w={620} cap="Resultado final: a cobertura de gramínea estimada automaticamente na entrelinha do pomar. Reprodução de Carvalho e Carvalho (2022), p. 39." />
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
