import type { Aula, Prof } from '../curso'

/* Conteúdo exibido somente em /professor/: roteiro docente por bloco, preparação e plano B. */

type ProfAula = { blocos: Record<string, Prof>; aula: Aula['prof'] }

export function comProf(p: ProfAula, a: Omit<Aula, 'prof'>): Aula {
  return { ...a, prof: p.aula, blocos: a.blocos.map((b) => ({ ...b, prof: p.blocos[b.id] ?? b.prof })) }
}

export const PROF1: ProfAula = {
  aula: {
    preparo: [
      'Criar no CVAT (app.cvat.ai ou instância do laboratório) um projeto com a classe “cacho” e uma tarefa com 20 imagens do WGISD por dupla; gerar os convites com antecedência.',
      'Testar o notebook Aula1_Anotacao_Auditoria_Split.ipynb no Colab da sala, com a versão do Ultralytics que será usada (este material foi testado com 8.3.224).',
      'Separar três imagens ambíguas (cachos contíguos, ocluídos e cortados) para a anotação sem protocolo do Bloco 1.4.',
      'Imprimir ou projetar a ficha de leitura crítica do Bloco 1.6 e abrir os PDFs dos trabalhos da UTFPR (RIUT bloqueia downloads automatizados; abrir pelo navegador).',
      'Levar o PPT da Aula 5 aberto nos slides 17, 27, 35 e 38 para a retomada do Bloco 1.0.',
    ],
    planoB: [
      'Sem internet: as capturas do CVAT e os prints dos trabalhos já estão no site; a anotação pode ser feita em papel sobre as imagens impressas e as caixas medidas com régua (conversão para YOLO no quadro).',
      'CVAT fora do ar: usar o arquivo de rótulos original do WGISD como “anotação da outra dupla” e fazer a auditoria e a partição normalmente.',
      'Colab indisponível: os laboratórios de IoU, NMS, conversão, GSD e partição rodam no próprio navegador.',
    ],
  },
  blocos: {
    b10: {
      roteiro: [
        ['0–8 min', 'Retomar a Aula 5 com o slide 17 original: sistema clássico. Perguntar quem escolheu as características.'],
        ['8–15 min', 'Histograma real dos cachos: limiar de menor erro e de menor custo. Relacionar ao slide 27.'],
        ['15–22 min', 'Fronteiras simples, linear e complexa com dados reais; relembrar sobreajuste e subajuste.'],
        ['22–30 min', 'Das taxas da Aula 5 à precisão e revocação (Eq. 3). Fechar com a figura do recorte × imagem inteira: o objeto não vem recortado.'],
      ],
      perguntas: ['Se a Syrah estivesse madura, que característica bastaria? Por que isso não ajuda em março?', 'Na Aula 5, o que era “rejeição”? Que parâmetro do detector faz esse papel?', 'Quem define as características num detector?'],
      erros: ['Confundir precisão com acurácia: em detecção não existe VN bem definido (o fundo é infinito).', 'Achar que erro de treino zero é bom sinal.'],
    },
    b11: {
      roteiro: [
        ['0–8 min', 'Imagem como tensor e espaços de cor; executar a primeira célula do notebook.'],
        ['8–15 min', 'Cadeia clássica no CWFID e falha no WGISD.'],
        ['15–25 min', 'Quatro tarefas e custo de anotação; atividade em duplas com os exercícios 1 a 3. Citar o TCC do espelho nasal como ponte clássico × YOLO.'],
      ],
      perguntas: ['Para contar cachos, qual o menor nível de anotação suficiente?', 'Em que situação o método clássico ainda é a melhor escolha?'],
    },
    b12: {
      roteiro: [
        ['0–15 min', 'Dois estágios × um estágio; R-CNN, Faster R-CNN, Mask R-CNN; YOLO e grade.'],
        ['15–25 min', 'Backbone, neck e heads; pirâmide P3–P5 e cálculo das 8.400 posições.'],
        ['25–32 min', 'U-Net e o caso da soja (U-Net × YOLO V4) da UTFPR Curitiba.'],
        ['32–50 min', 'Conversões no quadro (xyxy, COCO, YOLO) e conversor interativo; exercícios 1, 2 e 4.'],
      ],
      erros: ['Escrever cantos normalizados no formato YOLO (o formato pede centro).', 'Esquecer de normalizar pela largura e altura da imagem original.'],
    },
    b13: {
      roteiro: [
        ['0–10 min', 'IoU: definição (Eq. 4), exemplo resolvido no quadro e laboratório de IoU.'],
        ['10–22 min', 'NMS passo a passo e com o modelo real; laboratório de NMS. Caso do gado: excesso de contagem.'],
        ['22–30 min', 'Limiar de confiança com o modelo real, ligando à rejeição da Aula 5.'],
        ['30–37 min', 'GSD e resolução; laboratório de GSD.'],
        ['37–45 min', 'Inferência ao vivo do modelo COCO numa foto do WGISD e discussão: por que anotar.'],
      ],
      perguntas: ['O que acontece com a contagem se o limiar de IoU do NMS for 0,99?', 'Por que o modelo do COCO não encontra uvas?'],
      erros: ['Confundir o limiar de IoU do NMS com o limiar de IoU da avaliação (0,5 no mAP50).'],
      materiais: ['Colab com GPU aberto antes do intervalo para a inferência ao vivo.'],
    },
    b14: {
      roteiro: [
        ['0–10 min', 'Anotação independente das três imagens ambíguas, sem regras.'],
        ['10–20 min', 'Comparar as caixas da turma e calcular a concordância.'],
        ['20–35 min', 'Redigir coletivamente o protocolo com casos-limite; mostrar o protocolo real da armadilha McPhail (Medeiros, 2025).'],
        ['35–50 min', 'Demonstração ao vivo no CVAT: projeto, tarefa, jobs, editor, revisão e exportação.'],
      ],
      perguntas: ['Cacho 70% coberto por folha: anota? A caixa cobre a parte visível ou estimada?', 'Que imagens sem nenhum cacho devemos manter no conjunto?'],
      erros: ['Exportar sem marcar “salvar imagens”.', 'Rótulo com nome diferente do data.yaml (ex.: “Cacho” × “cacho”).'],
    },
    b15: {
      roteiro: [
        ['0–35 min', 'Anotação de 20 imagens por dupla e revisão cruzada no modo de revisão do CVAT.'],
        ['35–50 min', 'Exportação e auditoria no Colab; correção das inconsistências.'],
        ['50–65 min', 'Estatísticas do conjunto e partição por grupo; verificação por código. Discutir o caso dos quadros de vídeo (confinamento).'],
      ],
      erros: ['Particionar por imagem quando há várias fotos da mesma planta ou sessão.', 'Aplicar aumento de dados antes de particionar.'],
      materiais: ['Arquivo de rótulos original do WGISD como plano B para quem não terminar a anotação.'],
    },
    b16: {
      roteiro: [
        ['0–5 min', 'Roteiro de leitura crítica (cinco perguntas).'],
        ['5–15 min', 'Discussão em formato de banca: Leal et al. (2024) e Osowski (2025, UTFPR Medianeira). Cada dupla faz uma pergunta metodológica.'],
      ],
      perguntas: ['O mAP reportado foi medido em imagens de outra fazenda?', 'O aumento de dados foi feito antes ou depois da partição?'],
    },
  },
}

export const PROF2: ProfAula = {
  aula: {
    preparo: [
      'Conferir no Colab da sala: GPU T4 disponível, ultralytics instalado e pesos yolo11n.pt baixados (ou levar o arquivo em pendrive).',
      'Deixar o conjunto da Aula 1 de cada dupla no Google Drive, já auditado; manter o WGISD original como alternativa.',
      'Disparar o treino no fim do Bloco 2.2, antes do intervalo; com 40 épocas e imgsz 640 leva cerca de 15 min numa T4.',
      'Rodar uma vez o notebook Aula2_YOLO_na_pratica.ipynb inteiro na conta da sala, para baixar o WGISD e os pesos com antecedência.',
      'Imprimir a ficha do Bloco 2.6 e abrir os PDFs da mosca-das-frutas, soja, alface e espécies florestais (RIUT).',
    ],
    planoB: [
      'Sem GPU: treinar com imgsz 416, 10 épocas e fração do conjunto (fraction=0.3) na CPU, ou usar os resultados reais deste site como material de análise.',
      'Treino interrompido: retomar com model.train(resume=True) a partir de last.pt.',
      'Sem vídeo para rastreamento: usar uma sequência de imagens do WGISD (SYH_2017-04-27_*) como quadros.',
    ],
    avaliacao: (
      <>
        <h5>Rubrica do trabalho prático integrado (em dupla)</h5>
        <table className="tbl">
          <thead><tr><th>critério</th><th className="num">peso</th><th>evidências esperadas</th></tr></thead>
          <tbody>
            <tr><td>Engenharia de dados e anotação</td><td className="num">25%</td><td>Conjunto exportado; protocolo de anotação; evidência de revisão; justificativa e comprovação da partição por grupo.</td></tr>
            <tr><td>Treinamento e experimentação</td><td className="num">25%</td><td>Notebook executável; configuração do experimento; curvas; justificativa dos hiperparâmetros com base na validação.</td></tr>
            <tr><td>Avaliação crítica e domínio externo</td><td className="num">30%</td><td>Métricas de detecção; erro de contagem, se pertinente; avaliação em dados externos; análise qualitativa de pelo menos cinco erros.</td></tr>
            <tr><td>Aplicação e defesa oral</td><td className="num">20%</td><td>Demonstração de inferência em imagens ou vídeo; interpretação dos resultados; respostas a questões metodológicas.</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  blocos: {
    b21: {
      roteiro: [
        ['0–5 min', 'Mostrar o que o notebook final faz (contagem e planilha) para dar sentido às etapas.'],
        ['5–20 min', 'Construir junto, num notebook em branco: GPU, instalação, Drive, dados.'],
        ['20–30 min', 'Célula de conferência: ninguém segue sem imagens e rótulos batendo e caixas sobre os cachos.'],
      ],
      erros: ['Sessão sem GPU.', 'Nome da classe diferente entre CVAT e data.yaml.', 'Salvar em /content e perder tudo quando a sessão cai.'],
    },
    b22: {
      roteiro: [
        ['0–15 min', 'Tabela de parâmetros: o que cada um muda e quando mexer.'],
        ['15–25 min', 'Resultado real: pesos prontos × do zero; parada antecipada.'],
        ['25–35 min', 'Objetos pequenos: caso dos esporos (UTFPR) e imgsz.'],
        ['35–45 min', 'Cada dupla dispara o treino; conferir que todos começaram antes do intervalo.'],
      ],
      erros: ['batch alto demais para a memória.', 'Esquecer de apontar project para o Drive.'],
    },
    b23: {
      roteiro: [
        ['0–10 min', 'Abrir a pasta do treino da própria dupla e o results.png.'],
        ['10–25 min', 'Precisão, revocação e mAP em palavras, com a tabela de valores reais; acertos e erros numa foto.'],
        ['25–40 min', 'Limiar de confiança: tabela de contagem na validação e curva F1; caso das daninhas.'],
      ],
      perguntas: ['Em que época a validação de vocês parou de melhorar?', 'Para contar, vocês prefeririam errar a mais ou a menos? Por quê?'],
    },
    b24: {
      roteiro: [
        ['0–15 min', 'Contar em fotos e salvar a planilha no Drive.'],
        ['15–30 min', 'Vídeo com rastreamento: soma de detecções × identificações; caso do gado (UTFPR).'],
        ['30–40 min', 'Exportar para ONNX e conferir as previsões.'],
        ['40–50 min', 'Desafio: fotos do celular dos alunos.'],
      ],
    },
    b25: {
      roteiro: [
        ['0–10 min', 'Perguntar quanto a turma acha que o modelo perde na Syrah; mostrar o resultado real.'],
        ['10–30 min', 'Cada dupla roda a seção 6 e classifica os erros das cinco fotos.'],
        ['30–45 min', 'Quadro com os tipos de erro de todas as duplas e a ação proposta para cada um.'],
      ],
      erros: ['Chamar de “teste em outro lugar” fotos que estavam no treino.'],
    },
    b26: {
      roteiro: [
        ['0–12 min', 'Mosca-das-frutas (PPGTCA): percorrer as etapas com os prints; discutir o falso positivo de campo.'],
        ['12–32 min', 'Duplas preenchem a ficha de um trabalho (soja, alface ou espécies florestais).'],
        ['32–35 min', 'Duas duplas apresentam o que acharam.'],
      ],
    },
    b27: {
      roteiro: [
        ['0–15 min', 'Projeto: entregáveis e rubrica.'],
        ['15–35 min', 'Cada dupla define problema, fotos, classes e de onde virá o teste em outro lugar; registrar numa tabela da turma.'],
      ],
    },
  },
}
