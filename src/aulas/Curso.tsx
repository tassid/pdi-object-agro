import type { Aula, Bloco } from '../curso'
import { aula1 } from './Aula1'
import { aula2 } from './Aula2'
import { blocoClsSeg, blocoTarefas } from './tarefas'
import { blocoClassicos } from './classicos'
import { blocoHistoria } from './historia'
import { blocoFrutas } from './frutas'
import { PROF_TAREFAS } from './prof'

/* Aula única. Os blocos vêm das antigas Aula 1 e Aula 2, sem repetições,
   mais dois blocos sobre as tarefas (classificação, detecção e segmentação). */

const pega = (id: string, min: number): Bloco => {
  const b = [...aula1.blocos, ...aula2.blocos, blocoTarefas, blocoClsSeg, blocoClassicos, blocoHistoria, blocoFrutas].find((x) => x.id === id)
  if (!b) throw new Error(`bloco ${id} não encontrado`)
  return { ...b, min, prof: PROF_TAREFAS[id] ?? b.prof }
}

const ordem: [string, number][] = [
  ['b10', 0], ['bH', 0], ['bT1', 0], ['bC', 0], ['b12', 0], ['b13', 0], ['b14', 0], ['b15', 0], ['b21', 0],
  ['b22', 0], ['b23', 0], ['bT2', 0], ['b24', 0], ['b25', 0], ['b26', 0], ['bF', 0], ['b27', 0],
]

const blocos = ordem.map(([id, min], i) => ({ ...pega(id, min), cod: String(i + 1) }))

const unico = <T,>(xs: T[], k: (x: T) => string) => xs.filter((x, i) => xs.findIndex((y) => k(y) === k(x)) === i)

export const curso: Aula = {
  id: 'curso',
  n: 1,
  titulo: 'Detecção de objetos em imagens agrícolas com CVAT e YOLO',
  ideia:
    'Continuação da Aula 5. A aula parte do sistema clássico de reconhecimento de padrões, mostra as diferenças entre classificação, detecção e segmentação com exemplos clássicos e com YOLO, prepara os dados (formatos, IoU, NMS, anotação no CVAT, auditoria e partição) e termina na prática: montar o Colab, treinar e ler um YOLO, contar, rastrear, exportar, testar em outro lugar e comparar com trabalhos reais da UTFPR.',
  chips: ['classificação', 'detecção', 'segmentação semântica e de instâncias', 'CVAT', 'YOLO', 'formatos de anotação', 'IoU e NMS', 'protocolo de anotação', 'partição por grupo', 'Google Colab', 'métricas', 'contagem', 'rastreamento', 'mudança de domínio', 'trabalhos da UTFPR'],
  objetivos: [
    'Relacionar o sistema clássico da Aula 5 (características, limiar, fronteira de decisão, taxas de erro) à detecção de objetos e às métricas de precisão e revocação.',
    'Distinguir classificação, detecção, segmentação semântica e segmentação de instâncias, e escolher a tarefa, a ferramenta do CVAT e o modelo YOLO adequados a uma pergunta agrícola.',
    'Ler caixas nos formatos xyxy, COCO e YOLO e explicar o que medem o IoU, o NMS e o limiar de confiança.',
    'Anotar no CVAT com um protocolo explícito, auditar os rótulos e particionar os dados por grupo de coleta, sem vazamento.',
    'Montar um notebook do Colab e treinar YOLO de detecção, classificação e segmentação a partir de pesos pré-treinados.',
    'Ler os resultados do treino (results.png, precisão, revocação, mAP, acerto) e escolher o limiar de confiança na validação.',
    'Usar o modelo para contar em fotos e vídeos, exportá-lo e testá-lo em dados de outro lugar, classificando os erros.',
    'Situar as técnicas na história: quem criou o perceptron, as redes convolucionais, o CVAT e o YOLO, e para resolver que problema.',
    'Reconhecer essas mesmas etapas e decisões em trabalhos reais da UTFPR.',
    'Montar um projeto completo com YOLO26 e dados do Hugging Face: contar frutas, identificar a fruta e dizer se está sadia ou estragada.',
  ],
  encontros: [],
  intervalos: [],
  blocos,
  notebooks: [
    {
      nome: 'CVAT_YOLO_na_pratica.ipynb',
      arquivo: 'CVAT_YOLO_na_pratica.ipynb',
      descricao: 'O notebook da aula, do dado anotado ao modelo em uso: preparar o Colab, carregar o WGISD ou o export do CVAT, conferir os rótulos, separar os conjuntos, treinar, ler os resultados, contar, rastrear, exportar, testar em outro lugar e fazer também classificação e segmentação.',
    },
  ],
  quiz: [...aula1.quiz, ...aula2.quiz],
  artigos: unico([...aula2.artigos, ...aula1.artigos], (a) => a.link),
  entregas: [
    <><b>Protocolo de anotação</b> da dupla, com pelo menos cinco casos-limite ilustrados e a concordância entre anotadores.</>,
    <><b>Conjunto exportado do CVAT e auditado</b>, com o registro da partição por grupo e a verificação de que nenhum grupo aparece em dois conjuntos.</>,
    <><b>Notebook</b> baseado no do encontro 2, rodando do início ao fim com os dados da dupla e com o registro do experimento.</>,
    <><b>Leitura dos resultados</b>: results.png comentado, precisão, revocação, mAP50 e erro de contagem na validação, e o limiar escolhido com justificativa.</>,
    <><b>Teste em outro lugar</b> (fotos nunca usadas no treino) e <b>dez erros analisados</b>, com recorte e causa provável.</>,
    <><b>Justificativa da tarefa</b>: por que detecção (ou classificação, ou segmentação) responde à pergunta do projeto.</>,
    <><b>Ficha de um trabalho da UTFPR</b> e demonstração do modelo em fotos ou vídeo.</>,
  ],
  limitacoes: unico([...aula1.limitacoes, ...aula2.limitacoes], (x) => String((x as { props?: { children?: unknown } }).props?.children ?? x)),
  referencias: unico([...aula1.referencias, ...aula2.referencias,
    'SA, I.; GE, Z.; DAYOUB, F.; UPCROFT, B.; PEREZ, T.; McCOOL, C. DeepFruits: a fruit detection system using deep neural networks. Sensors, v. 16, n. 8, 1222, 2016. DOI: 10.3390/s16081222.',
    'PROJECT AGML. Fresh rotten fruit classification. Hugging Face, 2024. Disponível em: https://huggingface.co/datasets/Project-AgML/fresh_rotten_fruit_classification. Licença CC BY 4.0.',
    'ULTRALYTICS. Ultralytics YOLO26. Documentação, 2026. Disponível em: https://docs.ultralytics.com/models/yolo26/.',
    'CVAT.AI. Computer Vision Annotation Tool (CVAT). Software livre, licença MIT. Disponível em: https://github.com/cvat-ai/cvat.',
    'REDMON, J.; FARHADI, A. YOLOv3: an incremental improvement. arXiv, 1804.02767, 2018.',
    'KRIZHEVSKY, A.; SUTSKEVER, I.; HINTON, G. E. ImageNet classification with deep convolutional neural networks. In: ADVANCES IN NEURAL INFORMATION PROCESSING SYSTEMS (NIPS), 2012. Proceedings [...]. 2012. p. 1097-1105.',
    'ROSENBLATT, F. The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review, v. 65, n. 6, p. 386-408, 1958.',
  ], (r) => r.slice(0, 40)),
  prof: {
    preparo: [...aula1.prof.preparo, ...aula2.prof.preparo],
    planoB: [...aula1.prof.planoB, ...aula2.prof.planoB],
    avaliacao: aula2.prof.avaliacao,
  },
}
