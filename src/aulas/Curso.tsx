import type { Aula, Bloco } from '../curso'
import { aula1 } from './Aula1'
import { aula2 } from './Aula2'
import { blocoClsSeg, blocoTarefas } from './tarefas'
import { PROF_TAREFAS } from './prof'

/* Curso único em dois encontros de 5 h. Os blocos vêm das antigas Aula 1 e Aula 2, sem repetições,
   mais dois blocos sobre as tarefas (classificação, detecção e segmentação). */

const pega = (id: string, min: number): Bloco => {
  const b = [...aula1.blocos, ...aula2.blocos, blocoTarefas, blocoClsSeg].find((x) => x.id === id)
  if (!b) throw new Error(`bloco ${id} não encontrado`)
  return { ...b, min, prof: PROF_TAREFAS[id] ?? b.prof }
}

const ordem: [string, number][] = [
  // encontro 1: das perguntas aos dados
  ['b10', 30], ['bT1', 50], ['b12', 35], ['b13', 35], ['b14', 50], ['b15', 55], ['b21', 25],
  // encontro 2: do treino ao campo
  ['b22', 45], ['b23', 40], ['bT2', 35], ['b24', 50], ['b25', 45], ['b26', 40], ['b27', 25],
]

const blocos = ordem.map(([id, min], i) => ({ ...pega(id, min), cod: String(i + 1) }))

const unico = <T,>(xs: T[], k: (x: T) => string) => xs.filter((x, i) => xs.findIndex((y) => k(y) === k(x)) === i)

export const curso: Aula = {
  id: 'curso',
  n: 1,
  titulo: 'Detecção de objetos em imagens agrícolas com CVAT e YOLO',
  ideia:
    'Continuação da Aula 5. O primeiro encontro parte do sistema clássico de reconhecimento de padrões, mostra as diferenças entre classificação, detecção e segmentação, e prepara os dados: arquiteturas, formatos, IoU, NMS, anotação no CVAT, auditoria, partição e o notebook no Colab. O segundo encontro é prático: treinar e ler um YOLO, fazer também classificação e segmentação, contar, rastrear, exportar, testar em outro lugar e comparar com trabalhos reais da UTFPR.',
  chips: ['classificação', 'detecção', 'segmentação semântica e de instâncias', 'CVAT', 'YOLO', 'formatos de anotação', 'IoU e NMS', 'protocolo de anotação', 'partição por grupo', 'Google Colab', 'métricas', 'contagem', 'rastreamento', 'mudança de domínio', 'trabalhos da UTFPR'],
  objetivos: [
    'Relacionar o sistema clássico da Aula 5 (características, limiar, fronteira de decisão, taxas de erro) à detecção de objetos e às métricas de precisão e revocação.',
    'Distinguir classificação, detecção, segmentação semântica e segmentação de instâncias, e escolher a tarefa, a ferramenta do CVAT e o modelo YOLO adequados a uma pergunta agrícola.',
    'Converter caixas entre os formatos xyxy, COCO e YOLO, calcular IoU e explicar o efeito do NMS e do limiar de confiança.',
    'Anotar no CVAT com um protocolo explícito, auditar os rótulos e particionar os dados por grupo de coleta, sem vazamento.',
    'Montar um notebook do Colab e treinar YOLO de detecção, classificação e segmentação a partir de pesos pré-treinados.',
    'Ler os resultados do treino (results.png, precisão, revocação, mAP, acerto) e escolher o limiar de confiança na validação.',
    'Usar o modelo para contar em fotos e vídeos, exportá-lo e testá-lo em dados de outro lugar, classificando os erros.',
    'Reconhecer essas mesmas etapas e decisões em trabalhos reais da UTFPR.',
  ],
  encontros: [
    { n: 1, titulo: 'das perguntas aos dados', inicio: 'b10' },
    { n: 2, titulo: 'do treino ao campo', inicio: 'b22' },
  ],
  intervalos: ['b13', 'b22'],
  blocos,
  notebooks: [
    { ...aula1.notebook, nome: `Encontro 1 · ${aula1.notebook.nome}` },
    { ...aula2.notebook, nome: `Encontro 2 · ${aula2.notebook.nome}` },
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
  referencias: unico([...aula1.referencias, ...aula2.referencias], (r) => r.slice(0, 40)),
  prof: {
    preparo: [...aula1.prof.preparo, ...aula2.prof.preparo],
    planoB: [...aula1.prof.planoB, ...aula2.prof.planoB],
    avaliacao: aula2.prof.avaliacao,
  },
}
