"""
Figuras geradas a partir de TREINOS REAIS de YOLO11n no WGISD (Embrapa).

Pré-requisitos
    pip install ultralytics opencv-python matplotlib pillow
    python scripts/treinar_wgisd.py --dados <pasta>     # gera <pasta>/runs/{A_pre,A_scratch,B_dom}

Uso
    python scripts/figuras_reais.py --dados <pasta>

Experimentos (ver treinar_wgisd.py)
    A_pre      YOLO11n com pesos COCO, partição oficial do WGISD (treino 205, validação 37, teste 58)
    A_scratch  mesma partição, sem pesos pré-treinados
    B_dom      treino sem a variedade Syrah; teste somente com as 48 imagens de Syrah

Cada função fig_* grava public/fig/<nome>.jpg, citado no site.
"""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import cv2
import matplotlib

matplotlib.use("Agg")
import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "public" / "fig"
SAIDA.mkdir(parents=True, exist_ok=True)

# paleta da Aula 5
MARROM, LARANJA, AZUL, AZUL_E, CREME = "#775f55", "#dd8047", "#94b6d2", "#4f7fa6", "#ebddc3"
VERDE, VERMELHO = "#2e7d32", "#b23a2a"

for f in (RAIZ / "scripts" / "fontes").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
plt.rcParams.update({
    "font.family": "serif", "font.serif": ["CMU Serif", "DejaVu Serif"], "mathtext.fontset": "cm",
    "font.size": 12, "axes.titlesize": 13, "axes.titleweight": "normal", "axes.spines.top": False, "axes.spines.right": False,
    "axes.edgecolor": "#333", "axes.prop_cycle": plt.cycler(color=[MARROM, LARANJA, AZUL_E, VERDE]),
})


def salvar(fig, nome):
    fig.savefig(SAIDA / f"{nome}.jpg", dpi=115, bbox_inches="tight", facecolor="white", pil_kwargs={"quality": 84, "optimize": True})
    plt.close(fig)
    print("ok", nome)


def limpar(axes):
    for ax in np.atleast_1d(axes).flat:
        ax.set_xticks([]); ax.set_yticks([])
        for s in ax.spines.values():
            s.set_visible(False)


def rgb(p):
    return cv2.cvtColor(cv2.imread(str(p)), cv2.COLOR_BGR2RGB)


def gt_de(lbl: Path, w, h):
    if not lbl.exists():
        return np.zeros((0, 4))
    a = np.array([list(map(float, l.split()[1:5])) for l in lbl.read_text().splitlines() if l.strip()])
    if len(a) == 0:
        return np.zeros((0, 4))
    xc, yc, bw, bh = a.T
    return np.stack([(xc - bw / 2) * w, (yc - bh / 2) * h, (xc + bw / 2) * w, (yc + bh / 2) * h], 1)


def iou_m(a, b):
    if len(a) == 0 or len(b) == 0:
        return np.zeros((len(a), len(b)))
    x1 = np.maximum(a[:, None, 0], b[None, :, 0]); y1 = np.maximum(a[:, None, 1], b[None, :, 1])
    x2 = np.minimum(a[:, None, 2], b[None, :, 2]); y2 = np.minimum(a[:, None, 3], b[None, :, 3])
    inter = np.clip(x2 - x1, 0, None) * np.clip(y2 - y1, 0, None)
    aa = (a[:, 2] - a[:, 0]) * (a[:, 3] - a[:, 1]); ab = (b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1])
    return inter / (aa[:, None] + ab[None, :] - inter + 1e-9)


def casar(pred, conf, gt, thr=0.5):
    """correspondência gulosa por confiança; devolve vetor TP (bool) por previsão e máscara de GT encontrados"""
    ordem = np.argsort(-conf)
    usado = np.zeros(len(gt), bool); tp = np.zeros(len(pred), bool)
    M = iou_m(pred, gt)
    for i in ordem:
        if len(gt) == 0:
            break
        j = np.argmax(np.where(usado, -1, M[i]))
        if M[i, j] >= thr and not usado[j]:
            usado[j] = True; tp[i] = True
    return tp, usado


def caixa(ax, b, cor, lw=2.2, ls="-", txt=None):
    ax.add_patch(patches.Rectangle((b[0], b[1]), b[2] - b[0], b[3] - b[1], fill=False, ec=cor, lw=lw, ls=ls))
    if txt:
        ax.text(b[0], b[1] - 5, txt, fontsize=8, color="white", bbox=dict(fc=cor, ec="none", pad=1.2))


# ======================================================================= Aula 5 → detecção
def feats_cachos(D: Path, variedades, max_por=400):
    """características simples de cada cacho anotado (recorte da caixa): brilho médio (V) e saturação média (S) em HSV"""
    out = {v: [] for v in variedades}
    crops = {v: [] for v in variedades}
    for v in variedades:
        for img_p in sorted((D / "raw").glob(f"{v}_*.jpg")):
            im = rgb(img_p); h, w = im.shape[:2]
            hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
            for b in gt_de(img_p.with_suffix(".txt"), w, h).astype(int):
                x1, y1, x2, y2 = np.clip(b, 0, [w, h, w, h])
                if (x2 - x1) < 20 or (y2 - y1) < 20:
                    continue
                r = hsv[y1:y2, x1:x2].reshape(-1, 3).astype(float)
                out[v].append([r[:, 2].mean() / 255, r[:, 1].mean() / 255])
                if len(crops[v]) < 6:
                    crops[v].append(im[y1:y2, x1:x2])
            if len(out[v]) >= max_por:
                break
        out[v] = np.array(out[v])
    return out, crops


def fig_aula5(D: Path):
    A, B = "CDY", "SYH"
    nomes = {"CDY": "Chardonnay", "SYH": "Syrah (antes da maturação)"}
    F, crops = feats_cachos(D, [A, B])
    # --- (1) "salmão × robalo": recortes reais + histograma de uma característica + limiar
    fig = plt.figure(figsize=(13, 6.4))
    gs = fig.add_gridspec(2, 7, height_ratios=[1, 1.35], hspace=0.35)
    for k, v in enumerate([A, B]):
        for j in range(3):
            ax = fig.add_subplot(gs[0, k * 4 + j if k == 0 else 4 + j]); ax.imshow(crops[v][j]); limpar(ax)
            if j == 0:
                ax.set_title(nomes[v], loc="left", fontsize=12)
    ax = fig.add_subplot(gs[1, :])
    xa, xb = F[A][:, 0], F[B][:, 0]
    bins = np.linspace(0.1, 0.8, 40)
    ax.hist(xa, bins, alpha=0.75, color=CREME, ec=MARROM, label=f"{nomes[A]}, $n$={len(xa)}")
    ax.hist(xb, bins, alpha=0.65, color=AZUL, ec=AZUL_E, label=f"{nomes[B]}, $n$={len(xb)}")
    ts = np.linspace(0.1, 0.8, 300)
    err = [((xa >= t).sum() + (xb < t).sum()) / (len(xa) + len(xb)) for t in ts]  # regra: V >= t -> Syrah
    t1 = ts[int(np.argmin(err))]
    custo = [((xa >= t).sum() * 1 + (xb < t).sum() * 4) for t in ts]  # chamar Syrah de Chardonnay custa 4x
    t2 = ts[int(np.argmin(custo))]
    ax.axvline(t1, color=MARROM, lw=2, ls="--"); ax.text(t1 + 0.005, ax.get_ylim()[1] * 0.93, f"$t^*$ = {t1:.2f}: menor erro ({min(err):.1%})", color=MARROM)
    e2 = ((xa >= t2).sum() + (xb < t2).sum()) / (len(xa) + len(xb))
    ax.axvline(t2, color=LARANJA, lw=2, ls=":"); ax.text(t2 - 0.005, ax.get_ylim()[1] * 0.90, f"$t_c$ = {t2:.2f}: menor custo, erro {e2:.1%}\n(chamar Syrah de Chardonnay custa 4×)", color=LARANJA, ha="right")
    ax.set_xlabel(r"brilho médio do cacho, $V$ em HSV (0 a 1); regra: $V \geq t$ → Syrah"); ax.set_ylabel("número de cachos"); ax.legend(frameon=False, loc="center right")
    salvar(fig, "aula5_limiar_cachos")

    # --- (2) fronteiras: simples demais, linear, complexa demais (erro de treino e de teste reais)
    X = np.vstack([F[A], F[B]]); y = np.r_[np.zeros(len(F[A])), np.ones(len(F[B]))]
    rng = np.random.default_rng(0); idx = rng.permutation(len(y)); cut = int(0.6 * len(y))
    tr, te = idx[:cut], idx[cut:]
    mu, sd = X[tr].mean(0), X[tr].std(0); Z = (X - mu) / sd

    def perceptron(Z, y, ep=60, lr=0.1):
        w = np.zeros(3)
        Zb = np.c_[Z, np.ones(len(Z))]
        for _ in range(ep):
            for i in rng.permutation(len(y)):
                p = float(Zb[i] @ w >= 0)
                w += lr * (y[i] - p) * Zb[i]
        return w

    w = perceptron(Z[tr], y[tr])
    lin = lambda Q: (np.c_[Q, np.ones(len(Q))] @ w >= 0).astype(float)
    def knn1(Q):
        d = ((Q[:, None, :] - Z[tr][None]) ** 2).sum(-1)
        return y[tr][d.argmin(1)]
    modelos = [("simples demais: sempre a classe mais comum", lambda Q: np.zeros(len(Q))),
               ("linear (perceptron)", lin),
               ("complexo demais: 1 vizinho mais próximo", knn1)]
    gx, gy = np.meshgrid(np.linspace(Z[:, 0].min() - .3, Z[:, 0].max() + .3, 300), np.linspace(Z[:, 1].min() - .3, Z[:, 1].max() + .3, 300))
    G = np.c_[gx.ravel(), gy.ravel()]
    fig, axs = plt.subplots(1, 3, figsize=(15, 4.8), sharey=True)
    for ax, (nome, f) in zip(axs, modelos):
        ax.contourf(gx, gy, f(G).reshape(gx.shape), levels=[-.5, .5, 1.5], colors=[CREME, "#d6e4ef"], alpha=0.9)
        ax.scatter(*Z[tr][y[tr] == 0].T, s=9, c=MARROM, label="Chardonnay (treino)")
        ax.scatter(*Z[tr][y[tr] == 1].T, s=9, c=AZUL_E, marker="^", label="Syrah (treino)")
        e_tr = (f(Z[tr]) != y[tr]).mean(); e_te = (f(Z[te]) != y[te]).mean()
        ax.set_title(f"{nome}\nerro de treino {e_tr:.1%} · erro de teste {e_te:.1%}", fontsize=11.5)
        ax.set_xlabel("brilho $V$ (padronizado)")
    axs[0].set_ylabel("saturação $S$ (padronizada)"); axs[0].legend(frameon=False, fontsize=9, loc="lower left")
    salvar(fig, "aula5_fronteiras_cachos")

    # --- (3) da classificação de recortes à detecção: o mesmo problema dentro da imagem inteira
    p = sorted((D / "raw").glob("SYH_*.jpg"))[3]
    im = rgb(p); h, w = im.shape[:2]; g = gt_de(p.with_suffix(".txt"), w, h)
    fig, axs = plt.subplots(1, 2, figsize=(13, 4.6), gridspec_kw={"width_ratios": [1, 2.2]})
    b = g[np.argmax((g[:, 2] - g[:, 0]) * (g[:, 3] - g[:, 1]))].astype(int)
    axs[0].imshow(im[b[1]:b[3], b[0]:b[2]]); axs[0].set_title("Aula 5: um objeto já recortado\n→ qual é a classe?", fontsize=12); limpar(axs[0])
    axs[1].imshow(im); [caixa(axs[1], bb, LARANJA, 2) for bb in g]
    axs[1].set_title(f"Esta aula: a imagem inteira\n→ onde estão os objetos, quantos são ({len(g)}) e de que classe?", fontsize=12); limpar(axs[1])
    salvar(fig, "aula5_recorte_vs_deteccao")


# ======================================================================= modelos treinados
def carregar(R: Path, nome):
    from ultralytics import YOLO
    return YOLO(str(R / nome / "weights" / "best.pt"))


def prever(model, p, conf=0.25, iou=0.7, imgsz=1024):
    r = model.predict(str(p), conf=conf, iou=iou, imgsz=imgsz, verbose=False)[0]
    return r.boxes.xyxy.cpu().numpy(), r.boxes.conf.cpu().numpy()


def fig_coco_falha(D: Path):
    from ultralytics import YOLO
    m = YOLO("yolo11n.pt")
    p = D / "A" / "images" / "test" / sorted(x.name for x in (D / "A" / "images" / "test").glob("CDY*.jpg"))[0]
    r = m.predict(str(p), conf=0.15, imgsz=1024, verbose=False)[0]
    im = rgb(p); h, w = im.shape[:2]; g = gt_de(D / "A" / "labels" / "test" / (p.stem + ".txt"), w, h)
    fig, axs = plt.subplots(1, 2, figsize=(14, 4.8))
    axs[0].imshow(im); [caixa(axs[0], b, VERDE, 2) for b in g]; axs[0].set_title(f"anotação (WGISD): {len(g)} cachos", fontsize=12)
    axs[1].imshow(im)
    nomes = r.names
    for b, c, k in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.conf.cpu().numpy(), r.boxes.cls.cpu().numpy().astype(int)):
        caixa(axs[1], b, LARANJA, 2, txt=f"{nomes[k]} {c:.2f}")
    axs[1].set_title(f"YOLO11n pré-treinado no COCO, sem ajuste: {len(r.boxes)} detecções (conf $\\geq$ 0,15)", fontsize=12)
    limpar(axs)
    salvar(fig, "real_coco_sem_ajuste")
    return {"coco_n": int(len(r.boxes)), "coco_classes": sorted({nomes[int(k)] for k in r.boxes.cls.cpu().numpy()}), "gt": int(len(g))}


def imagens_teste(D: Path, exp="A"):
    return sorted((D / exp / "images" / "test").glob("*.jpg"))


def fig_predicoes(D: Path, R: Path):
    m = carregar(R, "A_pre")
    ps = imagens_teste(D)
    esc = [next(p for p in ps if p.name.startswith(v)) for v in ("CDY", "CSV", "SVB", "SYH")]
    fig, axs = plt.subplots(2, 2, figsize=(14, 9.6))
    for ax, p in zip(axs.flat, esc):
        im = rgb(p); h, w = im.shape[:2]
        g = gt_de(D / "A" / "labels" / "test" / (p.stem + ".txt"), w, h)
        b, c = prever(m, p)
        tp, achou = casar(b, c, g)
        ax.imshow(im)
        for bb in g[~achou]:
            caixa(ax, bb, VERMELHO, 2.4, "--")
        for bb, cc, t in zip(b, c, tp):
            caixa(ax, bb, AZUL_E if t else LARANJA, 2, txt=f"{cc:.2f}")
        ax.set_title(f"{p.stem}: {tp.sum()} VP · {(~tp).sum()} FP · {(~achou).sum()} FN  (anotados: {len(g)})", fontsize=11)
    limpar(axs)
    fig.suptitle("YOLO11n ajustado no WGISD, imagens de teste. Azul: acerto (IoU $\\geq$ 0,5); laranja: falso positivo; vermelho tracejado: cacho não encontrado.", fontsize=11.5, y=0.995)
    salvar(fig, "real_predicoes_teste")


def fig_limiares(D: Path, R: Path):
    m = carregar(R, "A_pre")
    p = next(x for x in imagens_teste(D) if x.name.startswith("CSV"))
    im = rgb(p); h, w = im.shape[:2]; g = gt_de(D / "A" / "labels" / "test" / (p.stem + ".txt"), w, h)
    b0, c0 = prever(m, p, conf=0.01)
    fig, axs = plt.subplots(1, 4, figsize=(17, 3.9))
    for ax, t in zip(axs, [0.05, 0.25, 0.5, 0.75]):
        k = c0 >= t; b, c = b0[k], c0[k]
        tp, achou = casar(b, c, g)
        ax.imshow(im)
        for bb, ok in zip(b, tp):
            caixa(ax, bb, AZUL_E if ok else LARANJA, 1.6)
        P = tp.sum() / max(1, len(b)); Rr = achou.sum() / max(1, len(g))
        ax.set_title(f"conf $\\geq$ {t:.2f}\n{len(b)} caixas · P = {P:.2f} · R = {Rr:.2f}", fontsize=11)
    limpar(axs)
    salvar(fig, "real_limiar_confianca")


def fig_nms(D: Path, R: Path):
    m = carregar(R, "A_pre")
    p = next(x for x in imagens_teste(D) if x.name.startswith("SVB"))
    im = rgb(p)
    b1, c1 = prever(m, p, conf=0.1, iou=0.99)  # praticamente sem supressão
    b2, c2 = prever(m, p, conf=0.1, iou=0.7)
    b3, c3 = prever(m, p, conf=0.1, iou=0.3)
    fig, axs = plt.subplots(1, 3, figsize=(16, 4.4))
    for ax, (b, t) in zip(axs, [(b1, "limiar de IoU do NMS = 0,99 (quase sem supressão)"), (b2, "IoU = 0,7 (padrão do Ultralytics)"), (b3, "IoU = 0,3 (supressão agressiva)")]):
        ax.imshow(im); [caixa(ax, bb, LARANJA, 1.3) for bb in b]; ax.set_title(f"{t}\n{len(b)} caixas", fontsize=11)
    limpar(axs)
    salvar(fig, "real_nms_limiares")
    return {"nms": [int(len(b1)), int(len(b2)), int(len(b3))]}


def ler_csv(p: Path):
    with open(p) as f:
        rows = list(csv.DictReader(f))
    return {k.strip(): np.array([float(r[k]) for r in rows]) for k in rows[0]}


def fig_curvas(R: Path):
    a, s = ler_csv(R / "A_pre" / "results.csv"), ler_csv(R / "A_scratch" / "results.csv")
    fig, axs = plt.subplots(1, 3, figsize=(16, 4.3))
    axs[0].plot(a["epoch"], a["train/box_loss"], color=MARROM, label="treino"); axs[0].plot(a["epoch"], a["val/box_loss"], color=LARANJA, label="validação")
    axs[0].set_title("perda de caixa, modelo pré-treinado"); axs[0].set_xlabel("época"); axs[0].legend(frameon=False)
    axs[1].plot(a["epoch"], a["train/cls_loss"], color=MARROM, label="treino"); axs[1].plot(a["epoch"], a["val/cls_loss"], color=LARANJA, label="validação")
    axs[1].set_title("perda de classificação"); axs[1].set_xlabel("época"); axs[1].legend(frameon=False)
    axs[2].plot(a["epoch"], a["metrics/mAP50(B)"], color=AZUL_E, label="pesos COCO (transferência)")
    axs[2].plot(s["epoch"], s["metrics/mAP50(B)"], color=MARROM, ls="--", label="pesos aleatórios")
    axs[2].set_title("mAP50 na validação"); axs[2].set_xlabel("época"); axs[2].set_ylim(0, 1); axs[2].legend(frameon=False, loc="lower right")
    salvar(fig, "real_curvas_treino")
    # parada antecipada: experimento B, o único que parou antes das 80 épocas
    a = ler_csv(R / "B_dom" / "results.csv")
    k = "metrics/mAP50-95(B)"; fit = 0.1 * a["metrics/mAP50(B)"] + 0.9 * a[k]
    best = int(np.argmax(fit))
    fig, ax = plt.subplots(figsize=(10, 3.8))
    ax.plot(a["epoch"], a[k], color=AZUL_E, label="mAP50–95 (validação, experimento B)")
    ax.plot(a["epoch"], a["val/box_loss"] / a["val/box_loss"].max(), color=LARANJA, ls="--", label="perda de caixa na validação (normalizada)")
    ax.axvline(a["epoch"][best], color=MARROM, lw=1.5); ax.text(a["epoch"][best] + 0.5, 0.15, f"melhor época: {int(a['epoch'][best])}\n(best.pt)", color=MARROM)
    ax.axvspan(a["epoch"][best], a["epoch"][best] + 20, color=CREME, alpha=0.5)
    ax.text(a["epoch"][best] + 1, 0.92, "paciência: 20 épocas sem melhora", fontsize=10); ax.axvline(a["epoch"][-1], color="#999", ls=":"); ax.text(a["epoch"][-1] + 0.5, 0.05, f"parou na época {int(a['epoch'][-1])}", fontsize=10)
    ax.set_xlabel("época"); ax.set_ylim(0, 1); ax.legend(frameon=False, loc="lower right")
    salvar(fig, "real_parada_antecipada")
    return {"best_epoch": int(a["epoch"][best]), "epochs_B": int(a["epoch"][-1]), "epochs_A": int(ler_csv(R / "A_pre" / "results.csv")["epoch"][-1]), "epochs_scratch": int(s["epoch"][-1])}


def pr_de(model, D: Path, exp="A", split="test"):
    pts = []; ngt = 0; contagem = []
    for p in sorted((D / exp / "images" / split).glob("*.jpg")):
        im = cv2.imread(str(p)); h, w = im.shape[:2]
        g = gt_de(D / exp / "labels" / split / (p.stem + ".txt"), w, h); ngt += len(g)
        b, c = prever(model, p, conf=0.001)
        tp, _ = casar(b, c, g)
        pts += list(zip(c, tp))
        contagem.append((p.stem, len(g), int((c >= 0.25).sum())))
    pts.sort(key=lambda x: -x[0])
    c = np.array([x[0] for x in pts]); t = np.array([x[1] for x in pts], float)
    tpc = np.cumsum(t); P = tpc / np.arange(1, len(t) + 1); Rr = tpc / ngt
    return c, P, Rr, contagem


def fig_pr_contagem(D: Path, R: Path):
    m = carregar(R, "A_pre")
    c, P, Rr, cont = pr_de(m, D)
    Pi = np.maximum.accumulate(P[::-1])[::-1]
    ap = np.trapezoid(Pi, Rr) if hasattr(np, "trapezoid") else np.trapz(Pi, Rr)
    F1 = 2 * P * Rr / (P + Rr + 1e-9)
    fig, axs = plt.subplots(1, 2, figsize=(13, 4.5))
    axs[0].plot(Rr, P, color=MARROM, lw=1, alpha=0.5, label="precisão bruta")
    axs[0].plot(Rr, Pi, color=AZUL_E, lw=2.2, label=f"envoltória interpolada · AP50 ≈ {ap:.3f}")
    j = np.argmin(np.abs(c - 0.25)); axs[0].plot(Rr[j], P[j], "o", color=LARANJA, ms=9, label=f"conf = 0,25 → P = {P[j]:.2f}, R = {Rr[j]:.2f}")
    axs[0].set_xlabel("revocação"); axs[0].set_ylabel("precisão"); axs[0].set_xlim(0, 1); axs[0].set_ylim(0, 1.02); axs[0].legend(frameon=False, loc="lower left")
    axs[0].set_title("curva precisão–revocação (teste, IoU $\\geq$ 0,5)")
    order = np.argsort(c); axs[1].plot(c[order], F1[order], color=MARROM)
    k = np.argmax(F1); axs[1].axvline(c[k], color=LARANJA, ls="--"); axs[1].text(c[k] + 0.02, 0.1, f"F1 máx = {F1[k]:.2f}\nem conf = {c[k]:.2f}", color=LARANJA)
    axs[1].set_xlabel("limiar de confiança"); axs[1].set_ylabel("F1"); axs[1].set_ylim(0, 1); axs[1].set_title("F1 em função do limiar")
    salvar(fig, "real_pr_f1")
    g = np.array([x[1] for x in cont]); p = np.array([x[2] for x in cont])
    fig, axs = plt.subplots(1, 2, figsize=(13, 4.5))
    mx = max(g.max(), p.max()) + 3
    axs[0].plot([0, mx], [0, mx], color="#999", ls="--"); axs[0].scatter(g, p, color=MARROM, s=28)
    axs[0].set_xlabel("cachos anotados"); axs[0].set_ylabel("cachos detectados (conf $\\geq$ 0,25)"); axs[0].set_title("contagem por imagem (58 imagens de teste)")
    e = p - g
    axs[1].hist(e, bins=np.arange(e.min() - 0.5, e.max() + 1.5), color=CREME, ec=MARROM)
    axs[1].set_xlabel("erro de contagem (detectados − anotados)"); axs[1].set_ylabel("imagens")
    axs[1].set_title(f"EAM = {np.abs(e).mean():.2f} cachos · viés = {e.mean():+.2f} · erro relativo = {np.abs(e).sum() / g.sum():.1%}")
    salvar(fig, "real_contagem")
    return {"AP50_test_manual": float(ap), "F1max": float(F1[k]), "conf_F1max": float(c[k]), "P@0.25": float(P[j]), "R@0.25": float(Rr[j]), "EAM": float(np.abs(e).mean()), "vies": float(e.mean()), "erro_rel": float(np.abs(e).sum() / g.sum()), "n_gt_test": int(g.sum())}


def fig_dominio(D: Path, R: Path):
    mA = json.loads((R / "A_pre_metrics.json").read_text()); mB = json.loads((R / "B_dom_metrics.json").read_text())
    fig, axs = plt.subplots(1, 2, figsize=(14, 4.6), gridspec_kw={"width_ratios": [1, 1.5]})
    cats = ["validação\n(4 variedades)", "teste\n(Syrah, nunca vista)"]
    v50 = [mB["val"]["mAP50"], mB["test"]["mAP50"]]; v95 = [mB["val"]["mAP5095"], mB["test"]["mAP5095"]]
    x = np.arange(2)
    axs[0].bar(x - 0.18, v50, 0.36, color=AZUL, ec=AZUL_E, label="mAP50"); axs[0].bar(x + 0.18, v95, 0.36, color=CREME, ec=MARROM, label="mAP50–95")
    for i in range(2):
        axs[0].text(i - 0.18, v50[i] + 0.02, f"{v50[i]:.2f}", ha="center"); axs[0].text(i + 0.18, v95[i] + 0.02, f"{v95[i]:.2f}", ha="center")
    axs[0].set_xticks(x, cats); axs[0].set_ylim(0, 1.05); axs[0].legend(frameon=False); axs[0].set_title("treino sem Syrah (experimento B)")
    m = carregar(R, "B_dom")
    p = sorted((D / "B" / "images" / "test").glob("*.jpg"))[5]
    im = rgb(p); h, w = im.shape[:2]; g = gt_de(D / "B" / "labels" / "test" / (p.stem + ".txt"), w, h)
    b, c = prever(m, p); tp, achou = casar(b, c, g)
    axs[1].imshow(im)
    for bb in g[~achou]:
        caixa(axs[1], bb, VERMELHO, 2.2, "--")
    for bb, cc, t in zip(b, c, tp):
        caixa(axs[1], bb, AZUL_E if t else LARANJA, 2, txt=f"{cc:.2f}")
    axs[1].set_title(f"{p.stem}: {tp.sum()} VP · {(~tp).sum()} FP · {(~achou).sum()} FN (anotados: {len(g)})", fontsize=11); limpar(axs[1])
    salvar(fig, "real_dominio_syrah")


def fig_arquivos_ultralytics(R: Path):
    """os arquivos que o Ultralytics grava na pasta do treino, como o aluno verá no Colab"""
    nomes = [("results.png", "results.png"), ("val_batch0_pred.jpg", "val_batch0_pred.jpg"), ("labels.jpg", "labels.jpg")]
    fig, axs = plt.subplots(1, 3, figsize=(17, 4.6))
    for ax, (arq, t) in zip(axs, nomes):
        q = R / "A_pre" / arq
        if not q.exists():
            q = R / "A_pre_val" / arq
        ax.imshow(rgb(q)); ax.set_title(f"runs/detect/train/{t}", fontsize=11, family="monospace")
    limpar(axs)
    salvar(fig, "real_arquivos_ultralytics")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dados", required=True, help="pasta com wgisd/ (raw, A, B) e runs/")
    a = ap.parse_args()
    base = Path(a.dados); D = base / "wgisd"; R = base / "runs"
    info = {}
    fig_aula5(D)
    info.update(fig_coco_falha(D))
    fig_predicoes(D, R)
    fig_limiares(D, R)
    info.update(fig_nms(D, R))
    info.update(fig_curvas(R))
    info.update(fig_pr_contagem(D, R))
    fig_dominio(D, R)
    fig_arquivos_ultralytics(R)
    for n in ("A_pre", "A_scratch", "B_dom"):
        info[n] = json.loads((R / f"{n}_metrics.json").read_text())
    txt = json.dumps(info, indent=1, ensure_ascii=False)
    (SAIDA / "resultados_reais.json").write_text(txt, encoding="utf-8")
    (RAIZ / "src" / "resultados.json").write_text(txt, encoding="utf-8")  # números citados no texto do site
    print(json.dumps(info, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
