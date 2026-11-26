import type { TrabalhoSpec } from './curso'

/* Trabalhos de conclusão e dissertações da UTFPR, obtidos no Repositório Institucional (RIUT).
   Os prints em public/artigos/<id>_*.jpg foram recortados das páginas indicadas do PDF original.
   Números entre aspas vêm do resumo do próprio trabalho. */

const pdf = (id: string, arq: string) => `https://repositorio.utfpr.edu.br/jspui/bitstream/1/${id}/1/${arq}`

export const T: Record<string, TrabalhoSpec> = {
  mosca: {
    id: '36152',
    titulo: 'Sistema automatizado de detecção de mosca-das-frutas com rede neural convolucional',
    autor: 'MEDEIROS, Tito Alex',
    tipo: 'Dissertação (Mestrado), Programa de Pós-Graduação em Tecnologias Computacionais para o Agronegócio',
    onde: 'UTFPR Medianeira',
    ano: 2025,
    orientacao: 'Pedro Luiz de Paula Filho; coorientação: Claudio Leones Bazzi',
    pdf: pdf('36152', 'sistemaautomatizadoredeneural.pdf'),
    prints: [
      { p: 'p53', cap: 'Imagem original e imagem anotada da armadilha McPhail.' },
      { p: 'p56', cap: 'Detecções do YOLO na região de interesse da armadilha.' },
      { p: 'p55', cap: 'Curvas de perda de caixa e de segmentação ao longo do treino.' },
      { p: 'p62', cap: 'Exemplo de falso positivo em campo.' },
    ],
    resumo: (
      <p>
        Integra a armadilha McPhail a uma câmera e a um Raspberry Pi com YOLOv8 para registrar moscas-das-frutas em campo, com energia solar e registros georreferenciados. O resumo
        informa “mAP50 de 95%” e “recall de 90%”. É a referência mais próxima desta disciplina: mesmo programa (PPGTCA), mesmo orientador da Aula 5 e o mesmo fluxo anotar → treinar
        → avaliar → embarcar.
      </p>
    ),
    discutir: [
      'As imagens de teste vieram de armadilhas e datas diferentes das usadas no treino? Como isso foi controlado?',
      'O mAP50 de 95% foi medido em laboratório ou em campo? Qual dos dois interessa ao produtor?',
      'O falso positivo da p. 62 sugere qual critério adicional no protocolo de anotação?',
      'A contagem de moscas por armadilha é a variável de decisão. Que métrica de contagem complementaria o mAP?',
    ],
  },
  florestais: {
    id: '40855',
    titulo: 'Comparação de modelos de edge-computing no reconhecimento de espécies florestais através de segmentação de instância',
    autor: 'OSOWSKI, Isabela Yasmim',
    tipo: 'Trabalho de Conclusão de Curso, Bacharelado em Ciência da Computação',
    onde: 'UTFPR Medianeira',
    ano: 2025,
    orientacao: 'Pedro Luiz de Paula Filho; coorientação: Roque Cielo Filho',
    pdf: pdf('40855', 'comparacaomodelosreconhecimentoespecies.pdf'),
    prints: [
      { p: 'p54', cap: 'Máscaras anotadas de folhas (abacateiro e pau-brasil).' },
      { p: 'p56', cap: 'Anotação, previsão do YOLO nano, interseção e diferença.' },
    ],
    resumo: (
      <p>
        Compara YOLOv12 nano e Mask2Former na segmentação de instâncias de folhas de 36 espécies do Oeste do Paraná, com fundos complexos e iluminação variada, pensando em execução
        em dispositivos de borda. Útil para discutir quando a máscara (e não só a caixa) é necessária.
      </p>
    ),
    discutir: [
      'Por que segmentação de instâncias e não detecção? O que a máscara acrescenta à identificação da espécie?',
      'Fundos complexos foram incluídos de propósito. Que efeito isso tem sobre a generalização?',
      'Como garantir que folhas da mesma árvore não fiquem em treino e teste ao mesmo tempo?',
    ],
  },
  gado: {
    id: '41807',
    titulo: 'Uso de visão computacional e drone para contagem automatizada de gado: uma abordagem baseada com YOLOv8',
    autor: 'MASCARO JUNIOR, Paulo Roberto',
    tipo: 'Trabalho de Conclusão de Curso, Engenharia de Computação',
    onde: 'UTFPR Cornélio Procópio',
    ano: 2025,
    orientacao: 'Claiton de Oliveira; coorientação: Henrique Yoshikazu Shishido',
    pdf: pdf('41807', 'usodevisaocomputacional.pdf'),
    prints: [
      { p: 'p20', cap: 'Rotulagem das imagens de drone (classe única “gado”).' },
      { p: 'p22', cap: 'Resultado da detecção com YOLOv8.' },
      { p: 'p26', cap: 'Excesso de contagem: caixas duplicadas em animais agrupados.' },
    ],
    resumo: (
      <p>
        Imagens de um DJI Mini 2 anotadas no Roboflow com uma única classe; YOLOv8 treinado e avaliado por mAP50, precisão e revocação. O resumo informa “mAP50 de 93.7%” e discute
        limitações de diversidade do conjunto. A figura de excesso de contagem é um exemplo real do papel do NMS e do limiar de confiança (na seção sobre IoU e NMS).
      </p>
    ),
    discutir: [
      'Na figura de excesso de contagem, que ajuste de limiar (confiança ou IoU do NMS) reduziria as duplicatas, e com que custo?',
      'Com uma única classe e um único voo, o que se pode afirmar sobre outra fazenda, outra raça ou outra altura?',
      'Que medida de erro de contagem por imagem deveria acompanhar o mAP50?',
    ],
  },
  daninhas: {
    id: '41609',
    titulo: 'Detector de daninhas de baixo custo baseado em métodos inteligentes',
    autor: 'SAITO, Luigi Lista',
    tipo: 'Trabalho de Conclusão de Curso, Engenharia de Controle e Automação',
    onde: 'UTFPR Cornélio Procópio',
    ano: 2025,
    orientacao: 'Ruhan Pontes Policarpo de Souza',
    pdf: pdf('41609', 'detectordaninhasmetodosinteligentes.pdf'),
    prints: [
      { p: 'p38', cap: 'Detecções qualitativas do YOLO no conjunto de teste.' },
      { p: 'p37', cap: 'Curva F1 em função do limiar de confiança.' },
      { p: 'p50', cap: 'Falso positivo em campo: área limpa confundida com daninha.' },
    ],
    resumo: (
      <p>
        Protótipo com Raspberry Pi Zero 2 W e CNN para separar daninha de cultura, com dados públicos e coleta própria e validação em campo. Traz a curva F1 × confiança gerada pelo
        Ultralytics, a mesma que a turma obtém ao ler os resultados do treino, e um falso positivo real de campo.
      </p>
    ),
    discutir: [
      'Qual limiar de confiança a curva F1 sugere? Ele foi escolhido na validação ou no teste?',
      'O falso positivo de campo é um problema de dados (domínio) ou de modelo? Que dados resolveriam?',
      'Para um pulverizador, é pior um falso positivo ou um falso negativo? Como isso muda o limiar?',
    ],
  },
  soja: {
    id: '34166',
    titulo: 'Sistema para classificação automática de grãos de soja baseado em visão computacional',
    autor: 'ALMEIDA, Jacqueline Marques Lara de',
    tipo: 'Dissertação (Mestrado), Programa de Pós-Graduação em Computação Aplicada',
    onde: 'UTFPR Curitiba',
    ano: 2024,
    orientacao: 'Bogdan Tomoyuki Nassu',
    pdf: pdf('34166', 'sistemaclassificacaoautomaticasoja.pdf'),
    prints: [
      { p: 'p49', cap: 'Sobreposição entre a máscara de referência e a previsão da U-Net.' },
      { p: 'p55', cap: 'Previsão da YOLO V4 sobre uma amostra de grãos.' },
      { p: 'p48', cap: 'Evolução da função de perda ao longo das épocas (YOLO V4).' },
    ],
    resumo: (
      <p>
        Grãos ardidos, mofados e queimados: compara U-Net (segmentação) seguida de PDI, YOLO V4 (detecção) e classificadores EfficientNet B1 e MobileNet V1, concluindo por uma
        abordagem em cascata. Mostra as três tarefas da disciplina num mesmo problema agroindustrial.
      </p>
    ),
    discutir: [
      'Por que uma cascata (detectar e depois classificar) pode superar um detector com várias classes?',
      'Em que situação a U-Net seria preferível à YOLO para este problema?',
      'Como a separação entre lotes de grãos foi tratada na divisão treino/teste?',
    ],
  },
  alface: {
    id: '33800',
    titulo: 'Desenvolvimento de manejo de alface em hidroponia por rede neural artificial convolucional',
    autor: 'LEAL, Eduardo Ribeiro Pereira',
    tipo: 'Dissertação (Mestrado), Programa de Pós-Graduação em Tecnologias Computacionais para o Agronegócio',
    onde: 'UTFPR Medianeira',
    ano: 2024,
    orientacao: 'Deborah Catharine de Assis Leite; coorientação: Glauco Vieira Miranda',
    pdf: pdf('33800', 'manejoalfacehidroponia.pdf'),
    prints: [{ p: 'p78', cap: 'Detecções da YOLO V4 nas bancadas de alface hidropônica.' }],
    resumo: (
      <p>
        Alface crespa em hidroponia (Santa Helena, PR) submetida a falhas controladas de irrigação, com delineamento inteiramente casualizado e CNNs para detectar e classificar o
        estresse. Exemplo do PPGTCA em que o delineamento experimental agronômico define os grupos de coleta.
      </p>
    ),
    discutir: ['Os tratamentos e repetições do delineamento devem orientar a partição treino/teste? Como?', 'Imagens sequenciais da mesma câmera são independentes?'],
  },
  confinamento: {
    id: '36192',
    titulo: 'Aplicação de técnicas de visão computacional para análise comportamental de animais em confinamento',
    autor: 'FREITAS, Vinícius de Almeida',
    tipo: 'Trabalho de Conclusão de Curso, Engenharia de Software',
    onde: 'UTFPR Dois Vizinhos',
    ano: 2024,
    orientacao: 'Marlon Marcon',
    pdf: pdf('36192', 'visaocomputacionalcomportamentoanimaisconfinamento.pdf'),
    prints: [
      { p: 'p34', cap: 'Classes de comportamento anotadas (adaptado do CBVD).' },
      { p: 'p45', cap: 'Anotações reais (acima) e previsão do YOLOv9 (abaixo).' },
    ],
    resumo: (
      <p>
        Vídeos diurnos e noturnos de gado Holstein, quadros anotados no Roboflow e comparação entre YOLOv8 e YOLOv9 por precisão, revocação e F1. Bom caso para discutir quadros
        de vídeo quase idênticos e vazamento entre treino e teste.
      </p>
    ),
    discutir: ['Quadros consecutivos do mesmo vídeo foram separados por vídeo ou sorteados individualmente?', 'Como definir, no protocolo de anotação, quando “em pé” vira “andando”?'],
  },
  espelho: {
    id: '23712',
    titulo: 'Estudo comparativo de técnicas de detecção do espelho nasal de bovinos',
    autor: 'RAMOS JUNIOR, Jorge Luiz dos Santos',
    tipo: 'Trabalho de Conclusão de Curso, Bacharelado em Sistemas de Informação',
    onde: 'UTFPR Curitiba',
    ano: 2019,
    orientacao: 'Leyza Elmeri Baldo Dorini; coorientação: Ricardo Dutra da Silva',
    pdf: pdf('23712', 'CT_COSIS_2019_2_05.pdf'),
    prints: [
      { p: 'p30', cap: 'Exemplos de anotação de narinas e focinho.' },
      { p: 'p35', cap: 'Detecções do YOLO (vermelho) e do MB-LBP (azul) e falhas do YOLO.' },
    ],
    resumo: (
      <p>
        Compara um classificador em cascata com características MB-LBP (método clássico, Aula 5) e o YOLO na detecção do focinho de bovinos. O resumo informa que o YOLO “obteve
        melhores resultados em todos os cenários” e “taxa de falsas detecções [...] de 0.00%”. Ponte direta entre descritores clássicos e detecção profunda.
      </p>
    ),
    discutir: ['O que o MB-LBP precisa que o projetista defina e o YOLO aprende sozinho?', 'Uma taxa de falsas detecções de 0% diz algo sobre a revocação?'],
  },
  ferrugem: {
    id: '41804',
    titulo: 'Desenvolvimento de metodologia de inteligência artificial para a identificação e contagem de esporos de Phakopsora pachyrhizi',
    autor: 'COSTA, Pedro Lemes',
    tipo: 'Trabalho de Conclusão de Curso, Engenharia da Computação',
    onde: 'UTFPR Cornélio Procópio',
    ano: 2024,
    orientacao: 'Fabrício Martins Lopes',
    pdf: pdf('41804', 'identificacaoesporophakopsora.pdf'),
    prints: [{ p: 'p41', cap: 'Amostra de teste e resultado da detecção do YOLOv3.' }],
    resumo: <p>Detecção precoce da ferrugem asiática da soja pela contagem de esporos em lâminas, comparando versões do YOLO. Exemplo extremo de objetos pequenos (na seção sobre o treino).</p>,
    discutir: ['Por que objetos minúsculos exigem maior resolução de entrada ou fatiamento (SAHI)?'],
  },
  esporos: {
    id: '35659',
    titulo: 'Comparação de modelos de deep learning na detecção de esporos de fungos em lâminas de microscópio',
    autor: 'GUELFI, João Antonio Tafarelo',
    tipo: 'Dissertação (Mestrado), Programa de Pós-Graduação em Informática',
    onde: 'UTFPR Cornélio Procópio',
    ano: 2024,
    orientacao: 'Fabrício Martins Lopes',
    pdf: pdf('35659', 'comparacaodeeplearningesporos.pdf'),
    prints: [{ p: 'p24', cap: 'Detecção de fungos (míldio e oídio) com YOLOv8.' }],
    resumo: <p>Compara modelos de aprendizado profundo para detectar esporos coletados por armadilhas no campo, antes de os sintomas aparecerem nas plantas.</p>,
  },
}
