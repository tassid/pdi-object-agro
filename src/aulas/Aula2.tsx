
import { Fig, Trabalho } from '../curso'
import { Callout, Code } from '../ui'
import { T } from '../trabalhos'
import { PROF2, comProf } from './prof'
import R from '../resultados.json'

const d2 = (v: number) => v.toFixed(2).replace('.', ',')
const pct = (v: number) => `${(100 * v).toFixed(0)}%`
const NB = 'CVAT_YOLO_na_pratica.ipynb'

export const aula2 = comProf(PROF2, {
  id: 'aula2',
  n: 2,
  titulo: 'YOLO na prática: do Colab ao campo',
  ideia:
    'Uma aula inteira de mão na massa. Cada dupla monta o próprio Colab do zero, treina um YOLO com os dados anotados no encontro 1, aprende a ler os arquivos que o treino gera, usa o modelo para contar objetos em fotos e vídeos, testa o modelo num lugar que ele nunca viu e compara o que fez com trabalhos reais da UTFPR que seguiram o mesmo caminho.',
  chips: ['Google Colab', 'GPU', 'Ultralytics YOLO', 'data.yaml', 'treino', 'results.png', 'mAP', 'limiar de confiança', 'contagem', 'rastreamento', 'exportação', 'mudança de domínio', 'análise de erros', 'trabalhos da UTFPR'],
  objetivos: [
    'Montar um notebook do Colab do zero: GPU, Google Drive, instalação do Ultralytics e organização das pastas e do data.yaml.',
    'Treinar um YOLO a partir de pesos pré-treinados e escolher épocas, tamanho de imagem, lote e paciência de forma justificada.',
    'Ler os arquivos gerados pelo treino (results.png, previsões de validação, curva F1) e interpretar precisão, revocação e mAP sem depender de fórmulas.',
    'Usar o modelo treinado para contar objetos, gerar uma planilha, contar sem repetição em vídeo e exportar o modelo.',
    'Testar o modelo em dados de outro lugar e classificar os erros por causa provável.',
    'Reconhecer, em trabalhos reais da UTFPR, as mesmas etapas e decisões executadas em aula.',
  ],
  intervaloDepois: 'b22',
  notebook: {
    nome: NB,
    arquivo: NB,
    descricao: 'Notebook montado bloco a bloco: ambiente, dados (WGISD ou export do CVAT), treino, leitura dos resultados, contagem com planilha, vídeo com rastreamento, exportação, teste em outra variedade e registro do experimento.',
  },
  blocos: [
    /* ============================================================ 2.1 */
    {
      id: 'b21',
      cod: '2.1',
      titulo: 'Montar o Colab do zero',
      min: 30,
      tipo: 'lab',
      slides: [
        { titulo: 'O que vamos construir hoje', img: 'esq_fluxo', pontos: ['Um notebook que vai da foto anotada até a contagem', 'Uma seção por bloco da aula', 'Funciona com o WGISD ou com o export do CVAT da dupla'], notas: 'Abrir um notebook em branco no Colab e construir junto com a turma; o notebook pronto fica como gabarito.' },
        { titulo: 'Passo 1: ligar a GPU', img: 'esq_colab', pontos: ['Ambiente de execução → Alterar o tipo → GPU (T4)', 'Conferir com nvidia-smi', 'Sem GPU o treino leva horas'] },
        { titulo: 'Passo 2: guardar no Drive', img: 'esq_colab', pontos: ['O Colab apaga tudo ao fechar a sessão', 'Montar o Drive e salvar runs/ lá', 'Pesos e resultados sobrevivem à queda'] },
        { titulo: 'Passo 3: a pasta que o YOLO espera', img: 'esq_pasta_yolo', pontos: [['dataset/', ['images/train, images/val, images/test', 'labels/… com um .txt por imagem', 'data.yaml com caminhos e nomes das classes']]], notas: 'Mostrar a estrutura no painel de arquivos do Colab depois de executar a célula de dados.' },
        { titulo: 'Passo 4: conferir antes de treinar', img: 'cvat/export_job_as_dataset_dialog', legenda: 'Exportação no CVAT: escolher Ultralytics YOLO e ligar Save images', pontos: ['Mesma quantidade de imagens e rótulos', 'Desenhar as caixas de uma foto', 'Nome da classe igual ao do CVAT'] },
      ],
      teoria: (
        <>
          <p>
            O Google Colab é um computador remoto com Python e, se pedido, uma GPU. Ele não guarda nada entre sessões: tudo o que não for salvo no Google Drive desaparece quando a aba
            fecha ou a sessão expira. Por isso, a primeira decisão de um notebook de treino é <b>onde ficam os resultados</b>.
          </p>
          <p>O Ultralytics espera os dados numa estrutura fixa, a mesma que o CVAT gera ao exportar no formato <i>Ultralytics YOLO</i>:</p>
          <Code title="estrutura esperada" code={`dataset/
  data.yaml
  images/train/*.jpg     labels/train/*.txt
  images/val/*.jpg       labels/val/*.txt
  images/test/*.jpg      labels/test/*.txt   # um .txt por imagem, vazio se não há objetos`} />
          <Code title="data.yaml" code={`path: /content/dataset
train: images/train
val: images/val
test: images/test
names:
  0: cacho`} />
          <p>Os erros mais comuns nesta etapa não interrompem o código; aparecem depois como um modelo ruim. Por isso o notebook tem uma célula de conferência que precisa passar antes do treino.</p>
        </>
      ),
      exemplo: (
        <>
          <Code title="Parte 1 do notebook · preparar o Colab" code={`!nvidia-smi --query-gpu=name,memory.total --format=csv
!pip -q install ultralytics
import sys, torch, ultralytics
print("torch", torch.__version__, "| ultralytics", ultralytics.__version__)
print("GPU disponível:", torch.cuda.is_available())

from google.colab import drive
drive.mount("/content/drive")
BASE = "/content/drive/MyDrive/pdi_yolo"`} />
          <Code title="Parte 2 do notebook · usar o export do CVAT da dupla" code={`import shutil, glob
shutil.unpack_archive("/content/drive/MyDrive/pdi_yolo/meu_export_cvat.zip", "/content/dataset")
DATA = glob.glob("/content/dataset/**/data.yaml", recursive=True)[0]
print(open(DATA).read())`} />
          <Fig n="cvat/export_job_as_dataset_dialog" w={520} cap="Diálogo de exportação do CVAT. Em Export format, trocar o padrão (CVAT for images) por Ultralytics YOLO Detection e ligar Save images. Fonte: documentação do CVAT." />
          <Callout kind="pegadinha"><p>O nome da classe no <code>data.yaml</code> precisa ser igual ao do projeto no CVAT, inclusive maiúsculas. “Cacho” e “cacho” são classes diferentes.</p></Callout>
        </>
      ),
      pratica: (
        <ol>
          <li>Criar um notebook novo, ligar a GPU e executar a célula de ambiente.</li>
          <li>Montar o Drive e criar a pasta <code>pdi_yolo</code>.</li>
          <li>Carregar os dados (WGISD ou o export da dupla) e rodar a célula de conferência. Só avançar quando imagens e rótulos baterem e as caixas desenhadas estiverem sobre os cachos.</li>
        </ol>
      ),
      exercicios: [
        { nivel: 'básico', q: 'A célula de conferência mostra 180 imagens e 176 rótulos no treino. O que pode ter acontecido?', r: <p>Quatro imagens ficaram sem arquivo de rótulo, por exemplo imagens sem objetos exportadas sem o .txt vazio, ou nomes diferentes entre imagem e rótulo. É preciso corrigir antes do treino: imagens sem rótulo são tratadas como fundo.</p> },
        { nivel: 'básico', q: 'O treino terminou, a sessão caiu e a pasta runs sumiu. Como evitar?', r: <p>Salvar o projeto do treino numa pasta do Google Drive montado, por exemplo <code>project=BASE + "/runs"</code>.</p> },
      ],
    },
    /* ============================================================ 2.2 */
    {
      id: 'b22',
      cod: '2.2',
      titulo: 'Treinar um YOLO',
      min: 45,
      tipo: 'lab',
      slides: [
        { titulo: 'Uma linha para treinar', img: 'real_curvas_treino', legenda: 'Treino real: perdas e mAP por época', formula: <code>YOLO("yolo11n.pt").train(data=DATA, epochs=40, imgsz=640, batch=16, patience=15)</code>, pontos: ['yolo11n.pt: pesos já treinados (COCO)', 'O modelo só ajusta o que já sabe para os cachos'] },
        { titulo: 'Por que começar de pesos prontos', img: 'real_curvas_treino', pontos: [`Com pesos prontos: mAP50 ${d2(R.A_pre.test.mAP50)} no teste`, `Do zero: ${d2(R.A_scratch.test.mAP50)}`, 'Mesmos dados, mesmo tempo de treino'], notas: 'Resultado real dos dois treinos feitos para este material (WGISD, 80 épocas).' },
        { titulo: 'Os quatro parâmetros que importam', img: 'letterbox', legenda: 'imgsz: a foto reduzida para a entrada', pontos: ['epochs: quantas vezes o modelo vê os dados', 'imgsz: tamanho da imagem; maior ajuda objetos pequenos', 'batch: imagens por passo; reduza se faltar memória', 'patience: para quando a validação não melhora'] },
        { titulo: 'Parada antecipada num treino real', img: 'real_parada_antecipada', pontos: [`Melhor resultado na época ${R.best_epoch}`, `Parou sozinho na época ${R.epochs_B}`, 'best.pt guarda a melhor época'] },
        { titulo: 'Objetos pequenos: caso UTFPR', img: 'artigos/41804_p41', legenda: 'Costa (2024), UTFPR Cornélio Procópio, p. 41', pontos: ['Esporos ocupam poucos pixels', 'Aumentar imgsz ou fatiar a imagem', 'Custa mais memória e tempo'] },
        { titulo: 'O que o treino faz com as imagens', img: 'augmentation_real', pontos: ['Espelha, recorta, muda cor e junta quatro fotos (mosaico)', 'Só no treino, nunca na validação', 'Vem ligado por padrão'] },
      ],
      teoria: (
        <>
          <p>
            Treinar um YOLO no Ultralytics é uma linha de código. O que exige decisão são os poucos parâmetros que mudam o resultado. A regra prática é começar dos valores da tabela
            abaixo e mudar um de cada vez, sempre comparando na validação.
          </p>
          <table className="tbl">
            <caption>Tabela 1. Parâmetros do treino e valores iniciais recomendados.</caption>
            <thead><tr><th>parâmetro</th><th>o que faz</th><th>começar com</th><th>quando mudar</th></tr></thead>
            <tbody>
              <tr><td><code>model</code></td><td>tamanho do modelo e pesos iniciais</td><td>yolo11n.pt</td><td>s ou m se houver GPU e tempo; n para celular ou Raspberry Pi</td></tr>
              <tr><td><code>epochs</code></td><td>passagens completas pelos dados</td><td>40 a 100</td><td>se a validação ainda melhora no fim</td></tr>
              <tr><td><code>imgsz</code></td><td>lado da imagem na entrada</td><td>640</td><td>960 ou 1280 para objetos pequenos</td></tr>
              <tr><td><code>batch</code></td><td>imagens por passo</td><td>16</td><td>reduzir se aparecer erro de memória</td></tr>
              <tr><td><code>patience</code></td><td>épocas sem melhora antes de parar</td><td>15 a 20</td><td>aumentar se o treino parar cedo demais</td></tr>
            </tbody>
          </table>
          <p>
            <b>Pesos pré-treinados.</b> O arquivo <code>yolo11n.pt</code> já aprendeu a reconhecer bordas, texturas e formas em milhares de fotos do COCO. Partindo dele, o treino
            só adapta esse conhecimento aos cachos. Nos treinos feitos para este material, com os mesmos dados e o mesmo número de épocas, o modelo pré-treinado chegou a mAP50 de{' '}
            {d2(R.A_pre.test.mAP50)} no teste e o modelo treinado do zero ficou em {d2(R.A_scratch.test.mAP50)}.
          </p>
          <p>
            <b>Aumento de dados.</b> Durante o treino, o Ultralytics espelha, recorta, muda o brilho e combina fotos em mosaico, para que o modelo não decore as imagens. Isso vem ligado
            por padrão e é aplicado só ao treino.
          </p>
          <p>
            <b>Parada antecipada.</b> A cada época o modelo é avaliado na validação. Se ficar <code>patience</code> épocas sem melhorar, o treino para e o arquivo <code>best.pt</code>{' '}
            guarda a melhor época. No experimento real deste material sem a Syrah, o melhor resultado veio na época {R.best_epoch} e o treino parou sozinho na {R.epochs_B}.
          </p>
        </>
      ),
      exemplo: (
        <>
          <Fig n="real_curvas_treino" cap={`Treinos reais no WGISD: perdas de treino e validação e mAP50 na validação com pesos pré-treinados (azul) e do zero (tracejado). No teste: ${d2(R.A_pre.test.mAP50)} contra ${d2(R.A_scratch.test.mAP50)}.`} />
          <Fig n="real_parada_antecipada" cap={`Parada antecipada real: melhor época ${R.best_epoch}; sem melhora por 20 épocas, o treino parou na ${R.epochs_B}.`} />
          <Fig n="augmentation_real" cap="Transformações aplicadas pelo aumento de dados a fotos do WGISD; as caixas acompanham cada transformação." />
          <Fig n="letterbox" cap="Antes de entrar na rede, a foto é reduzida ao tamanho de entrada. O Ultralytics preserva a proporção e completa o resto com barras, para que os objetos não fiquem achatados; as caixas acompanham a mesma transformação." />
          <Fig n="descida_gradiente" w={680} cap="Como o modelo aprende: a cada passo ele caminha um pouco na direção que diminui o erro. Passo pequeno demais demora; passo grande demais faz o treino oscilar sem chegar ao fundo." />
          <Fig n="lr_schedule" w={680} cap="O tamanho do passo não é fixo: começa pequeno (aquecimento), cresce e depois diminui até o fim do treino. É o padrão do Ultralytics, e não precisa ser mexido no começo." />
          <Fig n="curvas_treino" cap="Os três cenários que as curvas revelam: perdas altas nas duas linhas (o modelo não aprendeu), perdas separando-se (começou a decorar) e o ponto em que a validação para de melhorar, que é onde o best.pt é guardado." />
          <Fig n="sahi_fatias" cap="Para objetos pequenos, uma alternativa a aumentar imgsz é dividir a foto em fatias sobrepostas (SAHI)." />
          <p>Objetos minúsculos levam essa escolha ao limite. Os dois trabalhos abaixo, da UTFPR Cornélio Procópio, detectam esporos de fungos em lâminas de microscópio com YOLO:</p>
          <Trabalho t={T.ferrugem} />
          <Trabalho t={T.esporos} />
        </>
      ),
      pratica: (
        <>
          <p><b>Disparar o treino antes do intervalo.</b> Com uma T4, 40 épocas em 640 pixels levam cerca de 15 minutos.</p>
          <Code title="Parte 5 do notebook · treinar" code={`from ultralytics import YOLO
modelo = YOLO("yolo11n.pt")
modelo.train(data=DATA, epochs=40, imgsz=640, batch=16, patience=15, seed=0,
             project=f"{BASE}/runs", name="uva", exist_ok=True)
PASTA = f"{BASE}/runs/uva"

# se a sessão cair:
# YOLO(f"{PASTA}/weights/last.pt").train(resume=True)`} />
        </>
      ),
      exercicios: [
        { nivel: 'básico', q: 'Apareceu “CUDA out of memory” no início do treino. O que mudar primeiro?', r: <p>Reduzir o <code>batch</code> (16 → 8 → 4). Se ainda faltar memória, reduzir o <code>imgsz</code>.</p> },
      ],
    },
    /* ============================================================ 2.3 */
    {
      id: 'b23',
      cod: '2.3',
      titulo: 'Ler os resultados do treino',
      min: 40,
      tipo: 'conceito',
      slides: [
        { titulo: 'O que o treino deixa na pasta', img: 'real_arquivos_ultralytics', pontos: ['results.png: perdas e métricas por época', 'val_batch0_pred.jpg: previsões', 'weights/best.pt: o modelo'] },
        { titulo: 'Acertos e erros numa foto', img: 'real_predicoes_teste', pontos: ['Azul: caixa certa', 'Laranja: caixa onde não há cacho', 'Vermelho: cacho que ficou sem caixa'] },
        { titulo: 'Precisão e revocação em palavras', img: 'real_limiar_confianca', legenda: 'Precisão e revocação em quatro limiares', pontos: ['Precisão: das caixas que o modelo desenhou, quantas estão certas', 'Revocação: dos cachos que existem, quantos o modelo achou', `No teste real: precisão ${d2(R.A_pre.test.P)}, revocação ${d2(R.A_pre.test.R)}`] },
        { titulo: 'mAP50 e mAP50-95', img: 'map_limiares', legenda: 'A mesma caixa nos dez limiares', pontos: ['Um número que resume precisão e revocação', 'mAP50: aceita caixa razoavelmente encaixada', 'mAP50-95: exige caixa bem justa', `Teste real: ${d2(R.A_pre.test.mAP50)} e ${d2(R.A_pre.test.mAP5095)}`] },
        { titulo: 'Escolher o limiar de confiança', img: 'real_limiar_confianca', pontos: ['Limiar baixo: acha mais, erra mais', 'Limiar alto: erra menos, deixa cachos para trás', `Melhor equilíbrio (F1) em conf ≈ ${d2(R.conf_F1max)}`] },
        { titulo: 'A curva que ajuda a escolher', img: 'real_pr_f1', pontos: ['Gerada automaticamente (BoxF1_curve.png)', 'Escolher na validação, nunca no teste'] },
        { titulo: 'Caso UTFPR: curva F1 num detector embarcado', img: 'artigos/41609_p37', legenda: 'Saito (2025), UTFPR Cornélio Procópio, p. 37', pontos: ['Mesma curva usada para escolher o limiar', 'Detector de daninhas em Raspberry Pi'] },
      ],
      teoria: (
        <>
          <p>Depois do treino, a pasta do experimento contém tudo o que é preciso para julgar o modelo. Três arquivos respondem às perguntas principais:</p>
          <ol>
            <li><b><code>results.png</code></b>: as perdas de treino e de validação caíram juntas? Se a validação parou de melhorar ou começou a piorar enquanto o treino seguia caindo, o modelo começou a decorar.</li>
            <li><b><code>val_batch0_pred.jpg</code></b>: as caixas previstas fazem sentido nas fotos de validação? Este é o primeiro lugar onde aparecem rótulos errados.</li>
            <li><b><code>BoxF1_curve.png</code></b>: com que limiar de confiança o modelo equilibra melhor acertos e erros.</li>
          </ol>
          <p>As métricas reportadas pelo Ultralytics podem ser lidas sem fórmulas:</p>
          <table className="tbl">
            <caption>Tabela 2. Métricas de detecção em linguagem prática, com os valores reais do teste (58 fotos, {R.n_gt_test} cachos).</caption>
            <thead><tr><th>métrica</th><th>pergunta que responde</th><th className="num">valor real</th></tr></thead>
            <tbody>
              <tr><td>precisão</td><td>das caixas desenhadas, que fração tem mesmo um cacho?</td><td className="num">{d2(R.A_pre.test.P)}</td></tr>
              <tr><td>revocação</td><td>dos cachos que existem, que fração foi encontrada?</td><td className="num">{d2(R.A_pre.test.R)}</td></tr>
              <tr><td>mAP50</td><td>nota geral, aceitando caixas razoavelmente encaixadas</td><td className="num">{d2(R.A_pre.test.mAP50)}</td></tr>
              <tr><td>mAP50-95</td><td>nota geral, exigindo caixas bem justas</td><td className="num">{d2(R.A_pre.test.mAP5095)}</td></tr>
              <tr><td>erro de contagem</td><td>quantos cachos a mais ou a menos por foto?</td><td className="num">{d2(R.EAM)}</td></tr>
            </tbody>
          </table>
          <p>
            O <b>limiar de confiança</b> (<code>conf</code>) decide quais caixas contam. É uma escolha de uso, não de treino: para contar cachos, escolhe-se o limiar que erra menos a
            contagem na validação. O teste só é usado no fim, uma vez, para relatar o resultado.
          </p>
        </>
      ),
      exemplo: (
        <>
          <Fig n="real_arquivos_ultralytics" cap="Arquivos reais gerados pelo Ultralytics num dos treinos deste material: curvas por época, previsões num lote de validação e distribuição das caixas." />
          <Fig n="real_predicoes_teste" cap="Previsões reais no teste, uma foto por variedade. Azul: acerto; laranja: caixa sem cacho; vermelho tracejado: cacho não encontrado." />
          <Fig n="real_limiar_confianca" cap="A mesma foto com quatro limiares de confiança. P e R no título de cada painel foram calculados contra as anotações do WGISD." />
          <Fig n="pr_curva_real" cap="A curva precisão–revocação percorre todos os limiares de uma vez: no canto esquerdo o modelo é exigente e quase não erra; à direita ele aceita tudo e acha mais objetos, errando mais. A área sob a curva resume esse equilíbrio num número só." />
          <Fig n="real_pr_f1" cap={`Curva precisão–revocação e F1 em função do limiar, calculadas sobre as previsões reais. O F1 máximo (${d2(R.F1max)}) ocorre em conf ≈ ${d2(R.conf_F1max)}.`} />
          <p>
            Quando sobra tempo para testar várias configurações, vale saber que sortear os valores costuma render mais do que varrer uma grade fixa: com o mesmo número de testes, o
            sorteio experimenta mais valores do parâmetro que realmente importa.
          </p>
          <Fig n="grid_vs_random" w={680} cap="Com nove tentativas, a grade testa só três valores de cada parâmetro; o sorteio testa nove valores diferentes do parâmetro que mais afeta o resultado (BERGSTRA; BENGIO, 2012)." />
          <p>O mesmo procedimento aparece num TCC da UTFPR que embarcou um detector de plantas daninhas num Raspberry Pi, incluindo um falso positivo real em campo:</p>
          <Trabalho t={T.daninhas} />
        </>
      ),
      pratica: (
        <>
          <p>Com o treino concluído (parte 6 do notebook):</p>
          <ol>
            <li>Abrir <code>results.png</code> e dizer em que época a validação parou de melhorar.</li>
            <li>Abrir <code>val_batch0_pred.jpg</code> e procurar um rótulo errado ou um cacho não anotado.</li>
            <li>Rodar a tabela de limiares e escolher o <code>conf</code> que erra menos a contagem na validação.</li>
          </ol>
          <Code title="Parte 6 do notebook · métricas na validação" code={`melhor = YOLO(f"{PASTA}/weights/best.pt")
val = melhor.val(data=DATA, split="val")
print(f"precisão {val.box.mp:.2f} · revocação {val.box.mr:.2f} · mAP50 {val.box.map50:.2f}")`} />
        </>
      ),
      exercicios: [
        { nivel: 'básico', q: 'Um modelo tem precisão 0,95 e revocação 0,60. Ele vai contar a mais ou a menos?', r: <p>A menos: quase toda caixa está certa, mas 40% dos cachos ficam sem caixa.</p> },
        { nivel: 'médio', q: 'mAP50 = 0,90 e mAP50-95 = 0,45. Serve para contar cachos? E para medir o tamanho deles?', r: <p>Para contar, provavelmente sim: o modelo acha os cachos. Para medir, não: as caixas não estão bem ajustadas às bordas.</p> },
        { nivel: 'médio', q: 'A dupla escolheu o limiar olhando o teste. Qual o problema?', r: <p>O teste passou a ser usado para decidir, e o número relatado fica otimista. O limiar se escolhe na validação; o teste só confirma no fim.</p> },
      ],
    },
    /* ============================================================ 2.4 */
    {
      id: 'b24',
      cod: '2.4',
      titulo: 'Laboratório: usar o modelo para contar, rastrear e exportar',
      min: 50,
      tipo: 'lab',
      slides: [
        { titulo: 'Do modelo à planilha', img: 'real_contagem', legenda: 'Contagem real por foto', pontos: ['predict em fotos novas', 'Uma linha por foto: nome e número de cachos', 'Salvar contagem.csv no Drive'] },
        { titulo: 'Quanto a contagem erra', img: 'real_contagem', pontos: [`Erro médio: ${d2(R.EAM)} cachos por foto`, R.vies > 0 ? `O modelo conta a mais (${d2(R.vies)} por foto)` : `O modelo conta a menos (${d2(R.vies)} por foto)`, `Erro total: ${pct(R.erro_rel)} dos cachos`] },
        { titulo: 'Caso UTFPR: contar gado com drone', img: 'artigos/41807_p22', legenda: 'Mascaro Junior (2025), UTFPR Cornélio Procópio, p. 22', pontos: ['Mesma receita: anotar, treinar, contar', 'Animais agrupados geram caixas duplicadas', 'Resumo: mAP50 de 93,7%'] },
        { titulo: 'Vídeo: contar sem repetir', img: 'rastreamento_ids', pontos: ['O mesmo cacho aparece em vários quadros', 'O rastreador dá um número a cada objeto', 'Contagem = números diferentes'] },
        { titulo: 'Levar o modelo para fora do Colab', img: 'artigos/36152_p56', legenda: 'YOLO embarcado na armadilha (Medeiros, 2025)', pontos: ['export(format="onnx"): computador comum', 'tflite / ncnn: celular e Raspberry Pi', 'Conferir as previsões depois de exportar'] },
      ],
      teoria: (
        <>
          <p>Um modelo treinado só vale pelo uso que se faz dele. Os três usos mais comuns em aplicações agrícolas são:</p>
          <ol>
            <li><b>Contar em fotos</b>: rodar <code>predict</code> com o limiar escolhido e guardar o número de objetos por foto numa planilha.</li>
            <li><b>Contar em vídeo</b>: o mesmo objeto aparece em muitos quadros; o rastreador (<code>track</code>, com ByteTrack) atribui um número de identificação a cada objeto e a contagem passa a ser o número de identificações diferentes.</li>
            <li><b>Rodar em outro aparelho</b>: <code>export</code> converte o modelo para ONNX (computadores), TFLite ou NCNN (celular, Raspberry Pi). Depois de exportar, as previsões devem ser conferidas contra o modelo original.</li>
          </ol>
          <p>
            Na contagem, erros a mais e a menos podem se compensar no total. Por isso relata-se o erro médio por foto, além do total. No teste deste material, o erro médio foi de{' '}
            {d2(R.EAM)} cachos por foto e o modelo tendeu a contar {R.vies > 0 ? 'a mais' : 'a menos'}.
          </p>
        </>
      ),
      exemplo: (
        <>
          <Fig n="real_contagem" cap={`Contagem real por foto no teste (conf 0,25): à esquerda, detectados contra anotados; à direita, a distribuição do erro. Erro médio de ${d2(R.EAM)} cachos por foto.`} />
          <Fig n="erro_contagem" cap="Outra forma de olhar a contagem: à esquerda, previsto contra anotado foto a foto; à direita, a distribuição do erro. É esta a medida que interessa a quem usa a contagem no campo." />
          <Fig n="rastreamento_ids" cap="Ilustração do rastreamento: uma câmera percorrendo uma foto do WGISD; cada cacho mantém o mesmo número de identificação entre os quadros." />
          <Fig n="artigos/41807_p22" w={640} cap="Contagem de gado com YOLOv8 em fotos de drone. Reprodução de Mascaro Junior (2025), UTFPR Cornélio Procópio, p. 22. O trabalho completo está na seção sobre IoU e NMS." />
        </>
      ),
      pratica: (
        <>
          <Code title="Parte 7 do notebook · contar e salvar" code={`import pandas as pd, glob, os
CONF = 0.4
linhas = []
for f in sorted(glob.glob("/content/dataset/images/test/*")):
    r = melhor.predict(f, conf=CONF, verbose=False)[0]
    linhas.append({"foto": os.path.basename(f), "cachos": len(r.boxes)})
pd.DataFrame(linhas).to_csv(f"{BASE}/contagem.csv", index=False)`} />
          <Code title="Parte 7 · vídeo com rastreamento" code={`ids = set()
for r in melhor.track("fileira.mp4", tracker="bytetrack.yaml", conf=CONF, persist=True, stream=True):
    if r.boxes.id is not None:
        ids.update(r.boxes.id.int().tolist())
print("cachos diferentes:", len(ids))`} />
          <Code title="Parte 7 · exportar" code={`caminho = melhor.export(format="onnx", imgsz=640)
print(len(YOLO(caminho).predict("foto.jpg")[0].boxes), "caixas no modelo exportado")`} />
          <p><b>Desafio da dupla:</b> tirar três fotos com o celular (frutas, grãos, folhas) e rodar o modelo nelas. O que acontece com um objeto que ele nunca viu?</p>
        </>
      ),
      exercicios: [
        { nivel: 'básico', q: 'Num vídeo, a soma das detecções em todos os quadros foi 900 e o rastreador deu 75 identificações. Quantos cachos há?', r: <p>Aproximadamente 75. Os 900 são o mesmo cacho contado em vários quadros (cerca de 12 vezes cada).</p> },
      ],
    },
    /* ============================================================ 2.5 */
    {
      id: 'b25',
      cod: '2.5',
      titulo: 'Laboratório: testar em outro lugar e analisar os erros',
      min: 45,
      tipo: 'lab',
      slides: [
        { titulo: 'O teste que importa', img: 'dominio_variedades', legenda: 'Cinco variedades, cinco aparências', pontos: ['Fotos de outro talhão, outra data, outra variedade', 'É assim que o modelo será usado', 'A validação engana se for parecida demais com o treino'] },
        { titulo: 'Resultado real: variedade nunca vista', img: 'real_dominio_syrah', pontos: [`Validação (variedades vistas): mAP50 ${d2(R.B_dom.val.mAP50)}`, `Syrah, nunca vista: ${d2(R.B_dom.test.mAP50)}`, `Caixas justas: ${d2(R.B_dom.val.mAP5095)} → ${d2(R.B_dom.test.mAP5095)}`], notas: 'Perguntar à turma, antes de mostrar os números, quanto achavam que o modelo ia perder.' },
        { titulo: 'O que muda de um lugar para outro', img: 'dominio_variedades', pontos: ['Cor e maturação', 'Luz, câmera, distância', 'Fundo e densidade de objetos'] },
        { titulo: 'Classificar os erros', img: 'real_predicoes_teste', pontos: ['Oclusão por folha', 'Cacho pequeno ou na borda', 'Caixa duplicada', 'Cacho que ninguém anotou'] },
      ],
      teoria: (
        <>
          <p>
            Um modelo é sempre avaliado num conjunto de teste, mas a pergunta prática é outra: <b>ele funciona no lugar onde vai ser usado?</b> Fotos de outra fazenda, de outra safra
            ou de outra variedade podem diferir em cor, luz, câmera e densidade de objetos. A única forma de saber é testar com dados desse outro lugar, sem usá-los no treino.
          </p>
          <p>
            No experimento real feito para este material, o YOLO foi treinado com quatro variedades de uva e testado somente na Syrah, que ele nunca viu. Na validação, com as variedades
            conhecidas, o mAP50 foi {d2(R.B_dom.val.mAP50)}; na Syrah, {d2(R.B_dom.test.mAP50)}. A queda foi maior nas caixas justas (mAP50-95 de {d2(R.B_dom.val.mAP5095)} para{' '}
            {d2(R.B_dom.test.mAP5095)}): o modelo ainda acha os cachos, mas delimita pior.
          </p>
          <p>
            Depois do número, vem a análise de erros: olhar foto por foto e dar uma causa para cada erro. É comum descobrir que parte dos “falsos positivos” são cachos que ninguém anotou,
            o que é um problema do protocolo de anotação, e não do modelo.
          </p>
        </>
      ),
      exemplo: (
        <>
          <Fig n="real_dominio_syrah" cap="Experimento real: métricas na validação (variedades vistas) e no teste (Syrah, nunca vista), e previsões numa foto de Syrah." />
          <Fig n="dominio_variedades" cap="Uma foto de cada variedade do WGISD com as caixas anotadas: cor, fundo e densidade mudam de uma para outra." />
          <Fig n="dominio_cor" cap="Por que a troca de variedade atrapalha: a cor e o brilho dos cachos de cada variedade ocupam faixas diferentes. O modelo aprendeu as faixas que viu no treino." />
          <Fig n="iluminacao" cap="Mudanças sintéticas de luz, cor, ruído e foco aplicadas a uma foto. Servem para testar robustez, mas não substituem fotos reais de outro lugar." />
        </>
      ),
      pratica: (
        <>
          <ol>
            <li>Rodar a parte 8 do notebook e comparar validação e teste.</li>
            <li>Nas cinco fotos de teste exibidas, marcar cada erro com uma causa: oclusão, tamanho, borda, luz, duplicata ou cacho não anotado.</li>
            <li>Montar uma tabela com quantos erros de cada tipo a dupla encontrou e propor uma ação para o tipo mais frequente (mais fotos de que tipo? mudar o protocolo? aumentar imgsz?).</li>
          </ol>
          <Code title="Parte 8 do notebook" code={`teste = melhor.val(data=DATA, split="test")
print("validação mAP50:", round(val.box.map50, 3), "| teste mAP50:", round(teste.box.map50, 3))`} />
        </>
      ),
      exercicios: [
        { nivel: 'médio', q: 'Metade dos falsos positivos da dupla eram cachos que ninguém anotou. O que fazer?', r: <p>Corrigir as anotações no CVAT e registrar a mudança no protocolo antes de comparar modelos: a precisão real é maior que a medida.</p> },
        { nivel: 'médio', q: 'O modelo vai ser usado em outra fazenda no ano que vem. Que teste convence o produtor?', r: <p>Anotar algumas dezenas de fotos daquela fazenda (sem usá-las no treino) e medir nelas o erro de contagem, que é o número que o produtor usa.</p> },
      ],
    },
    /* ============================================================ 2.6 */
    {
      id: 'b26',
      cod: '2.6',
      titulo: 'Trabalhos reais da UTFPR, passo a passo',
      min: 35,
      tipo: 'leitura',
      slides: [
        { titulo: 'Mosca-das-frutas (PPGTCA)', img: 'artigos/36152_p56', legenda: 'Medeiros (2025), UTFPR Medianeira, p. 56', pontos: ['Armadilha McPhail + câmera + Raspberry Pi', 'YOLOv8 treinado com imagens anotadas', 'Resumo: mAP50 de 95% e recall de 90%'], notas: 'Dissertação do PPGTCA orientada pelo Prof. Pedro. Comparar cada etapa com o notebook da turma.' },
        { titulo: 'O falso positivo de campo', img: 'artigos/36152_p62', legenda: 'Medeiros (2025), p. 62', pontos: ['O que o laboratório não mostrou', 'Que regra do protocolo evitaria?'] },
        { titulo: 'Grãos de soja: detectar e depois classificar', img: 'artigos/34166_p55', legenda: 'Almeida (2024), UTFPR Curitiba, p. 55', pontos: ['YOLO acha os grãos', 'Outra rede classifica a avaria', 'Uma cascata em vez de um modelo só'] },
        { titulo: 'Alface hidropônica (PPGTCA)', img: 'artigos/33800_p78', legenda: 'Leal (2024), UTFPR Medianeira, p. 78', pontos: ['Câmeras fixas nas bancadas', 'Estresse hídrico com delineamento experimental', 'Os tratamentos definem os grupos'] },
        { titulo: 'O mesmo caminho em todos', img: 'esq_fluxo', pontos: ['Problema do campo → o que precisa ser contado ou localizado', 'Anotar com protocolo → treinar YOLO → ler métricas', 'Testar em campo → achar os erros → voltar aos dados'] },
      ],
      teoria: (
        <p>
          Os trabalhos abaixo foram feitos na UTFPR com as mesmas ferramentas desta disciplina. A leitura proposta não é sobre a teoria, mas sobre as <b>decisões práticas</b>: que dados
          foram coletados, como foram anotados, que modelo e que tamanho de imagem foram usados, como os autores mediram o resultado e o que aconteceu em campo. Para cada trabalho, a
          dupla deve localizar no texto as etapas equivalentes às seções do seu notebook.
        </p>
      ),
      exemplo: (
        <>
          <Trabalho t={T.mosca} />
          <Trabalho t={T.alface} />
          <Trabalho t={T.espelho} />
          <p>A soja (detecção e classificação em cascata) e as espécies florestais (segmentação de instâncias) estão na seção sobre as tarefas.</p>
        </>
      ),
      pratica: (
        <>
          <p><b>Em duplas (20 min).</b> Escolher um dos trabalhos desta seção (ou da seção sobre as tarefas) e preencher a ficha abaixo, com a página de onde tirou cada informação.</p>
          <table className="tbl">
            <thead><tr><th>etapa</th><th>no trabalho</th><th>no nosso notebook</th></tr></thead>
            <tbody>
              <tr><td>dados: quantas imagens, de onde, de quando</td><td /><td>WGISD ou CVAT da dupla</td></tr>
              <tr><td>anotação: ferramenta e regras</td><td /><td>CVAT e protocolo do encontro 1</td></tr>
              <tr><td>divisão treino / validação / teste</td><td /><td>Syrah separada no teste</td></tr>
              <tr><td>modelo e tamanho de imagem</td><td /><td>yolo11n, 640</td></tr>
              <tr><td>métrica relatada e em que conjunto</td><td /><td>mAP50 e erro de contagem</td></tr>
              <tr><td>teste em campo ou em outro lugar</td><td /><td>seção 6</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
    /* ============================================================ 2.7 */
    {
      id: 'b27',
      cod: '2.7',
      titulo: 'Projeto da dupla e orientações',
      min: 35,
      tipo: 'leitura',
      slides: [
        { titulo: 'O projeto', img: 'cvat/image013_detrac', legenda: 'Tudo começa na anotação', pontos: ['Um problema agrícola real, escolhido pela dupla', 'Dados próprios anotados no CVAT', 'Notebook baseado no do encontro 2'] },
        { titulo: 'O que entregar', img: 'real_arquivos_ultralytics', pontos: ['Protocolo de anotação com casos-limite', 'Dataset exportado e conferido', 'Notebook que roda do início ao fim', 'Teste em dados de outro lugar e dez erros analisados', 'Relatório curto e demonstração'] },
        { titulo: 'Como será avaliado', img: 'real_dominio_syrah', legenda: 'O teste em outro lugar pesa mais', pontos: ['Dados e anotação: 25%', 'Treino e experimentos: 25%', 'Avaliação em outro lugar e erros: 30%', 'Demonstração e defesa: 20%'] },
      ],
      teoria: (
        <p>
          O projeto final repete, com um problema escolhido pela dupla, o caminho dos dois encontros: anotar no CVAT com protocolo, treinar no Colab, ler os resultados, testar em dados de
          outro lugar e analisar os erros. O notebook do encontro 2 é o ponto de partida; basta trocar a seção de dados para o export do CVAT da dupla.
        </p>
      ),
      exemplo: (
        <Callout kind="campo" title="Ideias de projeto">
          <p>Contar frutos numa planta, contar plântulas numa bandeja, contar ovos ou aves num aviário, achar daninhas entre linhas de plantio, contar insetos em armadilhas adesivas, separar grãos avariados numa amostra.</p>
        </Callout>
      ),
      pratica: <p>Cada dupla define hoje o problema, a origem das fotos, a classe ou as classes a anotar e de onde virão as fotos de “outro lugar” para o teste final.</p>,
    },
  ],
  artigos: [
    { tag: 'dissertação, UTFPR Medianeira', br: true, ref: 'Medeiros, T. A. (2025). Sistema automatizado de detecção de mosca-das-frutas com rede neural convolucional. Dissertação (PPGTCA), UTFPR.', link: 'https://repositorio.utfpr.edu.br/jspui/handle/1/36152', porque: 'O fluxo completo, da armadilha ao campo, no mesmo programa desta disciplina.', perguntas: ['As fotos de teste vieram de armadilhas diferentes das do treino?', 'O resultado foi medido em laboratório ou em campo?'] },
    { tag: 'TCC, UTFPR Cornélio Procópio', br: true, ref: 'Mascaro Junior, P. R. (2025). Uso de visão computacional e drone para contagem automatizada de gado: uma abordagem baseada com YOLOv8. TCC, UTFPR.', link: 'https://repositorio.utfpr.edu.br/jspui/handle/1/41807', porque: 'Contagem com YOLOv8 em fotos de drone e o problema das caixas duplicadas.' },
    { tag: 'TCC, UTFPR Cornélio Procópio', br: true, ref: 'Saito, L. L. (2025). Detector de daninhas de baixo custo baseado em métodos inteligentes. TCC, UTFPR.', link: 'https://repositorio.utfpr.edu.br/jspui/handle/1/41609', porque: 'Escolha do limiar pela curva F1 e uso num Raspberry Pi.' },
    { tag: 'conjunto de dados, Embrapa', br: true, ref: 'Santos, T. T. et al. (2020). Grape detection, segmentation, and tracking using deep neural networks and three-dimensional association. Computers and Electronics in Agriculture, 170, 105247.', link: 'https://doi.org/10.1016/j.compag.2020.105247', porque: 'Origem do WGISD e contagem de cachos em vídeo.' },
    { tag: 'documentação', ref: 'Ultralytics. Documentação do YOLO: treino, validação, predição, rastreamento e exportação.', link: 'https://docs.ultralytics.com/modes/', porque: 'Referência de todos os parâmetros usados no notebook.' },
    { tag: 'documentação', ref: 'CVAT. Exportação no formato Ultralytics YOLO.', link: 'https://docs.cvat.ai/docs/dataset_management/formats/format-yolo-ultralytics/', porque: 'Como sair do CVAT direto para o notebook.' },
    { tag: 'comparação de modelos YOLO', ref: 'Dang, F. et al. (2023). YOLOWeeds: a novel benchmark of YOLO object detectors for multi-class weed detection in cotton production systems. Computers and Electronics in Agriculture, 205, 107655.', link: 'https://doi.org/10.1016/j.compag.2023.107655', porque: 'Compara 25 versões do YOLO num problema agrícola; ajuda a escolher o tamanho do modelo.' },
    { tag: 'rastreamento', ref: 'Zhang, Y. et al. (2022). ByteTrack: multi-object tracking by associating every detection box. ECCV.', link: 'https://arxiv.org/abs/2110.06864', porque: 'O rastreador usado na contagem em vídeo.' },
    { tag: 'objetos pequenos', ref: 'Akyon, F. C.; Altinuc, S. O.; Temizel, A. (2022). Slicing aided hyper inference and fine-tuning for small object detection. ICIP.', link: 'https://arxiv.org/abs/2202.06934', porque: 'Fatiamento de imagens para objetos pequenos.' },
  ],
  quiz: [
    { p: 'O treino terminou e a sessão do Colab caiu. Onde os pesos deveriam estar?', o: ['na pasta /content', 'no Google Drive montado', 'na memória da GPU', 'no CVAT'], a: 1, e: 'O Colab apaga /content ao encerrar a sessão.' },
    { p: 'Apareceu erro de falta de memória na GPU. O primeiro ajuste é:', o: ['aumentar epochs', 'reduzir batch', 'aumentar imgsz', 'trocar o data.yaml'], a: 1, e: 'Menos imagens por passo usam menos memória.' },
    { p: 'Os objetos são muito pequenos nas fotos. O que tentar?', o: ['reduzir imgsz', 'aumentar imgsz ou fatiar as fotos', 'reduzir epochs', 'aumentar o limiar de confiança'], a: 1, e: 'Com mais pixels por objeto, o modelo enxerga melhor.' },
    { p: 'Qual arquivo guarda a melhor época do treino?', o: ['last.pt', 'best.pt', 'results.csv', 'args.yaml'], a: 1, e: 'best.pt é a época com melhor resultado na validação.' },
    { p: 'Precisão alta e revocação baixa significam que o modelo:', o: ['conta a mais', 'conta a menos', 'conta certo', 'não detecta nada'], a: 1, e: 'Quase toda caixa está certa, mas muitos objetos ficam sem caixa.' },
    { p: 'Em vídeo, a contagem de objetos deve usar:', o: ['a soma das caixas de todos os quadros', 'o número de identificações do rastreador', 'o maior número de caixas num quadro', 'a média por quadro'], a: 1, e: 'Cada identificação é um objeto visto em vários quadros.' },
    { p: 'O limiar de confiança para contar deve ser escolhido com:', o: ['o treino', 'a validação', 'o teste', 'qualquer conjunto'], a: 1, e: 'O teste fica guardado para o resultado final.' },
    { p: 'O modelo vai para outra fazenda. O teste mais convincente é:', o: ['o mAP da validação', 'fotos anotadas daquela fazenda, fora do treino', 'aumentar as épocas', 'mudanças sintéticas de luz'], a: 1, e: 'Só dados do lugar de uso mostram como o modelo vai se comportar lá.' },
  ],
  entregas: [
    <><b>Notebook</b> baseado no da aula, rodando do início ao fim com os dados da dupla, com o registro do experimento (seção 7).</>,
    <><b>Leitura dos resultados</b>: results.png comentado, precisão, revocação, mAP50 e erro de contagem na validação, e o limiar escolhido com justificativa.</>,
    <><b>Teste em outro lugar</b>: fotos de outra origem, nunca usadas no treino, e a comparação com a validação.</>,
    <><b>Dez erros analisados</b>, com recorte da foto e causa provável.</>,
    <><b>Ficha de um trabalho da UTFPR</b> e demonstração do modelo em fotos ou vídeo.</>,
  ],
  limitacoes: [
    <>Os números e as figuras de resultados vêm de treinos reais do YOLO11n no WGISD (Ultralytics 8.3.224, uma execução por configuração, semente 0). Outras versões, GPUs ou sementes dão números próximos, mas não idênticos.</>,
    <>O teste em “outro lugar” do notebook é uma variedade de uva diferente, no mesmo vinhedo. Uma fazenda, uma safra ou uma câmera diferentes podem causar quedas maiores.</>,
    <>A ilustração de rastreamento simula uma câmera percorrendo uma foto; em vídeo real, oclusões e movimento tornam o rastreamento mais difícil.</>,
    <>Os prints dos trabalhos da UTFPR são reproduzidos para leitura crítica; os números citados vêm dos resumos dos próprios trabalhos.</>,
  ],
  referencias: [
    'AKYON, F. C.; ALTINUC, S. O.; TEMIZEL, A. Slicing aided hyper inference and fine-tuning for small object detection. In: IEEE INTERNATIONAL CONFERENCE ON IMAGE PROCESSING (ICIP), 2022. Proceedings [...]. 2022. p. 966-970.',
    'ALMEIDA, J. M. L. de. Sistema para classificação automática de grãos de soja baseado em visão computacional. 2024. Dissertação (Mestrado em Computação Aplicada) – Universidade Tecnológica Federal do Paraná, Curitiba, 2024.',
    'COSTA, P. L. Desenvolvimento de metodologia de inteligência artificial para a identificação e contagem de esporos de Phakopsora pachyrhizi. 2024. Trabalho de Conclusão de Curso (Engenharia da Computação) – Universidade Tecnológica Federal do Paraná, Cornélio Procópio, 2024.',
    'DANG, F.; CHEN, D.; LU, Y.; LI, Z. YOLOWeeds: a novel benchmark of YOLO object detectors for multi-class weed detection in cotton production systems. Computers and Electronics in Agriculture, v. 205, 107655, 2023.',
    'GUELFI, J. A. T. Comparação de modelos de deep learning na detecção de esporos de fungos em lâminas de microscópio. 2024. Dissertação (Mestrado em Informática) – Universidade Tecnológica Federal do Paraná, Cornélio Procópio, 2024.',
    'JOCHER, G.; QIU, J.; CHAURASIA, A. Ultralytics YOLO. 2023. Software. Disponível em: https://github.com/ultralytics/ultralytics.',
    'LEAL, E. R. P. Desenvolvimento de manejo de alface em hidroponia por rede neural artificial convolucional. 2024. Dissertação (Mestrado em Tecnologias Computacionais para o Agronegócio) – Universidade Tecnológica Federal do Paraná, Medianeira, 2024.',
    'MASCARO JUNIOR, P. R. Uso de visão computacional e drone para contagem automatizada de gado: uma abordagem baseada com YOLOv8. 2025. Trabalho de Conclusão de Curso (Engenharia de Computação) – Universidade Tecnológica Federal do Paraná, Cornélio Procópio, 2025.',
    'MEDEIROS, T. A. Sistema automatizado de detecção de mosca-das-frutas com rede neural convolucional. 2025. Dissertação (Mestrado em Tecnologias Computacionais para o Agronegócio) – Universidade Tecnológica Federal do Paraná, Medianeira, 2025.',
    'OSOWSKI, I. Y. Comparação de modelos de edge-computing no reconhecimento de espécies florestais através de segmentação de instância. 2025. Trabalho de Conclusão de Curso (Ciência da Computação) – Universidade Tecnológica Federal do Paraná, Medianeira, 2025.',
    'SAITO, L. L. Detector de daninhas de baixo custo baseado em métodos inteligentes. 2025. Trabalho de Conclusão de Curso (Engenharia de Controle e Automação) – Universidade Tecnológica Federal do Paraná, Cornélio Procópio, 2025.',
    'SANTOS, T. T.; DE SOUZA, L. L.; DOS SANTOS, A. A.; AVILA, S. Grape detection, segmentation, and tracking using deep neural networks and three-dimensional association. Computers and Electronics in Agriculture, v. 170, 105247, 2020.',
    'ZHANG, Y. et al. ByteTrack: multi-object tracking by associating every detection box. In: EUROPEAN CONFERENCE ON COMPUTER VISION (ECCV), 2022. Proceedings [...]. Cham: Springer, 2022. p. 1-21.',
  ],
})
