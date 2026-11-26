"""Gera notebooks/CVAT_YOLO_na_pratica.ipynb: o único Colab da aula, do dado anotado ao modelo em uso."""
import json
from pathlib import Path

C = []


def md(t):
    C.append({"cell_type": "markdown", "metadata": {}, "source": t.strip("\n")})


def py(t):
    C.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": t.strip("\n")})


md("""
# Detecção de objetos com CVAT e YOLO · notebook da aula

Guia: github.com/tassid/pdi-object-agro

Este é o único notebook da aula. Ele vai do conjunto anotado até o modelo contando objetos em fotos novas. Execute as células de cima para baixo.

| Parte | O que você faz |
|---|---|
| 1 | Preparar o Colab: GPU, Google Drive e Ultralytics |
| 2 | Carregar os dados: WGISD ou o export do CVAT da sua dupla |
| 3 | Conferir os rótulos antes de treinar |
| 4 | Separar treino, validação e teste sem vazamento |
| 5 | Treinar o detector |
| 6 | Ler os resultados e escolher o limiar de confiança |
| 7 | Usar o modelo: contar, salvar planilha, vídeo e exportar |
| 8 | Testar em dados de outro lugar e analisar os erros |
| 9 | Classificação e segmentação com o mesmo código |
| 10 | Registrar o experimento |
| 11 | **Projeto frutas:** baixar os dados do Hugging Face |
| 12 | **Projeto frutas:** contar e identificar a fruta (YOLO26) |
| 13 | **Projeto frutas:** sadia ou estragada, e o pipeline completo |

As partes 11 a 13 são independentes das anteriores: dá para rodar só elas, depois da parte 1.

Antes de começar: **Ambiente de execução → Alterar o tipo de ambiente → GPU (T4)**.
""")

# ------------------------------------------------------------------ 1
md("## 1. Preparar o Colab")
py("""
!nvidia-smi --query-gpu=name,memory.total --format=csv
!pip -q install ultralytics
import sys, torch, ultralytics
print("torch", torch.__version__, "| ultralytics", ultralytics.__version__)
print("GPU disponível:", torch.cuda.is_available())
""")
md("O Colab apaga tudo quando a sessão termina. Montando o Drive, os pesos e os resultados ficam guardados.")
py("""
USAR_DRIVE = True
import os
if USAR_DRIVE:
    from google.colab import drive
    drive.mount("/content/drive")
    BASE = "/content/drive/MyDrive/pdi_yolo"
else:
    BASE = "/content"
os.makedirs(BASE, exist_ok=True)
print("resultados em", BASE)
""")

# ------------------------------------------------------------------ 2
md("""
## 2. Carregar os dados

Duas opções:

- **WGISD** (padrão): fotos de uva da Embrapa, já anotadas no formato YOLO.
- **Seu export do CVAT**: no CVAT, *Export dataset → Ultralytics YOLO Detection 1.0*, marque *Save images*, e envie o `.zip` ao Drive. Troque `USAR_CVAT` para `True`.
""")
py("""
USAR_CVAT = False
ZIP_CVAT = "/content/drive/MyDrive/pdi_yolo/meu_export_cvat.zip"

import glob, shutil, random
import numpy as np, pandas as pd, yaml
from PIL import Image
import matplotlib.pyplot as plt, matplotlib.patches as patches
from IPython.display import Image as Mostrar, display

RAIZ = "/content/dataset" if os.path.exists("/content") else os.path.abspath("dataset")
shutil.rmtree(RAIZ, ignore_errors=True)

if USAR_CVAT:
    shutil.unpack_archive(ZIP_CVAT, RAIZ)
    DATA = glob.glob(f"{RAIZ}/**/data.yaml", recursive=True)[0]
    RAIZ = os.path.dirname(DATA)
    print(open(DATA).read())
else:
    if not os.path.exists("wgisd"):
        os.system("git clone -q --depth 1 https://github.com/thsant/wgisd.git")
    fotos = sorted(glob.glob("wgisd/data/*.jpg"))
    df = pd.DataFrame({"foto": fotos})
    df["nome"] = [os.path.basename(f)[:-4] for f in fotos]
    df["variedade"] = df.nome.str[:3]
    df["caixas"] = [sum(1 for l in open(f[:-4] + ".txt") if l.strip()) for f in fotos]
    print(df.groupby("variedade").agg(fotos=("nome", "size"), caixas=("caixas", "sum")))
""")
md("""
### Olhar as caixas

Nenhum treino deve começar sem ver as anotações desenhadas sobre a foto. É aqui que aparecem rótulos trocados, caixas folgadas e objetos esquecidos.
""")
py("""
def desenhar(foto, caixas=None, cor="orange", titulo=None, ax=None):
    im = Image.open(foto); W, H = im.size
    if ax is None:
        _, ax = plt.subplots(figsize=(9, 6))
    ax.imshow(im); ax.axis("off"); ax.set_title(titulo or os.path.basename(foto), fontsize=10)
    if caixas is None:
        rot = foto.replace("images", "labels").rsplit(".", 1)[0] + ".txt"
        caixas = [list(map(float, l.split()[1:5])) for l in open(rot) if l.strip()] if os.path.exists(rot) else []
    for xc, yc, w, h in caixas:
        ax.add_patch(patches.Rectangle(((xc - w/2) * W, (yc - h/2) * H), w * W, h * H, fill=False, ec=cor, lw=2))
    return ax

exemplo = sorted(glob.glob("wgisd/data/*.jpg"))[0] if not USAR_CVAT else sorted(glob.glob(f"{RAIZ}/images/*/*.jpg"))[0]
caixas = [list(map(float, l.split()[1:5])) for l in open(exemplo[:-4] + ".txt" if not USAR_CVAT else exemplo.replace("images", "labels")[:-4] + ".txt") if l.strip()]
desenhar(exemplo, caixas, titulo=f"{os.path.basename(exemplo)} · {len(caixas)} objetos anotados")
plt.show()
""")

# ------------------------------------------------------------------ 3
md("""
## 3. Conferir os rótulos

Erros de anotação não travam o treino: eles aparecem depois, como um modelo ruim. A função abaixo procura os problemas mais comuns.
""")
py("""
def auditar(rotulos, n_classes=1):
    problemas = []
    for f in rotulos:
        vistas = []
        for k, linha in enumerate(open(f)):
            if not linha.strip():
                continue
            partes = linha.split()
            if len(partes) != 5:
                problemas.append((os.path.basename(f), k, "linha sem 5 colunas")); continue
            c, *v = partes; v = list(map(float, v))
            if not 0 <= int(c) < n_classes:
                problemas.append((os.path.basename(f), k, f"classe {c} não existe no data.yaml"))
            if any(x < 0 or x > 1 for x in v):
                problemas.append((os.path.basename(f), k, "coordenada fora de 0 a 1"))
            if v[2] <= 0 or v[3] <= 0:
                problemas.append((os.path.basename(f), k, "largura ou altura zero"))
            if any(abs(v[0]-o[0]) < 0.01 and abs(v[1]-o[1]) < 0.01 for o in vistas):
                problemas.append((os.path.basename(f), k, "caixa duplicada"))
            vistas.append(v)
    return pd.DataFrame(problemas, columns=["arquivo", "linha", "problema"])

pasta = "wgisd/data" if not USAR_CVAT else f"{RAIZ}/labels"
rotulos = sorted(glob.glob(f"{pasta}/**/*.txt", recursive=True))
print(len(rotulos), "arquivos de rótulo")
auditar(rotulos).head(20)
""")
md("""
### Como é o conjunto

Objetos por foto, tamanho das caixas e onde eles costumam aparecer. Estes números ajudam a escolher o tamanho de entrada do treino: objetos muito pequenos pedem entrada maior.
""")
py("""
if not USAR_CVAT:
    linhas = []
    for _, r in df.iterrows():
        for l in open(r.foto[:-4] + ".txt"):
            if l.strip():
                _, xc, yc, w, h = map(float, l.split())
                linhas.append({"variedade": r.variedade, "xc": xc, "yc": yc, "area_%": 100 * w * h})
    cx = pd.DataFrame(linhas)
    fig, ax = plt.subplots(1, 3, figsize=(15, 3.6))
    df.caixas.hist(bins=20, ax=ax[0]); ax[0].set_title("objetos por foto")
    cx["area_%"].hist(bins=40, ax=ax[1]); ax[1].set_title("tamanho da caixa (% da foto)")
    ax[2].hist2d(cx.xc, cx.yc, bins=12, cmap="magma"); ax[2].invert_yaxis(); ax[2].set_title("onde ficam os objetos")
    plt.tight_layout(); plt.show()
    print("a caixa típica ocupa", round(cx['area_%'].median(), 2), "% da foto")
""")

# ------------------------------------------------------------------ 4
md("""
## 4. Separar treino, validação e teste

As três partes têm papéis diferentes: o **treino** ajusta o modelo, a **validação** orienta as escolhas (quando parar, que limiar usar) e o **teste** só é consultado no fim.

A separação não pode ser sorteada foto a foto quando as fotos vêm em grupos (mesma planta, mesmo voo, mesmo dia): fotos quase iguais em conjuntos diferentes fazem o resultado parecer melhor do que é. Aqui o grupo é a **variedade**: a Syrah fica inteira no teste, e o modelo nunca a vê durante o treino.
""")
py("""
SAIDA = "/content/pronto" if os.path.exists("/content") else os.path.abspath("pronto")
shutil.rmtree(SAIDA, ignore_errors=True)

if USAR_CVAT:
    SAIDA = RAIZ
    DATA = glob.glob(f"{RAIZ}/**/data.yaml", recursive=True)[0]
else:
    random.seed(0)
    def conjunto(v):
        if v == "SYH":
            return "test"                      # variedade reservada para o teste
        return "val" if random.random() < 0.15 else "train"
    df["conjunto"] = df.variedade.map(conjunto)
    for _, r in df.iterrows():
        for sub in ("images", "labels"):
            os.makedirs(f"{SAIDA}/{sub}/{r.conjunto}", exist_ok=True)
        im = Image.open(r.foto).convert("RGB"); im.thumbnail((1280, 1280))
        im.save(f"{SAIDA}/images/{r.conjunto}/{r.nome}.jpg", quality=92)
        shutil.copy(r.foto[:-4] + ".txt", f"{SAIDA}/labels/{r.conjunto}/{r.nome}.txt")
    DATA = f"{SAIDA}/data.yaml"
    yaml.safe_dump({"path": SAIDA, "train": "images/train", "val": "images/val", "test": "images/test",
                    "names": {0: "cacho"}}, open(DATA, "w"), allow_unicode=True)
    print(df.groupby(["conjunto", "variedade"]).size().unstack(fill_value=0))
    espalhadas = set(df[df.conjunto == "train"].variedade) & set(df[df.conjunto == "test"].variedade)
    print("variedades que aparecem no treino E no teste:", len(espalhadas), "(precisa ser 0)")

for s in ("train", "val", "test"):
    n_i = len(glob.glob(f"{SAIDA}/images/{s}/*"))
    n_r = len(glob.glob(f"{SAIDA}/labels/{s}/*.txt"))
    print(f"{s:5s}: {n_i:4d} imagens, {n_r:4d} rótulos")
    assert n_i == n_r or n_i == 0, f"faltam rótulos em {s}"
""")

# ------------------------------------------------------------------ 5
md("""
## 5. Treinar

Sempre comece de pesos já treinados (`yolo11n.pt`): o modelo chega sabendo reconhecer bordas, texturas e formas, e o treino só adapta esse conhecimento aos seus objetos.

| parâmetro | o que faz | comece com |
|---|---|---|
| `epochs` | quantas vezes o modelo vê o conjunto inteiro | 40 |
| `imgsz` | tamanho da foto na entrada; maior ajuda objetos pequenos | 640 |
| `batch` | fotos por passo; reduza se faltar memória | 16 |
| `patience` | para o treino quando a validação não melhora mais | 15 |

Com uma T4, 40 épocas em 640 pixels levam cerca de 15 minutos.
""")
py("""
from ultralytics import YOLO
EPOCAS = 40
modelo = YOLO("yolo11n.pt")
modelo.train(data=DATA, epochs=EPOCAS, imgsz=640, batch=16, patience=15, seed=0,
             project=f"{BASE}/runs", name="deteccao", exist_ok=True, plots=True)
PASTA = f"{BASE}/runs/deteccao"
print("pesos salvos em", os.listdir(f"{PASTA}/weights"))
""")
md("Se a sessão cair no meio do treino, retome de onde parou:")
py("""
# YOLO(f"{PASTA}/weights/last.pt").train(resume=True)
""")

# ------------------------------------------------------------------ 6
md("""
## 6. Ler os resultados

O Ultralytics guarda tudo na pasta do treino. Olhe nesta ordem:

1. `results.png` — as perdas caíram? a validação parou de melhorar em algum ponto?
2. `val_batch0_pred.jpg` — as caixas fazem sentido? aparece algum rótulo errado?
3. `BoxF1_curve.png` — com que limiar de confiança o modelo fica equilibrado?
""")
py("""
for arq in ["results.png", "val_batch0_pred.jpg", "BoxF1_curve.png", "confusion_matrix_normalized.png"]:
    p = f"{PASTA}/{arq}"
    if os.path.exists(p):
        print(arq); display(Mostrar(p, width=900))
""")
md("""
As métricas em palavras:

- **precisão**: das caixas que o modelo desenhou, quantas estavam certas.
- **revocação**: dos objetos que existiam, quantos ele encontrou.
- **mAP50**: nota geral, aceitando caixas razoavelmente encaixadas.
- **mAP50-95**: nota geral, exigindo caixas bem justas.
""")
py("""
melhor = YOLO(f"{PASTA}/weights/best.pt")
val = melhor.val(data=DATA, split="val", project=f"{BASE}/runs", name="val", exist_ok=True, verbose=False)
print(f"precisão {val.box.mp:.2f} · revocação {val.box.mr:.2f} · mAP50 {val.box.map50:.2f} · mAP50-95 {val.box.map:.2f}")
""")
md("""
### Escolher o limiar de confiança

O limiar decide quais caixas contam. Limiar baixo acha mais e erra mais; limiar alto erra menos e deixa objetos passar. A escolha é feita na **validação**, comparando a contagem do modelo com a contagem anotada.
""")
py("""
def contar(modelo, pasta_imgs, conf):
    linhas = []
    for f in sorted(glob.glob(f"{pasta_imgs}/*")):
        rot = f.replace("images", "labels").rsplit(".", 1)[0] + ".txt"
        n = sum(1 for l in open(rot) if l.strip())
        n_hat = len(modelo.predict(f, conf=conf, verbose=False)[0].boxes)
        linhas.append((os.path.basename(f), n, n_hat))
    return pd.DataFrame(linhas, columns=["imagem", "anotados", "detectados"])

tabela = []
for conf in [0.1, 0.25, 0.4, 0.55, 0.7]:
    t = contar(melhor, f"{SAIDA}/images/val", conf)
    e = t.detectados - t.anotados
    tabela.append({"conf": conf, "erro médio por foto": e.abs().mean().round(2), "conta a mais (+) ou a menos (−)": e.mean().round(2)})
pd.DataFrame(tabela)
""")

# ------------------------------------------------------------------ 7
md("## 7. Usar o modelo\n\n### Contar em fotos novas e salvar uma planilha")
py("""
import cv2
CONF = 0.4   # use o limiar escolhido na parte 6

fotos_novas = sorted(glob.glob(f"{SAIDA}/images/test/*"))[:10]
# para usar suas fotos: from google.colab import files; fotos_novas = list(files.upload().keys())
res = []
for f in fotos_novas:
    r = melhor.predict(f, conf=CONF, verbose=False)[0]
    res.append({"foto": os.path.basename(f), "objetos": len(r.boxes),
                "confiança média": round(float(r.boxes.conf.mean()), 2) if len(r.boxes) else 0})
planilha = pd.DataFrame(res)
planilha.to_csv(f"{BASE}/contagem.csv", index=False)
display(Mostrar(data=cv2.imencode(".jpg", r.plot())[1].tobytes(), width=800))
planilha
""")
md("""
### Vídeo: contar sem repetir

Num vídeo o mesmo objeto aparece em muitos quadros. O rastreador dá um número de identificação a cada objeto, e a contagem passa a ser o número de identificações diferentes. Sem um vídeo de campo, a célula simula uma câmera percorrendo uma foto.
""")
py("""
foto = sorted(glob.glob(f"{SAIDA}/images/test/*"))[0]
im = cv2.imread(foto); H, W = im.shape[:2]; janela = int(W * 0.6)
video = f"{BASE}/fileira.mp4"
out = cv2.VideoWriter(video, cv2.VideoWriter_fourcc(*"mp4v"), 10, (janela, H))
for x in range(0, W - janela, 8):
    out.write(im[:, x:x + janela])
out.release()

ids, soma = set(), 0
for r in melhor.track(video, tracker="bytetrack.yaml", conf=CONF, persist=True, stream=True, verbose=False):
    soma += len(r.boxes)
    if r.boxes.id is not None:
        ids.update(r.boxes.id.int().tolist())
print("caixas somadas em todos os quadros:", soma)
print("objetos diferentes (identificações):", len(ids))
""")
md("### Levar o modelo para fora do Colab")
py("""
caminho = melhor.export(format="onnx", imgsz=640)
print("arquivo:", caminho)
print(len(YOLO(caminho).predict(fotos_novas[0], conf=CONF, verbose=False)[0].boxes), "caixas no modelo exportado")
# para celular ou Raspberry Pi: format="tflite" ou format="ncnn"
""")

# ------------------------------------------------------------------ 8
md("""
## 8. Testar em outro lugar e analisar os erros

O conjunto de teste tem só a variedade que ficou de fora do treino. Compare com a validação: a diferença mostra quanto o modelo perde num lugar novo.
""")
py("""
teste = melhor.val(data=DATA, split="test", project=f"{BASE}/runs", name="teste", exist_ok=True, verbose=False)
pd.DataFrame({"validação (o que ele viu)": [val.box.mp, val.box.mr, val.box.map50, val.box.map],
              "teste (nunca visto)": [teste.box.mp, teste.box.mr, teste.box.map50, teste.box.map]},
             index=["precisão", "revocação", "mAP50", "mAP50-95"]).round(3)
""")
md("Anotação (verde) contra previsão (laranja). Para cada erro, escreva a causa provável: oclusão, objeto pequeno, borda da foto, iluminação, caixa duplicada ou objeto que ninguém anotou.")
py("""
fotos_teste = sorted(glob.glob(f"{SAIDA}/images/test/*"))[:5]
fig, axs = plt.subplots(len(fotos_teste), 1, figsize=(10, 6 * len(fotos_teste)))
for ax, f in zip(np.atleast_1d(axs), fotos_teste):
    desenhar(f, cor="limegreen", ax=ax)
    W, H = Image.open(f).size
    for b in melhor.predict(f, conf=CONF, verbose=False)[0].boxes.xyxy.cpu().numpy():
        ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec="orange", lw=2))
plt.tight_layout(); plt.show()
""")

# ------------------------------------------------------------------ 9
md("""
## 9. Classificação e segmentação

A mesma biblioteca resolve as outras tarefas trocando os pesos:

| tarefa | pesos | dados | resultado |
|---|---|---|---|
| classificação | `yolo11n-cls.pt` | uma pasta por classe | `r.probs` |
| detecção | `yolo11n.pt` | `data.yaml` com caixas | `r.boxes` |
| segmentação | `yolo11n-seg.pt` | `data.yaml` com polígonos | `r.masks` |

### Classificação: cada caixa anotada vira um recorte

A variedade está nas três primeiras letras do nome da foto. Todos os recortes de uma foto vão para o mesmo conjunto, para que não haja vazamento.
""")
py("""
VAR = {"CDY": "chardonnay", "CFR": "cabernet_franc", "CSV": "cabernet_sauvignon", "SVB": "sauvignon_blanc"}
REC = "/content/recortes" if os.path.exists("/content") else os.path.abspath("recortes")
shutil.rmtree(REC, ignore_errors=True)
for split in ["train", "val"]:
    for f in glob.glob(f"{SAIDA}/images/{split}/*.jpg"):
        nome = os.path.basename(f)[:-4]
        if nome[:3] not in VAR:
            continue
        im = cv2.imread(f); H, W = im.shape[:2]
        pasta = f"{REC}/{split}/{VAR[nome[:3]]}"; os.makedirs(pasta, exist_ok=True)
        for k, l in enumerate(open(f.replace("images", "labels")[:-4] + ".txt")):
            if not l.strip():
                continue
            _, xc, yc, w, h = map(float, l.split())
            x1, y1 = int((xc - w/2) * W), int((yc - h/2) * H)
            x2, y2 = int((xc + w/2) * W), int((yc + h/2) * H)
            if x2 - x1 > 16 and y2 - y1 > 16:
                cv2.imwrite(f"{pasta}/{nome}_{k}.jpg", im[max(0, y1):y2, max(0, x1):x2])
for split in ["train", "val"]:
    print(split, {c: len(os.listdir(f"{REC}/{split}/{c}")) for c in sorted(os.listdir(f"{REC}/{split}"))})
""")
py("""
classificador = YOLO("yolo11n-cls.pt")
classificador.train(data=REC, epochs=15, imgsz=224, batch=64, seed=0, project=f"{BASE}/runs", name="classificacao", exist_ok=True)
res_cls = YOLO(f"{BASE}/runs/classificacao/weights/best.pt").val(data=REC, split="val", project=f"{BASE}/runs", name="val_cls", exist_ok=True, verbose=False)
print(f"acerto: {res_cls.top1:.3f}")
display(Mostrar(f"{BASE}/runs/classificacao/confusion_matrix_normalized.png", width=600))
""")
md("""
### Segmentação (opcional, cerca de 15 min numa T4)

O WGISD traz máscaras para parte das fotos. A célula converte cada máscara num contorno no formato do YOLO e treina o modelo de segmentação. No seu projeto, o equivalente é anotar com **polígonos** no CVAT e exportar em *Ultralytics YOLO Segmentation*.
""")
py("""
TREINAR_SEG = False
if TREINAR_SEG and not USAR_CVAT:
    SEG = "/content/dataset_seg" if os.path.exists("/content") else os.path.abspath("dataset_seg")
    lista = {"train": [l.strip() for l in open("wgisd/train_masked.txt") if l.strip()],
             "val": [l.strip() for l in open("wgisd/test_masked.txt") if l.strip()]}
    for split, nomes in lista.items():
        for sub in ("images", "labels"):
            os.makedirs(f"{SEG}/{sub}/{split}", exist_ok=True)
        for n in nomes:
            m = np.load(f"wgisd/data/{n}.npz")["arr_0"]; H, W = m.shape[:2]; linhas = []
            for i in range(m.shape[2]):
                cs, _ = cv2.findContours(m[:, :, i].astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if cs:
                    c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 1.5, True).reshape(-1, 2)
                    if len(c) >= 3:
                        linhas.append("0 " + " ".join(f"{x/W:.5f} {y/H:.5f}" for x, y in c))
            shutil.copy(f"wgisd/data/{n}.jpg", f"{SEG}/images/{split}/{n}.jpg")
            open(f"{SEG}/labels/{split}/{n}.txt", "w").write("\\n".join(linhas) + "\\n")
    yaml.safe_dump({"path": SEG, "train": "images/train", "val": "images/val", "names": {0: "cacho"}}, open(f"{SEG}/data.yaml", "w"))
    seg = YOLO("yolo11n-seg.pt")
    seg.train(data=f"{SEG}/data.yaml", epochs=40, imgsz=1024, batch=8, seed=0, project=f"{BASE}/runs", name="segmentacao", exist_ok=True)
    r = YOLO(f"{BASE}/runs/segmentacao/weights/best.pt").predict(f"{SEG}/images/val/{lista['val'][0]}.jpg", conf=0.25)[0]
    display(Mostrar(data=cv2.imencode(".jpg", r.plot())[1].tobytes(), width=800))
""")

# ------------------------------------------------------------------ 10
md("## 10. Registrar o experimento\n\nGuarde junto dos pesos tudo o que é preciso para repetir o resultado.")
py("""
import json, platform
registro = {"pesos_iniciais": "yolo11n.pt", "epocas": EPOCAS, "imgsz": 640, "batch": 16, "patience": 15, "seed": 0,
            "conf_contagem": CONF, "dados": DATA, "ultralytics": ultralytics.__version__, "torch": torch.__version__,
            "python": platform.python_version(),
            "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
            "val": {"P": val.box.mp, "R": val.box.mr, "mAP50": val.box.map50, "mAP50-95": val.box.map},
            "teste": {"P": teste.box.mp, "R": teste.box.mr, "mAP50": teste.box.map50, "mAP50-95": teste.box.map}}
json.dump(registro, open(f"{PASTA}/registro.json", "w"), indent=1, default=float)
registro
""")
# ------------------------------------------------------------------ 11-13 projeto frutas
md("""
## 11. Projeto frutas: os dados

O projeto responde três perguntas sobre fotos de pomar com o **YOLO26**, o modelo mais recente da Ultralytics (2026):

1. **Quantas frutas há?** e **qual fruta é cada uma?** → detecção com `yolo26n.pt`
2. **Cada fruta está sadia ou estragada?** → classificação com `yolo26n-cls.pt`
3. **Tudo junto:** o detector acha e conta, e cada recorte vai para o classificador.

Os dados vêm do **Hugging Face** e não pedem login:

- `Project-AgML/fruit_detection_worldwide`: o conjunto DeepFruits (SA et al., 2016), 565 fotos com 3.132 caixas de 7 frutas.
- `Project-AgML/fresh_rotten_fruit_classification`: 3.200 fotos de 8 frutas, sadias e estragadas (CC BY 4.0).

> Alternativa pelo Kaggle: `kagglehub.dataset_download("dono/conjunto")` baixa conjuntos do Kaggle; alguns pedem o arquivo `kaggle.json` com a sua chave.
""")
py("""
!pip -q install huggingface_hub pyarrow
import io, glob, random, shutil, collections
import pyarrow.parquet as pq
from huggingface_hub import snapshot_download
FR = "/content/frutas" if os.path.exists("/content") else os.path.abspath("frutas")
snapshot_download("Project-AgML/fruit_detection_worldwide", repo_type="dataset", local_dir=f"{FR}/worldwide")
snapshot_download("Project-AgML/fresh_rotten_fruit_classification", repo_type="dataset", local_dir=f"{FR}/fresh_rotten", allow_patterns=["raw/*"])
print("baixado em", FR)
""")
md("""
### Transformar no formato do YOLO

As caixas do DeepFruits vêm como canto, largura e altura em pixels. A célula converte para o formato YOLO (centro, largura e altura entre 0 e 1) e separa 80% para treino, 10% para validação e 10% para teste. As fotos de sadia/estragada vão para uma pasta por classe.
""")
py("""
FRUTAS = ["abacate", "melão", "maçã", "laranja", "morango", "manga", "pimentão"]
linhas = []
for f in sorted(glob.glob(f"{FR}/worldwide/data/*.parquet")):
    linhas += pq.read_table(f).to_pylist()
random.seed(0); idx = list(range(len(linhas))); random.shuffle(idx); n = len(idx)
partes = {"train": idx[:int(.8*n)], "val": idx[int(.8*n):int(.9*n)], "test": idx[int(.9*n):]}
DET = f"{FR}/det"; shutil.rmtree(DET, ignore_errors=True)
for split, ids in partes.items():
    os.makedirs(f"{DET}/images/{split}"); os.makedirs(f"{DET}/labels/{split}")
    for i in ids:
        r = linhas[i]; im = Image.open(io.BytesIO(r["image"]["bytes"])).convert("RGB"); W, H = im.size
        im.save(f"{DET}/images/{split}/f{i:04d}.jpg", quality=92)
        txt = [f"{c} {(x+w/2)/W:.6f} {(y+h/2)/H:.6f} {w/W:.6f} {h/H:.6f}"
               for (x, y, w, h), c in zip(r["objects"]["bbox"], r["objects"]["categories"]) if w > 1 and h > 1]
        open(f"{DET}/labels/{split}/f{i:04d}.txt", "w").write("\\n".join(txt) + "\\n")
yaml.safe_dump({"path": DET, "train": "images/train", "val": "images/val", "test": "images/test",
                "names": dict(enumerate(FRUTAS))}, open(f"{DET}/data.yaml", "w"), allow_unicode=True)
print({k: len(v) for k, v in partes.items()}, "fotos")

CLS = f"{FR}/cls"; shutil.rmtree(CLS, ignore_errors=True)
grupos = collections.defaultdict(list)
for f in sorted(glob.glob(f"{FR}/fresh_rotten/raw/*.parquet")):
    for r in pq.read_table(f).to_pylist():
        grupos[(r["fruit_type"], r["label"])].append(r)
for (fruta, lab), rs in grupos.items():
    random.shuffle(rs); n = len(rs); classe = "sadia" if lab == 0 else "estragada"
    for split, lst in {"train": rs[:int(.8*n)], "val": rs[int(.8*n):int(.9*n)], "test": rs[int(.9*n):]}.items():
        os.makedirs(f"{CLS}/{split}/{classe}", exist_ok=True)
        for k, r in enumerate(lst):
            im = Image.open(io.BytesIO(r["image"]["bytes"])).convert("RGB"); im.thumbnail((512, 512))
            im.save(f"{CLS}/{split}/{classe}/{fruta}_{k:03d}.jpg", quality=90)
print({s: {c: len(os.listdir(f"{CLS}/{s}/{c}")) for c in os.listdir(f"{CLS}/{s}")} for s in ("train", "val", "test")})
""")

md("""
## 12. Contar e identificar a fruta (detecção com YOLO26)

O mesmo comando de antes, com os pesos do YOLO26. Cada caixa sai com o nome da fruta; contar é somar as caixas de cada classe.
""")
py("""
det_frutas = YOLO("yolo26n.pt")
det_frutas.train(data=f"{DET}/data.yaml", epochs=60, imgsz=640, batch=16, patience=15, seed=0,
                 project=f"{BASE}/runs", name="frutas_det", exist_ok=True)
det_frutas = YOLO(f"{BASE}/runs/frutas_det/weights/best.pt")
r = det_frutas.val(data=f"{DET}/data.yaml", split="test", project=f"{BASE}/runs", name="frutas_det_teste", exist_ok=True, verbose=False)
print(f"teste: mAP50 {r.box.map50:.2f} · precisão {r.box.mp:.2f} · revocação {r.box.mr:.2f}")
""")
py("""
def contar_frutas(foto, conf=0.35):
    r = det_frutas.predict(foto, conf=conf, verbose=False)[0]
    return collections.Counter(FRUTAS[int(c)] for c in r.boxes.cls), r

for f in sorted(glob.glob(f"{DET}/images/test/*.jpg"))[:4]:
    contagem, r = contar_frutas(f)
    print(os.path.basename(f), dict(contagem))
    display(Mostrar(data=cv2.imencode(".jpg", r.plot())[1].tobytes(), width=700))
""")

md("""
## 13. Sadia ou estragada, e o pipeline completo

### Classificação com YOLO26
""")
py("""
cls_frutas = YOLO("yolo26n-cls.pt")
cls_frutas.train(data=CLS, epochs=20, imgsz=224, batch=64, patience=8, seed=0,
                 project=f"{BASE}/runs", name="frutas_cls", exist_ok=True)
cls_frutas = YOLO(f"{BASE}/runs/frutas_cls/weights/best.pt")
rc = cls_frutas.val(data=CLS, split="test", project=f"{BASE}/runs", name="frutas_cls_teste", exist_ok=True, verbose=False)
print(f"acerto no teste: {rc.top1:.3f}")
display(Mostrar(f"{BASE}/runs/frutas_cls/confusion_matrix_normalized.png", width=450))
""")
md("""
### Juntando tudo

O detector encontra cada fruta; o recorte de cada caixa vai para o classificador. O resultado é uma tabela por foto: quantas frutas de cada tipo, e quantas estão sadias ou estragadas.

**Atenção:** o classificador aprendeu com fotos de frutas isoladas, de perto; os recortes do pomar são menores e têm folhas ao redor. É uma mudança de domínio, como a da Syrah: confira os recortes antes de confiar nos números.
""")
py("""
def analisar(foto, conf=0.35):
    im = Image.open(foto).convert("RGB")
    r = det_frutas.predict(foto, conf=conf, verbose=False)[0]
    tabela = collections.Counter(); desenho = np.array(im)[:, :, ::-1].copy()
    for b, c in zip(r.boxes.xyxy.cpu().numpy().astype(int), r.boxes.cls.cpu().numpy().astype(int)):
        rc = cls_frutas.predict(im.crop(tuple(b)), imgsz=224, verbose=False)[0]
        estado = rc.names[rc.probs.top1]
        tabela[(FRUTAS[c], estado)] += 1
        cor = (60, 160, 60) if estado == "sadia" else (40, 40, 200)
        cv2.rectangle(desenho, tuple(b[:2]), tuple(b[2:]), cor, 3)
        cv2.putText(desenho, f"{FRUTAS[c]}: {estado}", (b[0], max(15, b[1] - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, cor, 2)
    return tabela, desenho

relatorio = []
for f in sorted(glob.glob(f"{DET}/images/test/*.jpg")):
    tabela, desenho = analisar(f)
    for (fruta, estado), n in tabela.items():
        relatorio.append({"foto": os.path.basename(f), "fruta": fruta, "estado": estado, "quantidade": n})
display(Mostrar(data=cv2.imencode(".jpg", desenho)[1].tobytes(), width=700))
rel = pd.DataFrame(relatorio)
rel.to_csv(f"{BASE}/relatorio_frutas.csv", index=False)
rel.pivot_table(index="fruta", columns="estado", values="quantidade", aggfunc="sum", fill_value=0)
""")
md("""
### Para ir além

- Tire fotos de frutas da feira ou da cozinha e rode `analisar("minha_foto.jpg")`.
- Anote no CVAT 30 fotos suas com caixas de "sadia" e "estragada" e treine um detector que faça as duas coisas de uma vez. Compare com o pipeline.
- Teste `yolo26s.pt` (maior) e compare acerto e tempo com o `yolo26n.pt`.
""")

md("""
## Para a sua dupla

1. Troque para o export do CVAT da dupla (`USAR_CVAT = True`) e repita as partes 2 a 8.
2. Teste `imgsz=960`: os objetos pequenos melhoram? Quanto tempo a mais levou?
3. Escolha o limiar na validação e só depois rode o teste.
4. Liste dez erros do teste com a causa provável de cada um.
""")

nb = {"cells": C, "metadata": {"accelerator": "GPU", "colab": {"provenance": []},
                               "kernelspec": {"display_name": "Python 3", "name": "python3"},
                               "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 0}
saida = Path(__file__).resolve().parent.parent / "notebooks" / "CVAT_YOLO_na_pratica.ipynb"
saida.write_text(json.dumps(nb, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", saida.name, len(C), "células")
