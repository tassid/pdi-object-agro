"""Troca as previsões simuladas do laboratório de NMS por saídas reais do YOLO11n (experimento A),
numa imagem de TESTE, com NMS praticamente desligado (iou=0.99) e conf >= 0.05, para que o aluno aplique o NMS no navegador."""
import json, sys
from pathlib import Path
import cv2
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import figuras_reais as F

base = Path(sys.argv[1])  # mesma pasta de treinar_wgisd.py --dados; uso: python scripts/lab_nms_real.py ./trabalho
D, R = base / "wgisd", base / "runs"
m = F.carregar(R, "A_pre")
p = next(x for x in F.imagens_teste(D) if x.name.startswith("SVB"))
im = F.rgb(p); h, w = im.shape[:2]; f = 1024 / w
b, c = F.prever(m, p, conf=0.05, iou=0.99)
g = F.gt_de(D / "A" / "labels" / "test" / (p.stem + ".txt"), w, h)
Image.fromarray(cv2.resize(im, (1024, int(h * f)))).save(F.SAIDA / "lab_nms.jpg", quality=85)
lab = json.loads((F.SAIDA / "labs.json").read_text())
lab["nms"] = {"w": 1024, "h": int(h * f), "img": p.stem,
              "dets": [[round(float(v) * f, 1) for v in bb] + [round(float(cc), 3)] for bb, cc in zip(b, c)],
              "gt": [[round(float(v) * f, 1) for v in gg] for gg in g]}
(F.SAIDA / "labs.json").write_text(json.dumps(lab))
print(p.stem, len(b), "previsões", len(g), "anotados")
