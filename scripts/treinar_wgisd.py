"""
Treinos reais usados nas figuras do site (WGISD, Embrapa).

    pip install ultralytics
    python scripts/treinar_wgisd.py --dados ./trabalho             # baixa o WGISD, monta as partições e treina
    python scripts/figuras_reais.py --dados ./trabalho              # gera public/fig/real_*.jpg e src/resultados.json

Experimentos
    A_pre      YOLO11n com pesos do COCO; partição oficial (train.txt/test.txt) com 15% do treino,
               estratificado por variedade, separado para validação (205 / 37 / 58 imagens)
    A_scratch  igual ao A_pre, sem pesos pré-treinados (yolo11n.yaml)
    B_dom      treino e validação sem Syrah (222 / 30); teste: as 48 imagens de Syrah

Configuração usada no site: RTX 5060 Ti, Ultralytics 8.3.224, torch 2.11 (CUDA 12.8),
imgsz 1024, batch 8, até 80 épocas, paciência 20, semente 0, modo determinístico.
"""
from __future__ import annotations

import argparse
import collections
import json
import random
import shutil
import urllib.request
from pathlib import Path

URL = "https://raw.githubusercontent.com/thsant/wgisd/master/"


def baixar(R: Path):
    raw = R / "raw"; raw.mkdir(parents=True, exist_ok=True)
    for f in ("train.txt", "test.txt"):
        if not (R / f).exists():
            urllib.request.urlretrieve(URL + f, R / f)
    nomes = [l.strip() for f in ("train.txt", "test.txt") for l in open(R / f) if l.strip()]
    for n in nomes:
        for ext in (".jpg", ".txt"):
            if not (raw / (n + ext)).exists():
                urllib.request.urlretrieve(URL + "data/" + n + ext, raw / (n + ext))
    return nomes


def particoes(R: Path):
    raw = R / "raw"
    train = [l.strip() for l in open(R / "train.txt") if l.strip()]
    test = [l.strip() for l in open(R / "test.txt") if l.strip()]
    var = lambda n: n.split("_")[0]
    random.seed(0)
    porv = collections.defaultdict(list)
    for n in sorted(train):
        porv[var(n)].append(n)
    val = []
    for ns in porv.values():
        random.shuffle(ns); val += ns[: max(3, round(len(ns) * 0.15))]
    trA = [n for n in train if n not in val]
    todos = train + test
    trB = [n for n in todos if var(n) != "SYH"]; random.shuffle(trB)
    vaB, trB = trB[:30], trB[30:]
    teB = [n for n in todos if var(n) == "SYH"]

    def montar(nome, sp):
        d = R / nome
        for s, ns in sp.items():
            for sub in ("images", "labels"):
                (d / sub / s).mkdir(parents=True, exist_ok=True)
            for n in ns:
                shutil.copy(raw / (n + ".jpg"), d / "images" / s / (n + ".jpg"))
                shutil.copy(raw / (n + ".txt"), d / "labels" / s / (n + ".txt"))
        (d / "data.yaml").write_text(f"path: {d.resolve().as_posix()}\ntrain: images/train\nval: images/val\ntest: images/test\nnames:\n  0: cacho\n")
        print(nome, {s: len(v) for s, v in sp.items()})

    montar("A", {"train": trA, "val": val, "test": test})
    montar("B", {"train": trB, "val": vaB, "test": teB})


def treinar(base: Path, quais):
    from ultralytics import YOLO
    R = base / "runs"
    cfg = dict(epochs=80, imgsz=1024, batch=8, patience=20, seed=0, deterministic=True, workers=4, project=str(R), exist_ok=True, plots=True, verbose=False)
    jobs = {"A_pre": ("yolo11n.pt", "A"), "A_scratch": ("yolo11n.yaml", "A"), "B_dom": ("yolo11n.pt", "B")}
    for nome in quais:
        w, exp = jobs[nome]
        data = str(base / "wgisd" / exp / "data.yaml")
        YOLO(w).train(data=data, name=nome, **cfg)
        best = YOLO(str(R / nome / "weights" / "best.pt"))
        res = {}
        for split in ("val", "test"):
            r = best.val(data=data, split=split, imgsz=1024, batch=8, project=str(R), name=f"{nome}_{split}", exist_ok=True, plots=True, verbose=False)
            res[split] = dict(P=float(r.box.mp), R=float(r.box.mr), mAP50=float(r.box.map50), mAP5095=float(r.box.map))
        (R / f"{nome}_metrics.json").write_text(json.dumps(res, indent=1))
        print(nome, res, flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dados", required=True)
    ap.add_argument("--so", nargs="*", default=["A_pre", "A_scratch", "B_dom"])
    a = ap.parse_args()
    base = Path(a.dados).resolve(); R = base / "wgisd"
    baixar(R); particoes(R); treinar(base, a.so)


if __name__ == "__main__":  # necessário no Windows (workers em subprocessos)
    main()
