"""
Classificação e segmentação reais no WGISD, para comparar as três tarefas no mesmo conjunto.

    python scripts/treinar_tarefas.py --dados ./trabalho      # depois de treinar_wgisd.py (usa wgisd/raw e a partição A)

C_cls  YOLO11n-cls: cada cacho anotado é recortado pela sua caixa e rotulado com a variedade (5 classes).
       Os recortes herdam a partição da foto de origem (treino/validação/teste do experimento A),
       para que cachos da mesma foto nunca fiquem em conjuntos diferentes.
D_seg  YOLO11n-seg: as 137 fotos com máscaras de instância (train_masked.txt / test_masked.txt),
       máscaras convertidas em polígonos no formato YOLO-seg.
"""
from __future__ import annotations

import argparse
import json
import random
import shutil
import urllib.request
from pathlib import Path

import cv2
import numpy as np

URL = "https://raw.githubusercontent.com/thsant/wgisd/master/"
VAR = {"CDY": "chardonnay", "CFR": "cabernet_franc", "CSV": "cabernet_sauvignon", "SVB": "sauvignon_blanc", "SYH": "syrah"}


def caixas(txt: Path, w, h):
    out = []
    for l in txt.read_text().splitlines():
        if l.strip():
            _, xc, yc, bw, bh = map(float, l.split())
            out.append([(xc - bw / 2) * w, (yc - bh / 2) * h, (xc + bw / 2) * w, (yc + bh / 2) * h])
    return np.array(out)


def montar_cls(W: Path):
    A = W / "A"; C = W / "C_cls"
    shutil.rmtree(C, ignore_errors=True)
    n = {}
    for split in ("train", "val", "test"):
        for img_p in sorted((A / "images" / split).glob("*.jpg")):
            im = cv2.imread(str(img_p)); h, w = im.shape[:2]
            classe = VAR[img_p.stem[:3]]
            d = C / split / classe; d.mkdir(parents=True, exist_ok=True)
            for k, b in enumerate(caixas(A / "labels" / split / (img_p.stem + ".txt"), w, h).astype(int)):
                x1, y1, x2, y2 = max(0, b[0]), max(0, b[1]), min(w, b[2]), min(h, b[3])
                if x2 - x1 < 16 or y2 - y1 < 16:
                    continue
                cv2.imwrite(str(d / f"{img_p.stem}_{k:02d}.jpg"), im[y1:y2, x1:x2], [cv2.IMWRITE_JPEG_QUALITY, 92])
                n[split] = n.get(split, 0) + 1
    print("C_cls recortes:", n)
    return C


def montar_seg(W: Path):
    raw = W / "raw"; S = W / "D_seg"
    shutil.rmtree(S, ignore_errors=True)
    listas = {}
    for f in ("train_masked.txt", "test_masked.txt"):
        if not (W / f).exists():
            urllib.request.urlretrieve(URL + f, W / f)
        listas[f] = [l.strip() for l in open(W / f) if l.strip()]
    random.seed(0)
    tr = sorted(listas["train_masked.txt"]); random.shuffle(tr)
    sp = {"val": tr[:16], "train": tr[16:], "test": listas["test_masked.txt"]}
    for s, nomes in sp.items():
        for sub in ("images", "labels"):
            (S / sub / s).mkdir(parents=True, exist_ok=True)
        for n in nomes:
            npz = raw / (n + ".npz")
            if not npz.exists():
                urllib.request.urlretrieve(URL + "data/" + n + ".npz", npz)
            m = np.load(npz)["arr_0"]  # H x W x instâncias
            h, w = m.shape[:2]
            linhas = []
            for i in range(m.shape[2]):
                cs, _ = cv2.findContours(m[:, :, i].astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if not cs:
                    continue
                c = max(cs, key=cv2.contourArea)
                c = cv2.approxPolyDP(c, 1.5, True).reshape(-1, 2)
                if len(c) < 3:
                    continue
                linhas.append("0 " + " ".join(f"{x / w:.5f} {y / h:.5f}" for x, y in c))
            shutil.copy(raw / (n + ".jpg"), S / "images" / s / (n + ".jpg"))
            (S / "labels" / s / (n + ".txt")).write_text("\n".join(linhas) + "\n")
    (S / "data.yaml").write_text(f"path: {S.resolve().as_posix()}\ntrain: images/train\nval: images/val\ntest: images/test\nnames:\n  0: cacho\n")
    print("D_seg:", {k: len(v) for k, v in sp.items()})
    return S


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dados", required=True)
    base = Path(ap.parse_args().dados).resolve(); W = base / "wgisd"; R = base / "runs"  # absoluto: caminho relativo vai para a pasta global do Ultralytics
    from ultralytics import YOLO
    C = montar_cls(W); S = montar_seg(W)
    out = {}
    m = YOLO("yolo11n-cls.pt")
    m.train(data=str(C), epochs=40, imgsz=224, batch=64, patience=15, seed=0, deterministic=True, workers=4, project=str(R), name="C_cls", exist_ok=True, verbose=False)
    best = YOLO(str(R / "C_cls" / "weights" / "best.pt"))
    for split in ("val", "test"):
        r = best.val(data=str(C), split=split, imgsz=224, project=str(R), name=f"C_cls_{split}", exist_ok=True, verbose=False)
        out.setdefault("cls", {})[split] = {"top1": float(r.top1), "top5": float(r.top5)}
    m = YOLO("yolo11n-seg.pt")
    m.train(data=str(S / "data.yaml"), epochs=80, imgsz=1024, batch=8, patience=20, seed=0, deterministic=True, workers=4, project=str(R), name="D_seg", exist_ok=True, verbose=False)
    best = YOLO(str(R / "D_seg" / "weights" / "best.pt"))
    for split in ("val", "test"):
        r = best.val(data=str(S / "data.yaml"), split=split, imgsz=1024, batch=8, project=str(R), name=f"D_seg_{split}", exist_ok=True, verbose=False)
        out.setdefault("seg", {})[split] = {"box_mAP50": float(r.box.map50), "mask_mAP50": float(r.seg.map50), "mask_mAP5095": float(r.seg.map)}
    (R / "tarefas_metrics.json").write_text(json.dumps(out, indent=1))
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
