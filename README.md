# Detecção de objetos em imagens agrícolas com CVAT e YOLO

Guia interativo de uma aula, continuação da **Aula 5 (Reconhecimento de Padrões)** da disciplina Processamento de Imagens Aplicado à Agroindústria (PPGTCA, UTFPR Medianeira).

- Alunos: https://tassid.github.io/pdi-object-agro/
- Professor: https://tassid.github.io/pdi-object-agro/professor/ (roteiro docente, perguntas, dificuldades frequentes, preparação, plano B, rubrica, soluções abertas e notas de cada slide no modo apresentação)

Cada seção segue **teoria → exemplos → prática**, com slides integrados (emulador no próprio site, no tema visual da Aula 5), exercícios com solução e laboratórios que rodam no navegador. A tipografia segue o LaTeX (Computer Modern, fórmulas em KaTeX). As fórmulas aparecem com a explicação em palavras; o material não pede contas manuais.

## Sequência da aula

1. Da Aula 5 à detecção de objetos
2. Classificação, detecção e segmentação: etapas e diferenças
3. As mesmas tarefas sem rede neural: cinco casos reais (laboratórios no navegador)
4. Arquiteturas e formatos de anotação
5. IoU, NMS, GSD e inferência com modelo pré-treinado
6. Protocolo de anotação no CVAT
7. Laboratório: anotação, auditoria e partição dos dados
8. Montar o Colab do zero
9. Treinar um YOLO
10. Ler os resultados do treino
11. Classificação e segmentação com YOLO na prática
12. Laboratório: contar, rastrear e exportar
13. Laboratório: testar em outro lugar e analisar os erros
14. Trabalhos reais da UTFPR, passo a passo
15. Projeto da dupla e orientações

## Notebook

Um único Colab, do dado anotado ao modelo em uso:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tassid/pdi-object-agro/blob/main/notebooks/CVAT_YOLO_na_pratica.ipynb)

```bash
python scripts/gerar_notebook.py   # regenera notebooks/CVAT_YOLO_na_pratica.ipynb
```

## Imagens

Nenhuma figura de resultado é simulada: as figuras `public/fig/real_*.jpg` e `aula5_*.jpg` vêm de **treinos reais** de YOLO11n no WGISD.

```bash
pip install ultralytics opencv-python matplotlib pillow
python scripts/treinar_wgisd.py --dados ./trabalho     # baixa o WGISD, monta as partições, treina 3 modelos (~25 min numa RTX 5060 Ti)
python scripts/treinar_tarefas.py --dados ./trabalho   # classificação (variedade do cacho) e segmentação de instâncias
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
  aulas/Curso.tsx    composição da aula: ordem das seções
  aulas/classicos.tsx  casos clássicos trazidos do site anterior (pdi-agro)
  casos/             laboratórios dos casos clássicos (tomate, aviário, soja, laranjeira, citros)
  aulas/ponte.tsx    Bloco 1 (retomada da Aula 5)
  aulas/tarefas.tsx  Blocos 2 e 10 (classificação, detecção e segmentação)
  aulas/Aula1.tsx    blocos de dados, formatos, IoU/NMS e CVAT
  aulas/Aula2.tsx    blocos práticos de YOLO
  aulas/prof.tsx     conteúdo exclusivo da visão do professor
  labs.tsx           laboratórios no navegador (IoU, NMS, conversor, partição, GSD)
scripts/             treino, figuras reais, figuras didáticas e gerador do notebook
notebooks/           o notebook do Colab
```

A visão do professor é uma página pública sem senha (não indexada); não coloque nela nada que não possa ser visto pelos alunos.
