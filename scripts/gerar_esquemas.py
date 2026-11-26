"""Esquemas ilustrativos dos slides práticos (Colab, pasta do YOLO, fluxo do projeto).

    python scripts/gerar_esquemas.py      # grava public/fig/esq_*.jpg

Usa fotos e anotações reais do WGISD já presentes em public/fig e public/cvat.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.patches as patches
import matplotlib.pyplot as plt
from matplotlib import font_manager
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
FIG = RAIZ / "public" / "fig"
for f in (RAIZ / "scripts" / "fontes").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
plt.rcParams.update({"font.family": "serif", "font.serif": ["CMU Serif", "DejaVu Serif"], "font.size": 13})

MARROM, LARANJA, AZUL, AZUL_E, CREME = "#775f55", "#dd8047", "#94b6d2", "#4f7fa6", "#ebddc3"


def caixa(ax, x, y, w, h, titulo, sub="", cor=CREME, borda=MARROM):
    ax.add_patch(patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03", fc=cor, ec=borda, lw=2))
    ax.text(x + w / 2, y + h * 0.62, titulo, ha="center", va="center", fontsize=15, weight="bold", color="#222")
    if sub:
        ax.text(x + w / 2, y + h * 0.28, sub, ha="center", va="center", fontsize=11.5, color="#444")


def seta(ax, x0, y0, x1, y1):
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0), arrowprops=dict(arrowstyle="-|>", lw=2.2, color=LARANJA))


def salvar(fig, nome):
    fig.savefig(FIG / f"{nome}.jpg", dpi=120, bbox_inches="tight", facecolor="white", pil_kwargs={"quality": 86})
    plt.close(fig)
    print("ok", nome)


def colab():
    fig, ax = plt.subplots(figsize=(13, 4.2)); ax.set_xlim(0, 13); ax.set_ylim(0, 4.2); ax.axis("off")
    caixa(ax, 0.2, 1.3, 3.4, 1.6, "Notebook no Colab", "células de código, de cima para baixo")
    caixa(ax, 4.8, 2.4, 3.4, 1.5, "GPU (T4)", "Ambiente de execução → GPU", cor="#dfe9f2", borda=AZUL_E)
    caixa(ax, 4.8, 0.3, 3.4, 1.5, "Pacote Ultralytics", "pip install ultralytics", cor="#dfe9f2", borda=AZUL_E)
    caixa(ax, 9.4, 1.3, 3.4, 1.6, "Google Drive", "pdi_yolo/runs: pesos e resultados", cor="#f6e1d2", borda=LARANJA)
    seta(ax, 3.6, 2.3, 4.8, 3.1); seta(ax, 3.6, 1.9, 4.8, 1.0); seta(ax, 8.2, 3.1, 9.4, 2.3); seta(ax, 8.2, 1.0, 9.4, 1.9)
    ax.text(6.5, 0.02, "O Colab apaga tudo ao fechar a sessão: o que importa vai para o Drive.", ha="center", fontsize=12, style="italic", color=MARROM)
    salvar(fig, "esq_colab")


def pasta_yolo():
    fig = plt.figure(figsize=(14, 5.4))
    ax = fig.add_axes([0, 0, 0.36, 1]); ax.axis("off")
    linhas = ["dataset/", "  data.yaml", "  images/", "    train/   foto_001.jpg  …", "    val/", "    test/", "  labels/", "    train/   foto_001.txt  …", "    val/", "    test/"]
    for i, l in enumerate(linhas):
        cor = LARANJA if "data.yaml" in l else (AZUL_E if l.strip().startswith(("images", "labels")) else "#222")
        ax.text(0.04, 0.92 - i * 0.085, l, family="monospace", fontsize=14, color=cor, transform=ax.transAxes)
    ax.text(0.04, 0.03, "uma imagem e um .txt com o mesmo nome", fontsize=12, style="italic", color=MARROM, transform=ax.transAxes)
    ax2 = fig.add_axes([0.38, 0.06, 0.38, 0.88]); ax2.axis("off")
    im = Image.open(FIG / "formatos_caixa.jpg")
    ax2.imshow(im); ax2.set_title("a foto e suas caixas", fontsize=13)
    ax3 = fig.add_axes([0.78, 0.06, 0.21, 0.88]); ax3.axis("off")
    ax3.add_patch(patches.Rectangle((0, 0.15), 1, 0.75, fc="#faf7f1", ec="#999", transform=ax3.transAxes))
    ax3.text(0.04, 0.80, "0 0.3283 0.3672 0.1887 0.2002", family="monospace", fontsize=10.5, transform=ax3.transAxes)
    ax3.text(0.04, 0.68, "(uma linha por objeto)", fontsize=11, style="italic", color="#666", transform=ax3.transAxes)
    ax3.text(0.04, 0.05, "classe · centro x · centro y\nlargura · altura (0 a 1)", fontsize=10.5, color=MARROM, transform=ax3.transAxes)
    ax3.set_title("foto_001.txt", fontsize=13, family="monospace")
    salvar(fig, "esq_pasta_yolo")


def fluxo():
    etapas = [("1. Pergunta", "o que contar, localizar\nou medir?", "lab_nms.jpg"),
              ("2. Anotar no CVAT", "com protocolo", "../cvat/image013_detrac.jpg"),
              ("3. Treinar no Colab", "YOLO a partir de\npesos prontos", "real_curvas_treino.jpg"),
              ("4. Ler e escolher", "métricas e limiar\nna validação", "real_pr_f1.jpg"),
              ("5. Usar e testar", "contar em fotos novas\nde outro lugar", "real_predicoes_teste.jpg")]
    fig = plt.figure(figsize=(19, 4.6))
    w, gap = 0.16, 0.045
    for k, (t, s, img) in enumerate(etapas):
        x = 0.01 + k * (w + gap)
        ax = fig.add_axes([x, 0.2, w, 0.62])
        im = Image.open(FIG / img).convert("RGB")
        W, H = im.size; alvo = 4 / 3   # moldura branca até 4:3, sem cortar a figura
        if W / H > alvo:
            fundo = Image.new("RGB", (W, int(W / alvo)), "white"); fundo.paste(im, (0, (int(W / alvo) - H) // 2))
        else:
            fundo = Image.new("RGB", (int(H * alvo), H), "white"); fundo.paste(im, ((int(H * alvo) - W) // 2, 0))
        im = fundo
        ax.imshow(im); ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values():
            sp.set_edgecolor(MARROM); sp.set_linewidth(2)
        ax.set_title(t, fontsize=16, weight="bold", color=MARROM)
        fig.text(x + w / 2, 0.1, s, ha="center", va="center", fontsize=13)
        if k < 4:
            fig.text(x + w + gap / 2, 0.51, "→", fontsize=34, color=LARANJA, ha="center", va="center", family="DejaVu Sans")
    salvar(fig, "esq_fluxo")


if __name__ == "__main__":
    colab(); pasta_yolo(); fluxo()
