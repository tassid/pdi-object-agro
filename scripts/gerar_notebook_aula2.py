"""Gera notebooks/Aula2_YOLO_na_pratica.ipynb (uma seção por bloco da Aula 2)."""
import json
from pathlib import Path

C = []


def md(t):
    C.append({"cell_type": "markdown", "metadata": {}, "source": t.strip("\n")})


def py(t):
    C.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": t.strip("\n")})


md("""
# Aula 2 · YOLO na prática

Notebook da Aula 2 do guia **Detecção de objetos com CVAT e YOLO** (github.com/tassid/pdi-object-agro).

Cada seção corresponde a um bloco da aula. Execute de cima para baixo.

| Seção | Bloco |
|---|---|
| 1. Ambiente | 2.1 Montar o Colab |
| 2. Dados (WGISD ou o export do CVAT da dupla) | 2.1 |
| 3. Treinar | 2.2 |
| 4. Ler os resultados | 2.3 |
| 5. Usar o modelo: contar, salvar, vídeo, exportar | 2.4 |
| 6. Testar em outro lugar e analisar erros | 2.5 |
| 7. Registro do experimento | 2.7 |

Antes de começar: **Ambiente de execução → Alterar o tipo de ambiente → GPU (T4)**.
""")

md("## 1. Ambiente")
py("""
!nvidia-smi --query-gpu=name,memory.total --format=csv
!pip -q install ultralytics
import sys, torch, ultralytics
print("Python", sys.version.split()[0], "| torch", torch.__version__, "| ultralytics", ultralytics.__version__)
print("GPU disponível:", torch.cuda.is_available())
""")
md("""
### Salvar no Google Drive (recomendado)

O Colab apaga tudo quando a sessão termina. Montando o Drive, os pesos e os resultados ficam guardados.
""")
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

md("""
## 2. Dados

Duas opções:

- **WGISD** (padrão): fotos de uva da Embrapa, já anotadas no formato YOLO. O treino usa quatro variedades e o teste usa a **Syrah**, que o modelo nunca viu (Seção 6).
- **Export do CVAT da dupla**: no CVAT, *Export dataset → Ultralytics YOLO Detection 1.0*, marcar *Save images*, e enviar o `.zip` ao Drive. Troque `USAR_CVAT` para `True` e informe o caminho.
""")
py("""
USAR_CVAT = False
ZIP_CVAT = "/content/drive/MyDrive/pdi_yolo/meu_export_cvat.zip"

import glob, random, shutil, yaml
import numpy as np, pandas as pd
from PIL import Image

SAIDA = "/content/dataset" if os.path.exists("/content") else os.path.abspath("dataset")
shutil.rmtree(SAIDA, ignore_errors=True)

if USAR_CVAT:
    shutil.unpack_archive(ZIP_CVAT, SAIDA)
    DATA = glob.glob(f"{SAIDA}/**/data.yaml", recursive=True)[0]
    print(open(DATA).read())
else:
    if not os.path.exists("wgisd"):
        os.system("git clone -q --depth 1 https://github.com/thsant/wgisd.git")
    fotos = sorted(glob.glob("wgisd/data/*.jpg"))
    df = pd.DataFrame({"foto": fotos})
    df["nome"] = [os.path.basename(f)[:-4] for f in fotos]
    df["variedade"] = df.nome.str[:3]
    random.seed(0)
    def conjunto(r):
        if r.variedade == "SYH":
            return "test"                      # variedade nunca vista no treino
        return "val" if random.random() < 0.12 else "train"
    df["conjunto"] = df.apply(conjunto, axis=1)
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
""")
md("### Conferência antes de treinar\n\nCada imagem precisa de um `.txt` com o mesmo nome. Nenhum treino deve começar sem esta célula passar.")
py("""
import matplotlib.pyplot as plt, matplotlib.patches as patches
raiz = os.path.dirname(DATA)
for s in ("train", "val", "test"):
    imgs = glob.glob(f"{raiz}/images/{s}/*")
    rots = glob.glob(f"{raiz}/labels/{s}/*.txt")
    print(f"{s:5s}: {len(imgs):4d} imagens, {len(rots):4d} rótulos")
    assert len(imgs) == len(rots) or len(imgs) == 0, f"faltam rótulos em {s}"

f = sorted(glob.glob(f"{raiz}/images/train/*"))[0]
im = Image.open(f); W, H = im.size
fig, ax = plt.subplots(figsize=(9, 6)); ax.imshow(im); ax.axis("off")
for linha in open(f.replace("images", "labels").rsplit(".", 1)[0] + ".txt"):
    c, xc, yc, w, h = map(float, linha.split())
    ax.add_patch(patches.Rectangle(((xc - w/2) * W, (yc - h/2) * H), w * W, h * H, fill=False, ec="orange", lw=2))
ax.set_title(os.path.basename(f) + " · confira se as caixas batem com os objetos")
""")

md("""
## 3. Treinar

Comece sempre de pesos já treinados (`yolo11n.pt`). Com uma T4, 40 épocas em 640 pixels levam cerca de 15 minutos: dispare antes do intervalo.

| parâmetro | o que faz | valor inicial |
|---|---|---|
| `epochs` | quantas vezes o modelo vê o conjunto | 40 |
| `imgsz` | tamanho da imagem na entrada; maior ajuda objetos pequenos e gasta mais memória | 640 |
| `batch` | imagens por passo; reduza se faltar memória | 16 |
| `patience` | para se a validação não melhorar por tantas épocas | 15 |
""")
py("""
from ultralytics import YOLO
EPOCAS = 40
modelo = YOLO("yolo11n.pt")
modelo.train(data=DATA, epochs=EPOCAS, imgsz=640, batch=16, patience=15, seed=0,
             project=f"{BASE}/runs", name="uva", exist_ok=True, plots=True)
PASTA = f"{BASE}/runs/uva"
print("pesos:", os.listdir(f"{PASTA}/weights"))
""")
md("Se a sessão cair, retome de onde parou:")
py("""
# YOLO(f"{PASTA}/weights/last.pt").train(resume=True)
""")

md("""
## 4. Ler os resultados

O Ultralytics grava tudo na pasta do treino. Olhe nesta ordem: `results.png` (as perdas caem? a validação para de melhorar?), `val_batch0_pred.jpg` (as caixas fazem sentido?) e os números da validação.
""")
py("""
from IPython.display import Image as Mostrar, display
for arq in ["results.png", "val_batch0_pred.jpg", "BoxF1_curve.png"]:
    p = f"{PASTA}/{arq}"
    if os.path.exists(p):
        print(arq); display(Mostrar(p, width=900))
""")
py("""
melhor = YOLO(f"{PASTA}/weights/best.pt")
val = melhor.val(data=DATA, split="val", verbose=False)
print(f"precisão {val.box.mp:.2f} · revocação {val.box.mr:.2f} · mAP50 {val.box.map50:.2f} · mAP50-95 {val.box.map:.2f}")
""")
md("### Qual limiar de confiança usar para contar?\n\nEscolha na **validação**, comparando o número de caixas com o número de objetos anotados.")
py("""
def contar(modelo, pasta_imgs, conf):
    linhas = []
    for f in sorted(glob.glob(f"{pasta_imgs}/*")):
        n = sum(1 for l in open(f.replace("images", "labels").rsplit(".", 1)[0] + ".txt") if l.strip())
        n_hat = len(modelo.predict(f, conf=conf, verbose=False)[0].boxes)
        linhas.append((os.path.basename(f), n, n_hat))
    return pd.DataFrame(linhas, columns=["imagem", "anotados", "detectados"])

tabela = []
for conf in [0.1, 0.25, 0.4, 0.55, 0.7]:
    t = contar(melhor, f"{raiz}/images/val", conf)
    erro = t.detectados - t.anotados
    tabela.append({"conf": conf, "erro médio absoluto": erro.abs().mean(), "viés": erro.mean()})
pd.DataFrame(tabela).round(2)
""")

md("## 5. Usar o modelo\n\n### Contar cachos em fotos novas e salvar uma planilha")
py("""
import cv2
CONF = 0.4   # use o limiar escolhido na seção 4
fotos_novas = sorted(glob.glob(f"{raiz}/images/test/*"))[:10]
# para usar suas fotos: from google.colab import files; fotos_novas = list(files.upload().keys())
res = []
for f in fotos_novas:
    r = melhor.predict(f, conf=CONF, verbose=False)[0]
    res.append({"foto": os.path.basename(f), "cachos": len(r.boxes),
                "confiança média": float(r.boxes.conf.mean()) if len(r.boxes) else 0})
planilha = pd.DataFrame(res)
planilha.to_csv(f"{BASE}/contagem.csv", index=False)
display(Mostrar(data=cv2.imencode(".jpg", r.plot())[1].tobytes(), width=800))  # última foto com as caixas
planilha
""")
md("""
### Vídeo: contar sem repetir com rastreamento

Num vídeo, o mesmo cacho aparece em muitos quadros. O rastreador (ByteTrack) dá um número de identificação a cada objeto; a contagem é o número de identificações diferentes. Sem um vídeo do vinhedo, a célula simula uma câmera andando sobre uma foto.
""")
py("""
import cv2
foto = sorted(glob.glob(f"{raiz}/images/test/*"))[0]
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
print("soma das detecções em todos os quadros:", soma)
print("cachos diferentes (identificações):", len(ids))
""")
md("### Exportar para usar fora do Colab")
py("""
caminho = melhor.export(format="onnx", imgsz=640)
print("arquivo:", caminho)
print(len(YOLO(caminho).predict(fotos_novas[0], conf=CONF, verbose=False)[0].boxes), "caixas no modelo exportado")
""")

md("""
## 6. Testar em outro lugar e analisar os erros

O conjunto de teste contém só a variedade **Syrah**, que não estava no treino. Compare com a validação: a diferença mostra quanto o modelo perde num lugar novo.
""")
py("""
teste = melhor.val(data=DATA, split="test", verbose=False)
pd.DataFrame({"validação (variedades vistas)": [val.box.mp, val.box.mr, val.box.map50, val.box.map],
              "teste (Syrah, nunca vista)": [teste.box.mp, teste.box.mr, teste.box.map50, teste.box.map]},
             index=["precisão", "revocação", "mAP50", "mAP50-95"]).round(3)
""")
md("Anotação (verde) contra previsão (laranja) em cinco fotos do teste. Classifique cada erro: oclusão, cacho pequeno, borda, iluminação, caixa duplicada ou cacho que ninguém anotou.")
py("""
fig, axs = plt.subplots(5, 1, figsize=(10, 30))
for ax, f in zip(axs, sorted(glob.glob(f"{raiz}/images/test/*"))[:5]):
    im = Image.open(f); W, H = im.size; ax.imshow(im); ax.axis("off")
    for linha in open(f.replace("images", "labels").rsplit(".", 1)[0] + ".txt"):
        c, xc, yc, w, h = map(float, linha.split())
        ax.add_patch(patches.Rectangle(((xc - w/2) * W, (yc - h/2) * H), w * W, h * H, fill=False, ec="limegreen", lw=2, ls="--"))
    for b in melhor.predict(f, conf=CONF, verbose=False)[0].boxes.xyxy.cpu().numpy():
        ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec="orange", lw=2))
    ax.set_title(os.path.basename(f))
""")

md("## 7. Registro do experimento\n\nGuarde junto dos pesos tudo o que é preciso para repetir o resultado.")
py("""
import platform
registro = {"pesos_iniciais": "yolo11n.pt", "epocas": EPOCAS, "imgsz": 640, "batch": 16, "patience": 15, "seed": 0,
            "conf_contagem": CONF, "dados": DATA, "ultralytics": ultralytics.__version__, "torch": torch.__version__,
            "python": platform.python_version(), "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
            "val": {"P": val.box.mp, "R": val.box.mr, "mAP50": val.box.map50, "mAP50-95": val.box.map},
            "teste": {"P": teste.box.mp, "R": teste.box.mr, "mAP50": teste.box.map50, "mAP50-95": teste.box.map}}
json.dump(registro, open(f"{PASTA}/registro.json", "w"), indent=1, default=float)
registro
""")
md("""
## Para a dupla

1. Troque para o export do CVAT da dupla (`USAR_CVAT = True`) e repita as seções 2 a 6.
2. Teste `imgsz=960`: os cachos pequenos melhoram? Quanto tempo a mais levou?
3. Escolha o limiar de contagem na validação e só depois rode o teste.
4. Liste dez erros do teste com a causa provável de cada um.
""")

py_imports = 'import json\n'
C[1:1] = []
nb = {"cells": C, "metadata": {"accelerator": "GPU", "colab": {"provenance": []}, "kernelspec": {"display_name": "Python 3", "name": "python3"},
                                "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 0}
# json é usado na seção 7
for c in nb["cells"]:
    if c["cell_type"] == "code" and c["source"].startswith("import platform"):
        c["source"] = "import json, platform" + c["source"][len("import platform"):]
saida = Path(__file__).resolve().parent.parent / "notebooks" / "Aula2_YOLO_na_pratica.ipynb"
saida.write_text(json.dumps(nb, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", saida.name, len(C), "células")
