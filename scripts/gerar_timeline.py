"""Linhas do tempo da aula: public/fig/timeline_classica.jpg e public/fig/timeline_yolo.jpg

    python scripts/gerar_timeline.py
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

RAIZ = Path(__file__).resolve().parent.parent
FIG = RAIZ / "public" / "fig"
for f in (RAIZ / "scripts" / "fontes").glob("*.ttf"):
    font_manager.fontManager.addfont(str(f))
plt.rcParams.update({"font.family": "serif", "font.serif": ["CMU Serif", "DejaVu Serif"], "font.size": 12})
MARROM, LARANJA, AZUL_E = "#775f55", "#dd8047", "#4f7fa6"


def linha(eventos, nome, x0, x1, passo, titulo, largura=19, altura=7.2):
    """eventos: (ano, rótulo, quem, y). y > 0: técnicas (azul, acima); y < 0: dados e ferramentas (laranja, abaixo)."""
    fig, ax = plt.subplots(figsize=(largura, altura))
    ax.set_xlim(x0, x1); ax.set_ylim(-3.3, 3.8); ax.axis("off")
    ax.plot([x0, x1], [0, 0], color=MARROM, lw=3, solid_capstyle="round")
    a = x0 + (passo - x0 % passo) % passo
    while a <= x1:
        ax.plot([a, a], [-0.1, 0.1], color=MARROM, lw=1.5)
        ax.text(a, -0.22, f"{a:.0f}", ha="center", va="top", fontsize=11, color=MARROM)
        a += passo
    for ev in eventos:
        ano, rot, quem, y = ev[:4]
        dx = ev[4] if len(ev) > 4 else 0
        cor = AZUL_E if y > 0 else LARANJA
        ax.plot([ano, ano + dx], [0, y], color=cor, lw=1.3, zorder=1)
        ax.plot(ano, 0, "o", color=cor, ms=9, zorder=5)
        ax.text(ano + dx, y, f"{rot}\n{quem}", ha="center", va="center", fontsize=11, color="#222", zorder=6, linespacing=1.35,
                bbox=dict(boxstyle="round,pad=0.35", fc="#f7f1e6" if y > 0 else "#fbeadf", ec=cor, lw=1.3))
    ax.text(x0, 3.75, titulo, fontsize=16, weight="bold", color=MARROM, va="bottom")
    ax.text(x1, -3.25, "acima: técnicas · abaixo: dados e ferramentas", fontsize=11, color="#666", ha="right", va="bottom", style="italic")
    fig.savefig(FIG / f"{nome}.jpg", dpi=120, bbox_inches="tight", facecolor="white", pil_kwargs={"quality": 88})
    plt.close(fig)
    print("ok", nome)


CLASSICA = [
    (1958, "Perceptron", "Rosenblatt", 1.3),
    (1962, "Transformada de Hough", "P. Hough", 2.6),
    (1979, "Limiar de Otsu", "N. Otsu", 1.3),
    (1998, "LeNet-5 (CNN)", "LeCun et al., Bell Labs", 2.6, -3),
    (2001, "Viola–Jones", "Viola e Jones", 1.3, -3),
    (2004, "SIFT", "D. Lowe", 3.3, -1),
    (2005, "HOG", "Dalal e Triggs", 2.1, 0.5),
    (2012, "AlexNet", "Krizhevsky et al.", 1.1, 1.5),
    (2014, "R-CNN", "Girshick et al.", 2.3, 0.5),
    (2015, "Faster R-CNN · U-Net", "Ren et al. · Ronneberger et al.", 3.3, -1.5),
    (2005, "PASCAL VOC", "competição de detecção", -1.3, -3.5),
    (2008, "LabelMe", "MIT", -2.5, -1.5),
    (2009, "ImageNet", "Fei-Fei Li et al.", -1.3, 1.5),
    (2014, "COCO", "Lin et al., Microsoft", -2.5, 2),
]
YOLO = [
    (2016, "YOLO v1", "Redmon et al.", 1.2),
    (2017, "YOLO v2", "Redmon e Farhadi", 2.4),
    (2018, "YOLO v3", "Redmon e Farhadi", 1.2),
    (2020.25, "YOLO v4", "Bochkovskiy et al.", 2.4, -0.3),
    (2020.5, "YOLO v5", "Ultralytics", 1.2, 0.2),
    (2022.4, "YOLO v6 · v7", "Meituan · Wang et al.", 2.4),
    (2023.05, "YOLO v8", "Ultralytics", 1.2),
    (2024.15, "YOLO v9 · v10", "Wang et al. · Tsinghua", 3.2, -0.4),
    (2024.75, "YOLO11", "Ultralytics", 2.1),
    (2025.15, "YOLO v12", "Tian et al.", 1.0, 0.1),
    (2026.05, "YOLO26", "Ultralytics", 2.8, 0.2),
    (2015.6, "LabelImg", "Tzutalin", -1.3),
    (2018.5, "CVAT no GitHub", "Intel (N. Manovich)", -1.3),
    (2020.4, "DETR", "Carion et al., Facebook", -2.5),
    (2022.5, "CVAT.ai", "empresa independente", -1.3),
    (2023.3, "SAM", "Meta", -2.5),
]

if __name__ == "__main__":
    linha(CLASSICA, "timeline_classica", 1955, 2017.5, 5, "Do perceptron às redes profundas")
    linha(YOLO, "timeline_yolo", 2015, 2026.8, 1, "A família YOLO e as ferramentas de anotação")
