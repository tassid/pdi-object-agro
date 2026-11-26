# Detecção de objetos em imagens agrícolas com CVAT e YOLO

Guia interativo de **2 aulas de 5 horas** (300 min cada, com intervalo de 20 min), continuação da **Aula 5 (Reconhecimento de Padrões)** da disciplina Processamento de Imagens Aplicado à Agroindústria (PPGTCA, UTFPR Medianeira).

- Alunos: https://tassid.github.io/pdi-object-agro/
- Professor: https://tassid.github.io/pdi-object-agro/professor/ (roteiro minuto a minuto, perguntas, dificuldades frequentes, preparação, plano B, rubrica, soluções abertas e notas de cada slide no modo apresentação)

Cada bloco segue **teoria → exemplos → prática**, com slides integrados (emulador no próprio site, no tema visual da Aula 5), exercícios com solução e laboratórios que rodam no navegador ou no Colab. A tipografia segue o LaTeX (Computer Modern, fórmulas em KaTeX, definições e exemplos numerados).

| Aula | Blocos | Notebook |
|---|---|---|
| 1 · Fundamentos de detecção e engenharia de dados | 1.0 da Aula 5 à detecção · 1.1 PDI clássico e tarefas · 1.2 R-CNN, U-Net, YOLO e formatos · 1.3 IoU, NMS, GSD · 1.4 protocolo no CVAT · 1.5 Lab 1: anotação, auditoria e partição · 1.6 leitura crítica | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tassid/pdi-object-agro/blob/main/notebooks/Aula1_Anotacao_Auditoria_Split.ipynb) |
| 2 · Redes neurais, treinamento e avaliação | 2.1 ambiente · 2.2 perceptron → CNN · 2.3 treino YOLO · 2.4 métricas · 2.5 Lab 2: domínio, rastreamento, exportação · 2.6 Lab 3: análise de erros e contagem · 2.7 pesquisa na UTFPR e trabalho | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tassid/pdi-object-agro/blob/main/notebooks/Aula2_Treino_Avaliacao_Dominio.ipynb) |

## Imagens

Nenhuma figura de resultado é simulada: as figuras `public/fig/real_*.jpg` e `aula5_*.jpg` vêm de **treinos reais** de YOLO11n no WGISD.

```bash
pip install ultralytics opencv-python matplotlib pillow
python scripts/treinar_wgisd.py --dados ./trabalho     # baixa o WGISD, monta as partições, treina 3 modelos (~25 min numa RTX 5060 Ti)
python scripts/figuras_reais.py --dados ./trabalho     # gera public/fig/real_*.jpg, aula5_*.jpg e src/resultados.json
python scripts/gerar_figuras.py                        # figuras didáticas (IoU, formatos, convolução etc.) a partir das fotos do WGISD e do CWFID
```

Os números citados no texto (mAP, P, R, erro de contagem, efeito do domínio) são lidos de `src/resultados.json`, gerado pelo script.

Outras imagens:

- `public/artigos/`: capas e figuras de 10 TCCs e dissertações da UTFPR, recortadas das páginas indicadas dos PDFs do [RIUT](https://repositorio.utfpr.edu.br/), para leitura crítica.
- `public/cvat/`: capturas de tela da [documentação oficial do CVAT](https://docs.cvat.ai/).
- `public/aula5/`: slides da Aula 5 (Prof. Pedro Luiz de Paula Filho) usados na retomada.

## Dados

1. **WGISD** · Santos, T. T. et al. (2020). *Computers and Electronics in Agriculture* 170, 105247. https://github.com/thsant/wgisd (CC BY-NC 4.0)
2. **CWFID** · Haug, S.; Ostermann, J. (2014). ECCV Workshops. https://github.com/cwfid/dataset

## Site

```bash
npm install
npm run dev     # http://localhost:5173/pdi-object-agro/  e  /pdi-object-agro/professor/
npm run build   # dist/ (aluno em index.html, professor em professor/index.html); publicado pelo workflow a cada push na main
```

```
src/
  App.tsx            página inicial e navegação (#inicio, #aula1, #aula2)
  curso.tsx          modelo de aula, visão aluno/professor, emulador de slides, modo apresentação, KaTeX
  trabalhos.tsx      metadados dos trabalhos da UTFPR
  aulas/ponte.tsx    Bloco 1.0 (retomada da Aula 5)
  aulas/Aula1.tsx    Aula 1
  aulas/Aula2.tsx    Aula 2
  aulas/prof.tsx     conteúdo exclusivo da visão do professor
  labs.tsx           laboratórios no navegador (IoU, NMS, conversor, perceptron, partição, GSD, métricas, convolução)
scripts/             treino, figuras reais e figuras didáticas
notebooks/           notebooks do Colab
```

A visão do professor é uma página pública sem senha (não indexada); não coloque nela nada que não possa ser visto pelos alunos.
