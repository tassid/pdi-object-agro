"""Figuras do projeto das frutas (YOLO26), a partir dos treinos de scripts/projeto_frutas.py.

    python scripts/figuras_frutas.py --dados ./trabalho/frutas
"""
from __future__ import annotations

import argparse
import collections
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "public" / "fig"
for f in (RAIZ / "scripts" / "fontes").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
plt.rcParams.update({"font.family": "serif", "font.serif": ["CMU Serif", "DejaVu Serif"], "font.size": 12})
MARROM, LARANJA, AZUL_E, VERDE, VERMELHO = "#775f55", "#dd8047", "#4f7fa6", "#2e7d32", "#b23a2a"
FRUTAS = ["abacate", "melão", "maçã", "laranja", "morango", "manga", "pimentão"]
CORES = ["#6b8e23", "#d4a017", "#c0392b", "#e67e22", "#e74c3c", "#f1c40f", "#27ae60"]
PT = {"apple": "maçã", "banana": "banana", "grape": "uva", "guava": "goiaba", "jujube": "jujuba", "orange": "laranja", "pomegranate": "romã", "strawberry": "morango"}


def salvar(fig, nome):
    fig.savefig(SAIDA / f"{nome}.jpg", dpi=110, bbox_inches="tight", facecolor="white", pil_kwargs={"quality": 85})
    plt.close(fig); print("ok", nome)


def limpar(ax):
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)


def rotulos(txt: Path, W, H):
    out = []
    for l in txt.read_text().splitlines():
        if l.strip():
            c, xc, yc, w, h = map(float, l.split())
            out.append((int(c), [(xc - w / 2) * W, (yc - h / 2) * H, (xc + w / 2) * W, (yc + h / 2) * H]))
    return out


def amostras(D: Path):
    det = D / "det"
    por_classe = {}
    for t in sorted((det / "labels" / "train").glob("*.txt")):
        cs = [int(l.split()[0]) for l in t.read_text().splitlines() if l.strip()]
        if cs:
            por_classe.setdefault(collections.Counter(cs).most_common(1)[0][0], t)
    fig, axs = plt.subplots(2, 4, figsize=(17, 7.4))
    for ax, c in zip(axs.flat, range(7)):
        t = por_classe[c]; im = Image.open(det / "images" / "train" / (t.stem + ".jpg")); W, H = im.size
        ax.imshow(im)
        for k, b in rotulos(t, W, H):
            ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec=CORES[k], lw=2))
        ax.set_title(FRUTAS[c], fontsize=14); limpar(ax)
    cls = D / "cls" / "train"
    ax = axs.flat[7]; ax.axis("off")
    ims = [sorted((cls / "sadia").glob("maçã*.jpg") or (cls / "sadia").glob("apple*.jpg"))[:1], sorted((cls / "estragada").glob("apple*.jpg"))[:1]]
    sad = sorted((cls / "sadia").glob("apple_*.jpg"))[0]; est = sorted((cls / "estragada").glob("apple_*.jpg"))[0]
    a = Image.open(sad).convert("RGB").resize((256, 256)); b = Image.open(est).convert("RGB").resize((256, 256))
    junta = Image.new("RGB", (522, 256), "white"); junta.paste(a, (0, 0)); junta.paste(b, (266, 0))
    ax.imshow(junta); ax.set_title("sadia × estragada (outro conjunto)", fontsize=13)
    fig.suptitle("Os dois conjuntos do projeto: DeepFruits (caixas de 7 frutas) e fresh_rotten (sadia ou estragada)", fontsize=13, y=1.0)
    salvar(fig, "frutas_amostras")


def deteccao(D: Path, R: Path):
    from ultralytics import YOLO
    m = YOLO(str(R / "frutas_det" / "weights" / "best.pt"))
    fotos = sorted((D / "det" / "images" / "test").glob("*.jpg"))
    # escolhe 4 fotos com mais objetos e frutas diferentes
    cand = []
    for f in fotos:
        g = rotulos(D / "det" / "labels" / "test" / (f.stem + ".txt"), *Image.open(f).size)
        cand.append((len(g), collections.Counter(c for c, _ in g).most_common(1)[0][0] if g else -1, f))
    cand.sort(key=lambda x: -x[0]); vistas = set(); esc = []
    for n, c, f in cand:
        if c not in vistas:
            esc.append(f); vistas.add(c)
        if len(esc) == 4:
            break
    fig, axs = plt.subplots(2, 2, figsize=(15, 10.5))
    for ax, f in zip(axs.flat, esc):
        r = m.predict(str(f), conf=0.35, verbose=False)[0]
        im = Image.open(f); W, H = im.size; ax.imshow(im)
        cont = collections.Counter()
        for b, c, p in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.cls.cpu().numpy().astype(int), r.boxes.conf.cpu().numpy()):
            cont[FRUTAS[c]] += 1
            ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec=CORES[c], lw=2.2))
            ax.text(b[0], b[1] - 3, f"{FRUTAS[c]} {p:.2f}", fontsize=8, color="white", bbox=dict(fc=CORES[c], ec="none", pad=1))
        n_gt = len(rotulos(D / "det" / "labels" / "test" / (f.stem + ".txt"), W, H))
        ax.set_title(" · ".join(f"{v} {k}" for k, v in cont.most_common()) + f"   (anotados: {n_gt})", fontsize=12); limpar(ax)
    fig.suptitle("YOLO26n treinado no DeepFruits: cada caixa diz qual fruta é, e a soma por classe é a contagem (fotos de teste)", fontsize=13, y=1.0)
    salvar(fig, "frutas_deteccao")


def classificacao(D: Path, R: Path):
    from ultralytics import YOLO
    m = YOLO(str(R / "frutas_cls" / "weights" / "best.pt"))
    acertos = collections.defaultdict(lambda: [0, 0]); M = np.zeros((2, 2), int); ordem = ["sadia", "estragada"]
    exemplos = []
    for i, cl in enumerate(ordem):
        for f in sorted((D / "cls" / "test" / cl).glob("*.jpg")):
            r = m.predict(str(f), imgsz=224, verbose=False)[0]
            pred = r.names[r.probs.top1]; j = ordem.index(pred)
            M[i, j] += 1
            fruta = PT.get(f.name.split("_")[0], f.name.split("_")[0])
            acertos[fruta][0] += int(pred == cl); acertos[fruta][1] += 1
            if len(exemplos) < 8 and (len(exemplos) % 2 == i):
                exemplos.append((f, cl, pred, float(r.probs.top1conf)))
    fig = plt.figure(figsize=(16, 5.4))
    ax = fig.add_axes([0.03, 0.1, 0.27, 0.8])
    Mn = M / M.sum(1, keepdims=True)
    ax.imshow(Mn, cmap="Oranges", vmin=0, vmax=1)
    ax.set_xticks([0, 1], ordem); ax.set_yticks([0, 1], ordem); ax.set_xlabel("previsto"); ax.set_ylabel("verdadeiro")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{Mn[i, j]:.2f}\n({M[i, j]})", ha="center", va="center", color="white" if Mn[i, j] > 0.6 else "black", fontsize=13)
    acc = np.trace(M) / M.sum()
    ax.set_title(f"sadia × estragada no teste: acerto {acc:.1%}", fontsize=12.5)
    ax2 = fig.add_axes([0.37, 0.15, 0.6, 0.72])
    nomes = sorted(acertos, key=lambda k: -acertos[k][0] / acertos[k][1])
    v = [acertos[k][0] / acertos[k][1] for k in nomes]
    ax2.bar(nomes, v, color=[LARANJA if x < 0.97 else AZUL_E for x in v])
    for k, x in enumerate(v):
        ax2.text(k, x + 0.005, f"{x:.0%}", ha="center", fontsize=11)
    ax2.set_ylim(min(v) - 0.08, 1.04); ax2.set_ylabel("acerto"); ax2.set_title("acerto por fruta", fontsize=12.5)
    for s in ("top", "right"):
        ax2.spines[s].set_visible(False)
    salvar(fig, "frutas_classificacao")
    return {"cls_acc_teste": float(acc), "cls_por_fruta": {k: acertos[k][0] / acertos[k][1] for k in nomes}, "cls_n_teste": int(M.sum())}


def pipeline(D: Path, R: Path):
    """detector acha e conta; cada recorte vai para o classificador sadia/estragada"""
    from ultralytics import YOLO
    det = YOLO(str(R / "frutas_det" / "weights" / "best.pt")); cls = YOLO(str(R / "frutas_cls" / "weights" / "best.pt"))
    fotos = sorted((D / "det" / "images" / "test").glob("*.jpg"))
    melhores = []
    for f in fotos:
        r = det.predict(str(f), conf=0.35, verbose=False)[0]
        if any(FRUTAS[int(c)] in ("maçã", "laranja", "morango") for c in r.boxes.cls.cpu().numpy()):
            melhores.append((len(r.boxes), f, r))
    melhores.sort(key=lambda x: -x[0])
    fig, axs = plt.subplots(1, 2, figsize=(16, 6.2))
    resumo_total = []
    for ax, (_, f, r) in zip(axs, melhores[:2]):
        im = Image.open(f).convert("RGB"); ax.imshow(im)
        tabela = collections.Counter()
        for b, c in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.cls.cpu().numpy().astype(int)):
            rec = im.crop(tuple(int(v) for v in b))
            rc = cls.predict(rec, imgsz=224, verbose=False)[0]
            estado = rc.names[rc.probs.top1]
            cor = VERDE if estado == "sadia" else VERMELHO
            tabela[(FRUTAS[c], estado)] += 1
            ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec=cor, lw=2.4))
            ax.text(b[0], b[1] - 3, f"{FRUTAS[c]}: {estado}", fontsize=8, color="white", bbox=dict(fc=cor, ec="none", pad=1))
        linhas = collections.defaultdict(dict)
        for (fr, es), n in tabela.items():
            linhas[fr][es] = n
        ax.set_title("  ·  ".join(f"{fr}: {sum(d.values())} ({d.get('sadia', 0)} sadias, {d.get('estragada', 0)} estragadas)" for fr, d in linhas.items()), fontsize=11.5)
        limpar(ax); resumo_total.append({fr: d for fr, d in linhas.items()})
    fig.suptitle("Pipeline completo: o detector conta e identifica a fruta; o classificador diz se cada uma está sadia (verde) ou estragada (vermelho)", fontsize=13, y=1.0)
    salvar(fig, "frutas_pipeline")
    return {"pipeline_exemplos": resumo_total}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dados", required=True)
    D = Path(ap.parse_args().dados).resolve(); R = D / "runs"
    info = json.loads((R / "frutas_metrics.json").read_text(encoding="utf-8"))
    amostras(D); deteccao(D, R)
    info.update(classificacao(D, R)); info.update(pipeline(D, R))
    (SAIDA / "frutas_resultados.json").write_text(json.dumps(info, indent=1, ensure_ascii=False), encoding="utf-8")
    (RAIZ / "src" / "frutas.json").write_text(json.dumps(info, indent=1, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(info, indent=1, ensure_ascii=False)[:1500])


if __name__ == "__main__":
    main()
