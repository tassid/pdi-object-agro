"""
Projeto das frutas com YOLO26: contar, identificar a fruta e dizer se está sadia ou estragada.

    pip install ultralytics huggingface_hub pyarrow
    python scripts/projeto_frutas.py --dados ./trabalho/frutas     # baixa do Hugging Face, prepara, treina e avalia

Dados (Hugging Face, sem login):
  Project-AgML/fruit_detection_worldwide       DeepFruits (SA et al., 2016): 565 fotos, 3.132 caixas, 7 frutas
  Project-AgML/fresh_rotten_fruit_classification  3.200 fotos de 8 frutas, sadias e estragadas (CC BY 4.0)
"""
from __future__ import annotations

import argparse
import glob
import io
import json
import random
import shutil
from pathlib import Path

import pyarrow.parquet as pq
from PIL import Image

DET = "Project-AgML/fruit_detection_worldwide"
CLS = "Project-AgML/fresh_rotten_fruit_classification"
FRUTAS_DET = ["abacate", "melão", "maçã", "laranja", "morango", "manga", "pimentão"]
NOMES_DET = ["avocado", "rockmelon", "apple", "orange", "strawberry", "mango", "capsicum"]


def baixar(base: Path):
    from huggingface_hub import snapshot_download
    snapshot_download(DET, repo_type="dataset", local_dir=str(base / "worldwide"))
    snapshot_download(CLS, repo_type="dataset", local_dir=str(base / "fresh_rotten"), allow_patterns=["raw/*"])


def preparar_deteccao(base: Path):
    """parquet (bbox x, y, largura, altura em pixels) -> pastas do YOLO; 80/10/10 por foto"""
    out = base / "det"
    shutil.rmtree(out, ignore_errors=True)
    linhas = []
    for f in sorted(glob.glob(str(base / "worldwide" / "data" / "*.parquet"))):
        linhas += pq.read_table(f).to_pylist()
    random.seed(0)
    idx = list(range(len(linhas))); random.shuffle(idx)
    n = len(idx); corte = {"train": idx[: int(0.8 * n)], "val": idx[int(0.8 * n): int(0.9 * n)], "test": idx[int(0.9 * n):]}
    for split, ids in corte.items():
        (out / "images" / split).mkdir(parents=True); (out / "labels" / split).mkdir(parents=True)
        for i in ids:
            r = linhas[i]
            im = Image.open(io.BytesIO(r["image"]["bytes"])).convert("RGB"); W, H = im.size
            im.save(out / "images" / split / f"f{i:04d}.jpg", quality=92)
            txt = []
            for (x, y, w, h), c in zip(r["objects"]["bbox"], r["objects"]["categories"]):
                if w > 1 and h > 1:
                    txt.append(f"{c} {(x + w / 2) / W:.6f} {(y + h / 2) / H:.6f} {w / W:.6f} {h / H:.6f}")
            (out / "labels" / split / f"f{i:04d}.txt").write_text("\n".join(txt) + "\n")
    nomes = "\n".join(f"  {k}: {v}" for k, v in enumerate(FRUTAS_DET))
    (out / "data.yaml").write_text(f"path: {out.resolve().as_posix()}\ntrain: images/train\nval: images/val\ntest: images/test\nnames:\n{nomes}\n", encoding="utf-8")
    print("detecção:", {k: len(v) for k, v in corte.items()})
    return out / "data.yaml"


def preparar_classificacao(base: Path):
    """sadia × estragada, estratificado por fruta e condição: 80/10/10"""
    out = base / "cls"
    shutil.rmtree(out, ignore_errors=True)
    grupos = {}
    for f in sorted(glob.glob(str(base / "fresh_rotten" / "raw" / "*.parquet"))):
        for r in pq.read_table(f).to_pylist():
            grupos.setdefault((r["fruit_type"], r["label"]), []).append(r)
    random.seed(0)
    cont = {}
    for (fruta, lab), rs in grupos.items():
        random.shuffle(rs)
        n = len(rs)
        partes = {"train": rs[: int(0.8 * n)], "val": rs[int(0.8 * n): int(0.9 * n)], "test": rs[int(0.9 * n):]}
        classe = "sadia" if lab == 0 else "estragada"
        for split, lst in partes.items():
            d = out / split / classe; d.mkdir(parents=True, exist_ok=True)
            for k, r in enumerate(lst):
                im = Image.open(io.BytesIO(r["image"]["bytes"])).convert("RGB"); im.thumbnail((512, 512))
                im.save(d / f"{fruta}_{lab}_{k:03d}.jpg", quality=90)
                cont[(split, classe)] = cont.get((split, classe), 0) + 1
    print("classificação:", cont)
    return out


def treinar(base: Path, data_det, pasta_cls, R: Path):
    from ultralytics import YOLO
    res = {}
    det = YOLO("yolo26n.pt")
    det.train(data=str(data_det), epochs=80, imgsz=640, batch=16, patience=20, seed=0, workers=4,
              project=str(R), name="frutas_det", exist_ok=True, verbose=False)
    best = YOLO(str(R / "frutas_det" / "weights" / "best.pt"))
    r = best.val(data=str(data_det), split="test", project=str(R), name="frutas_det_test", exist_ok=True, verbose=False)
    res["det"] = {"P": float(r.box.mp), "R": float(r.box.mr), "mAP50": float(r.box.map50), "mAP5095": float(r.box.map),
                  "por_classe_mAP50": {FRUTAS_DET[int(c)]: float(v) for c, v in zip(r.box.ap_class_index, r.box.ap50)}}
    cls = YOLO("yolo26n-cls.pt")
    cls.train(data=str(pasta_cls), epochs=30, imgsz=224, batch=64, patience=10, seed=0, workers=4,
              project=str(R), name="frutas_cls", exist_ok=True, verbose=False)
    bestc = YOLO(str(R / "frutas_cls" / "weights" / "best.pt"))
    rc = bestc.val(data=str(pasta_cls), split="test", project=str(R), name="frutas_cls_test", exist_ok=True, verbose=False)
    res["cls"] = {"top1": float(rc.top1)}
    (R / "frutas_metrics.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(res, indent=1, ensure_ascii=False))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dados", required=True); ap.add_argument("--sem_treino", action="store_true")
    base = Path(ap.parse_args().dados).resolve()
    a = ap.parse_args()
    baixar(base)
    d = preparar_deteccao(base); c = preparar_classificacao(base)
    if not a.sem_treino:
        treinar(base, d, c, base / "runs")


if __name__ == "__main__":
    main()
