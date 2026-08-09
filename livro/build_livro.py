#!/usr/bin/env python3
"""Gera o livro diagramado de Dualis (HTML + PDF) a partir do manuscrito revisado.

Implementa o Sistema Gráfico:
  - paleta: papel #E9E4D8, índigo #26364F, verde oxidado #3C6B60, latão #A9762B
  - régua de seção 62/38 na abertura de cada capítulo
  - ornamento de fim de capítulo
  - brasões das oito Famílias (Livro V)
  - glifos dos doze Eixos (capítulo 18) — material de Mestre
  - faixa de resultado 2d6
  - formato 190 × 250 mm

Uso: python3 build_livro.py [--html-only]
"""
import html as htmlmod
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / 'manuscrito-revisado.md'
OUT_HTML = HERE / 'dualis-livro-basico.html'
OUT_PDF = HERE / 'Dualis-Livro-Basico-Diagramado.pdf'

# ---------------------------------------------------------------- SVG ícones

from urllib.parse import quote

def _svg(body, vb='0 0 48 48', cls='icon', color='#26364F'):
    body = body.replace('currentColor', color)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none" '
           f'stroke="{color}" stroke-linecap="round" stroke-linejoin="round">{body}</svg>')
    return f'<img class="{cls}" src="data:image/svg+xml,{quote(svg)}"/>'


I, L, V = '#26364F', '#A9762B', '#3C6B60'

BRASOES_BODY = {
    'I': (  # Vigilantes: torre, lanterna, três raios
        '<path d="M18 42 L24 10 L30 42 Z" stroke-width="1.6"/>'
        '<circle cx="24" cy="8" r="2.4" stroke-width="1.6"/>'
        '<path d="M24 1.5 V4.5 M15 5 l2.3 2.3 M33 5 l-2.3 2.3" stroke-width="1.6"/>'
        '<path d="M20.5 28 h7 M19.2 35 h9.6" stroke-width="1.2"/>'),
    'II': (  # Guardiões: porta em arco, metade esquerda some
        '<path d="M24 8 a10 10 0 0 1 10 10 V42 H24" stroke-width="1.6"/>'
        '<path d="M24 8 a10 10 0 0 0 -10 10 V42 H24" stroke-width="1.6" stroke-dasharray="2.5 3.5"/>'
        '<path d="M24 8 V42" stroke-width="1.2"/>'
        '<circle cx="28.5" cy="26" r="1.2" stroke-width="1.2"/>'),
    'III': (  # Juízes: balança de pratos desiguais
        '<path d="M24 6 V40 M14 40 h20" stroke-width="1.6"/>'
        '<path d="M8 14 L40 10" stroke-width="1.6"/>'
        '<path d="M8 14 l-4.5 9 h9 Z" stroke-width="1.4"/>'
        '<path d="M40 10 l-4.5 12 h9 Z" stroke-width="1.4"/>'),
    'IV': (  # Máscaras: rosto partido
        '<path d="M24 6 a15 18 0 0 0 0 36" stroke-width="1.6"/>'
        '<path d="M24 6 a15 18 0 0 1 0 36" stroke-width="1.6" stroke-dasharray="2.5 3.5"/>'
        '<path d="M17 20 h4 M27 20 h4" stroke-width="1.4"/>'
        '<path d="M19 31 q5 3.4 10 0" stroke-width="1.4"/>'),
    'V': (  # Oráculos: bacia, reflexo que sobe
        '<path d="M8 24 a16 14 0 0 0 32 0" stroke-width="1.6"/>'
        '<ellipse cx="24" cy="24" rx="16" ry="3.4" stroke-width="1.2"/>'
        '<path d="M24 18 V7 M20.6 10.4 L24 7 l3.4 3.4" stroke-width="1.6"/>'),
    'VI': (  # Coletores: arca cheia
        '<rect x="8" y="12" width="32" height="28" rx="1.5" stroke-width="1.6"/>'
        '<path d="M8 21 h32 M8 30 h32 M24 12 V40" stroke-width="1.2"/>'
        '<path d="M11 16.5 h9 M28 16.5 h9 M11 25.5 h9 M28 25.5 h9 M11 34.5 h9 M28 34.5 h9" stroke-width="1"/>'),
    'VII': (  # Laços: duas cordas, um cruzamento
        '<path d="M6 14 C 20 14 28 34 42 34" stroke-width="1.6"/>'
        '<path d="M6 34 C 20 34 28 14 42 14" stroke-width="1.6"/>'
        '<circle cx="24" cy="24" r="3" stroke-width="1.4"/>'),
    'VIII': (  # Sombras: disco meio preenchido
        '<circle cx="24" cy="24" r="15" stroke-width="1.6"/>'
        '<path d="M24 9 a15 15 0 0 0 0 30 Z" fill="currentColor" stroke="none"/>'),
}
BRASOES = {k: _svg(b, color=L) for k, b in BRASOES_BODY.items()}          # grandes, latão
BRASOES_MINI = {k: _svg(b, color=I) for k, b in BRASOES_BODY.items()}     # mini, índigo

GLIFOS = {
    'A NÉVOA': _svg('<path d="M12 18 h24 M9 24 h30 M14 30 h20 M19 36 h10" stroke-width="1.6"/>', color=L),
    'A PORTA': _svg('<path d="M14 42 V20 a10 10 0 0 1 20 0 V42" stroke-width="1.6"/>'
                    '<path d="M24 14 V42" stroke-width="1.2" stroke-dasharray="2.5 3"/>', color=L),
    'A CORDA': _svg('<path d="M10 14 C 26 14 22 34 38 34" stroke-width="1.8"/>'
                    '<path d="M10 19 C 23 19 19 39 38 39" stroke-width="1.1"/>', color=L),
    'O ROSTO': _svg('<ellipse cx="24" cy="24" rx="13" ry="16" stroke-width="1.6"/>'
                    '<path d="M24 8 V40" stroke-width="1.2" stroke-dasharray="2.5 3"/>', color=L),
    'AS RÉDEAS': _svg('<path d="M8 38 Q 24 10 40 38" stroke-width="1.6"/>'
                      '<circle cx="24" cy="17.5" r="3.2" stroke-width="1.4"/>', color=L),
    'A MURALHA': _svg('<rect x="8" y="14" width="32" height="20" stroke-width="1.6"/>'
                      '<path d="M8 24 h32 M24 14 v10 M16 24 v10 M32 24 v10" stroke-width="1.2"/>', color=L),
    'A BALANÇA': _svg('<path d="M24 8 V38 M16 38 h16 M10 14 h28" stroke-width="1.6"/>'
                      '<path d="M10 14 l-4 8 h8 Z M38 14 l-4 8 h8 Z" stroke-width="1.3"/>', color=L),
    'O PESO': _svg('<circle cx="24" cy="12" r="4" stroke-width="1.6"/>'
                   '<path d="M24 16 V32 M24 32 l-7 8 M24 32 l7 8 M10 21 h28" stroke-width="1.6"/>', color=L),
    'O LIMITE': _svg('<path d="M20 8 V40" stroke-width="1.8"/>'
                     '<path d="M26 14 h10 M26 24 h10 M26 34 h10" stroke-width="1.4" stroke-dasharray="3 3"/>', color=L),
    'A BRASA': _svg('<path d="M24 8 C 33 18 36 24 36 30 a12 12 0 0 1 -24 0 c0-6 3-12 12-22 Z" stroke-width="1.6"/>', color=L),
    'A MARCA': _svg('<circle cx="24" cy="24" r="14" stroke-width="1.6"/>'
                    '<path d="M14 34 L34 14" stroke-width="1.6"/>', color=L),
    'A CORRENTE': _svg('<path d="M17 15 a8 8 0 1 0 0 12" stroke-width="1.6"/>'
                       '<path d="M31 21 a8 8 0 1 1 0 12" stroke-width="1.6" stroke-dasharray="2.5 3"/>', color=L),
}

import artes as _artes
PECAS = _artes.catalogo(BRASOES_BODY.values())
FINAIS = HERE / 'artes-finais'   # arte pintada substitui o vetor: ex. artes-finais/C-01.png

def arte_src(code):
    for ext in ('png', 'jpg', 'jpeg', 'webp'):
        f = FINAIS / f'{code}.{ext}'
        if f.exists():
            return f.as_uri()
    return _artes.uri(PECAS[code])

def arte(code, cls='arte-meia'):
    return f'<figure class="{cls}"><img src="{arte_src(code)}"/></figure>'

ARTE_PARTE = {'LIVRO I': 'B-01', 'LIVRO II': 'B-02', 'LIVRO III': 'B-03',
              'LIVRO IV': 'B-04', 'LIVRO V': 'B-05', 'LIVRO VI': 'B-06',
              'LIVRO VII': 'B-07'}
ARTE_SPOT = {4: 'S-08', 10: 'S-02', 11: 'S-03', 13: 'S-04', 14: 'S-05', 15: 'S-06',
             16: 'S-07', 17: 'S-11', 18: 'S-09', 20: 'S-12', 22: 'S-13', 23: 'S-14'}
ARTE_TERRITORIO = {29: 'T-01', 30: 'T-06', 31: 'T-04', 32: 'T-05', 33: 'T-07',
                   34: 'T-08', 35: 'T-09', 36: 'T-10', 37: 'T-03', 38: 'T-11',
                   39: 'T-02', 40: 'T-12'}
ARTE_CRONICA = {42: 'G-01', 43: 'G-02', 44: 'G-03', 45: 'G-04', 46: 'G-05', 47: 'G-06'}
ARTE_CRIATURA = {
    'O VIGIA': 'C-01', 'O ESTRATEGISTA': 'C-02', 'O RASTREADOR': 'C-03',
    'O GUARDIÃO': 'C-04', 'O ADIADOR': 'C-05', 'O EREMITA': 'C-06', 'O JUIZ': 'C-07',
    'O CARRASCO': 'C-08', 'O ARTESÃO IMPOSSÍVEL': 'C-09', 'O CAMALEÃO': 'C-10',
    'O ATOR': 'C-11', 'O HERDEIRO': 'C-12', 'O ORÁCULO': 'C-13',
    'O LEITOR DE SINAIS': 'C-14', 'O PRESSÁGIO': 'C-15', 'O COLECIONADOR': 'C-16',
    'O INVENTARIANTE': 'C-17', 'O CONTABILISTA': 'C-18', 'O DEVEDOR': 'C-19',
    'O SALVADOR': 'C-20', 'O ABANDONADO': 'C-21', 'O DUPLO': 'C-22',
    'O INVISÍVEL': 'C-23', 'O SILENCIADOR': 'C-24'}
ARTE_RETRATO = {'IRIS': 'F-01', 'TAVI': 'F-02', 'BEREN': 'F-03', 'WREN': 'F-04'}

_REGUA_SVG = (
    '<path d="M0 6 H266" stroke="#26364F" stroke-width="1.6"/>'
    '<path d="M272 6 H288" stroke="#26364F" stroke-width="1.6" stroke-dasharray="1.2 3.4"/>'
    '<path d="M298 1.4 L302.6 6 L298 10.6 L293.4 6 Z" stroke="#26364F" stroke-width="1.3"/>'
    '<path d="M308 6 H324" stroke="#A9762B" stroke-width="1.6" stroke-dasharray="1.2 3.4"/>'
    '<path d="M330 6 H462" stroke="#A9762B" stroke-width="1.6"/>')
REGUA = ('<div class="regua" aria-hidden="true">'
         + _svg(_REGUA_SVG, vb='0 0 462 12', cls='regua-svg') + '</div>')

FIM = ('<div class="fim-capitulo" aria-hidden="true">'
       + _svg('<path d="M6 16 C 30 4 66 28 90 16" stroke-width="1.4"/>'
              '<path d="M6 16 C 30 28 66 4 90 16" stroke-width="1.4"/>'
              '<circle cx="48" cy="16" r="2.6" stroke-width="1.4"/>',
              vb='0 0 96 32', cls='fim-svg')
       + '</div>')

FAIXA_2D6 = '''
<div class="faixa2d6" aria-label="Faixa de resultado 2d6">
  <div class="f-legenda">41%</div>
  <div class="f-barras">
    <div class="f-seg f-baixo"><span>6 OU MENOS</span></div>
    <div class="f-seg f-meio"><span>7 A 9</span></div>
    <div class="f-seg f-alto"><span>10 OU MAIS</span></div>
  </div>
  <div class="f-rotulos">
    <div>o mundo decide</div><div>consegue, e alguma coisa muda de lugar</div><div>consegue e mantém a posição</div>
  </div>
</div>'''

TRILHO_SVG = ('<div class="trilho-diagrama" aria-label="Trilho de Três Convites">'
              + _svg(
                  '<path d="M28 84 q92 -46 184 -14" stroke-width="1.3" stroke-dasharray="4 4" stroke="#A9762B"/>'
                  '<path d="M28 84 l7 -1.4 M28 84 l5.4 4.8" stroke-width="1.3" stroke="#A9762B"/>'
                  '<rect x="10" y="88" width="56" height="16" stroke-width="1.5" stroke="#26364F"/>'
                  '<rect x="98" y="76" width="56" height="28" stroke-width="1.5" stroke="#26364F"/>'
                  '<rect x="186" y="62" width="56" height="42" stroke-width="1.5" stroke="#26364F"/>'
                  '<circle cx="38" cy="88" r="2.6" fill="#A9762B" stroke="none"/>'
                  '<circle cx="126" cy="76" r="2.6" fill="#A9762B" stroke="none"/>'
                  '<circle cx="214" cy="62" r="2.6" fill="#A9762B" stroke="none"/>'
                  '<path d="M70 92 h22 M88 88.5 l4 3.5 -4 3.5" stroke-width="1.5" stroke="#3C6B60"/>'
                  '<path d="M158 84 h22 M176 80.5 l4 3.5 -4 3.5" stroke-width="1.5" stroke="#3C6B60"/>'
                  '<path d="M2 104 h250" stroke-width="1.5" stroke="#26364F"/>'
                  '<text x="38" y="116" text-anchor="middle" font-family="Liberation Sans" font-size="7.5" letter-spacing="1" fill="#26364F" stroke="none">DISCRETO</text>'
                  '<text x="126" y="116" text-anchor="middle" font-family="Liberation Sans" font-size="7.5" letter-spacing="1" fill="#26364F" stroke="none">COM CUSTO</text>'
                  '<text x="214" y="116" text-anchor="middle" font-family="Liberation Sans" font-size="7.5" letter-spacing="1" fill="#26364F" stroke="none">COM ALIADO</text>'
                  '<text x="126" y="50" text-anchor="middle" font-family="Liberation Sans" font-size="6.5" letter-spacing="1" fill="#A9762B" stroke="none">RECUOU DUAS VEZES · DESÇA UM DEGRAU</text>',
                  vb='0 0 254 122', cls='trilho-svg')
              + '</div>')

# ------------------------------------------------------------- utilidades

SMALL_WORDS = {'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em',
               'que', 'à', 'às', 'ao', 'aos', 'um', 'uma', 'na', 'no', 'nas',
               'nos', 'por', 'para', 'sem', 'com', 'seu', 'sua'}

ACRONIMOS = {'tcc': 'TCC', 'dbt': 'DBT', 'rpg': 'RPG', 'npc': 'NPC',
             'npcs': 'NPCs', '2d6': '2d6', 'd20': 'd20'}

def titlecase(s):
    if s != s.upper():
        return s
    words = s.lower().split()
    out = []
    for i, w in enumerate(words):
        base = w.rstrip(':;,.')
        suf = w[len(base):]
        if base in ACRONIMOS:
            out.append(ACRONIMOS[base] + suf)
        elif w in SMALL_WORDS and i > 0:
            out.append(w)
        else:
            out.append(w.capitalize())
    return ' '.join(out)

def esc(s):
    return htmlmod.escape(s, quote=False)

# rótulos que abrem parágrafo em negrito (verbetes, eixos, exemplos, fichas)
LABELS = [
    'Territórios:', 'Eixo:', 'Aparência.', 'Natureza.', 'Promessa.', 'Custo.',
    'O que protege.', 'Movimentos.', 'Sinais na mesa.', 'Quando não é.',
    'Metamorfose.', 'Cuidado de mesa.', 'A pergunta oculta:', 'Os dois polos.',
    'Onde aparece.', 'Trilho.', 'Ferramenta:', 'Cinco respostas do mundo.',
    'Padrões frequentes.', 'Trava.', 'Obrigação do Mestre.', 'Regra do Trilho.',
    'Regra do rastro.', 'Princípio da Continuidade.', 'Proporcionalidade.',
    'A Cena.', 'A resposta.', 'A rolagem.', 'Faixa.', 'Eco criado.', 'Sem Eco.',
    'O que o Mestre não fez.', 'Origem.', 'Portador.', 'Retorno.', 'Imediato.',
    'Na virada.', 'Em Eco.', 'Baixa.', 'Média.', 'Alta.', 'Identidade.',
    'Conceito.', 'Valores.', 'Desejo principal.', 'Recursos.', 'Limites.',
    'Sobre si.', 'Sobre os outros.', 'Sobre o mundo.', 'Reaparece quando:',
    'Eixo dominante:', 'Trilho sugerido.', 'Cuidado.', 'Cuidado especial.',
    'Duração sugerida:', 'Duração:', 'Como observação.', 'Como metáfora.',
    'Como encarnação.', 'Crédito.', 'Padrão de Entrada.', 'Padrão Dominante.',
    'Padrões de Apoio.', 'Promessa da Trama.', 'Custo da Trama.', 'Ciclo.',
    'Ruptura.', 'Entrada:', 'Dominante:', 'Apoio:', 'Ciclo:', 'Ruptura:',
    'O que os une.', 'As tensões prontas.', 'O que cada um tem que os outros não têm.',
    'Os Eixos não se sobrepõem.', 'Pessoa escolhida:', 'Primeiro convite, discreto:',
    'Preparação do Mestre, quinze minutos:', 'Hipótese central:',
    'Pergunta clínica preferencial:', 'Premissa —', 'Regra do rastro.',
]
LABELS.sort(key=len, reverse=True)

DIALOGO_RE = re.compile(r'^(MESTRE|IRIS|TAVI|BEREN|WREN)(:| \()')
ARROW_RE = re.compile(r'^[A-ZÀ-ÜÇ0-9 §·—-]+(→[A-ZÀ-ÜÇ0-9 §·—→-]+)+$')

def fmt_inline(s):
    s = esc(s)
    # aspas e travessões já vêm tipográficos do docx
    for lab in LABELS:
        if s.startswith(esc(lab)):
            head = esc(lab)
            return f'<strong class="lead">{head}</strong>{s[len(head):]}'
    return s

# ------------------------------------------------------------- parser

class Builder:
    def __init__(self, lines):
        self.lines = lines
        self.i = 0
        self.out = []
        self.part_n = 0
        self.chap_n = 0
        self.family = None      # brasão corrente dentro do Livro V
        self.in_aside = False
        self.in_mestre = False
        self.toc = []           # (nível, id, kicker, título)
        self.sec_n = 0
        self.corpo_desde_abertura = False
        self.abre_cap = False

    # ---- helpers de fluxo
    def emit(self, s):
        self.out.append(s)

    def close_aside(self):
        if self.in_aside:
            self.emit('</aside>')
            self.in_aside = False

    def close_mestre(self):
        if self.in_mestre:
            self.emit('</div>')
            self.in_mestre = False

    def close_blocks(self):
        self.close_aside()
        self.close_mestre()

    def fecha_capitulo(self):
        self.close_blocks()
        if self.corpo_desde_abertura:
            self.emit(FIM)
        self.corpo_desde_abertura = False

    # ---- tabelas e caixas
    def table_block(self, rows):
        self.corpo_desde_abertura = True
        cells = [[c.strip() for c in r.strip().strip('|').split('|')] for r in rows]
        if all(len(r) == 1 for r in cells):
            label = cells[0][0]
            body = [r[0] for r in cells[1:]]
            if not body:            # caixa de uma linha só
                body, label = [label], ''
            cls = 'box'
            up = label.upper()
            if up.startswith('CUIDADO'):
                cls += ' box-cuidado'
            elif up.startswith(('IRIS', 'NARA', 'EXEMPLO', 'ECO', 'MARCA', 'ZONA')):
                cls += ' box-exemplo'
            h = f'<div class="{cls}">'
            if label:
                h += f'<div class="box-label">{esc(label)}</div>'
            for b in body:
                h += f'<p>{fmt_inline(b)}</p>'
            h += '</div>'
            self.emit(h)
            return
        # tabela real
        head, *rest = cells
        dice = head[0].lower().startswith('resultado')
        h = ['<table><thead><tr>']
        h += [f'<th>{esc(c)}</th>' for c in head]
        h.append('</tr></thead><tbody>')
        for r in rest:
            h.append('<tr>' + ''.join(f'<td>{fmt_inline(c)}</td>' for c in r) + '</tr>')
        h.append('</tbody></table>')
        self.emit(''.join(h))
        if dice:
            self.emit(FAIXA_2D6)

    # ---- cabeçalhos
    def part(self, text):
        self.fecha_capitulo()
        self.family = None
        self.part_n += 1
        pid = f'p{self.part_n}'
        kicker, _, title = text.partition(' · ')
        if not title:
            kicker, title = '', text
        title_d = titlecase(title)
        self.toc.append(('part', pid, kicker, title_d))
        sub = ''
        if title == 'BESTIÁRIO DE PADRÕES':
            sub = '<p class="part-sub">Toda criatura deste livro aprendeu, alguma vez, a proteger alguma coisa.</p>'
        art = arte(ARTE_PARTE[kicker], 'arte-parte') if kicker in ARTE_PARTE else ''
        cls = 'part com-arte' if art else 'part'
        self.emit(f'<section class="{cls}" id="{pid}">{art}'
                  f'{REGUA}'
                  f'<div class="part-kicker">{esc(kicker)}</div>'
                  f'<h1>{esc(title_d)}</h1>{sub}</section>')

    def chapter(self, text):
        self.fecha_capitulo()
        cid = f'c{len(self.toc)}'
        m = re.match(r'(Capítulo \d+|Apêndice [A-Z]\d?|\d+\.)\s*[·.]?\s*(.*)', text)
        if text.startswith('FAMÍLIA'):
            self.family_open(text)
            return
        if m:
            kicker, title = m.group(1).rstrip('.'), m.group(2)
        else:
            kicker, title = '', text
        title_d = titlecase(title)
        self.toc.append(('chap', cid, kicker, title_d))
        self.emit(f'<section class="chapter" id="{cid}">{REGUA}'
                  f'<div class="chap-kicker">{esc(kicker.upper())}</div>'
                  f'<h2>{esc(title_d)}</h2></section>')
        mnum = re.match(r'Capítulo (\d+)$', kicker)
        num = int(mnum.group(1)) if mnum else None
        if num in ARTE_TERRITORIO:
            self.emit(arte(ARTE_TERRITORIO[num], 'arte-meia'))
        elif num in ARTE_CRONICA:
            self.emit(arte(ARTE_CRONICA[num], 'arte-meia'))
        elif num in ARTE_SPOT:
            self.emit(arte(ARTE_SPOT[num], 'arte-spot'))
        if num == 28:
            self.emit(arte('H-01', 'arte-pagina'))
        if title == 'O Atlas em uma página':
            self.emit(arte('H-03', 'arte-meia'))
        self.abre_cap = True

    def family_open(self, text):
        m = re.match(r'FAMÍLIA ([IVX]+):\s*(.*)', text)
        num, nome = m.group(1), m.group(2)
        self.family = num
        fid = f'f{num}'
        self.toc.append(('fam', fid, f'FAMÍLIA {num}', titlecase(nome)))
        self.emit(f'<section class="familia" id="{fid}">'
                  f'<div class="brasao brasao-grande">{BRASOES[num]}</div>'
                  f'<div class="chap-kicker">FAMÍLIA {num}</div>'
                  f'<h2>{esc(titlecase(nome))}</h2></section>')

    def h3(self, text):
        self.close_blocks()
        if self.family and text.startswith('O '):
            self.emit(f'<h3 class="criatura"><span class="brasao brasao-mini">'
                      f'{BRASOES_MINI[self.family]}</span>{esc(titlecase(text))}</h3>')
            if text in ARTE_CRIATURA:
                self.emit(arte(ARTE_CRIATURA[text], 'arte-retrato'))
        else:
            self.emit(f'<h3>{esc(titlecase(text))}</h3>')
            if text in ARTE_RETRATO:
                self.emit(arte(ARTE_RETRATO[text], 'arte-flutua'))

    def h4(self, text):
        if text == 'CAMADA DO MESTRE':
            self.close_blocks()
            self.in_mestre = True
            self.emit('<div class="camada-mestre">'
                      '<div class="cm-label">Camada do Mestre · não imprimir na ficha destacável</div>')
            return
        if text == 'CAMADA DO JOGADOR':
            self.close_blocks()
            self.emit('<h4 class="camada-jogador">Camada do Jogador</h4>')
            return
        m = re.match(r'(\d+)\.\s+(.*)', text)
        glifo = ''
        if m and m.group(2).upper() in GLIFOS:
            nome = m.group(2).upper()
            glifo = f'<span class="glifo">{GLIFOS[nome]}</span>'
            self.emit(f'<h4 class="eixo-titulo">{glifo}'
                      f'<span class="eixo-num">EIXO {m.group(1)}</span> {esc(titlecase(m.group(2)))}</h4>')
            return
        self.close_aside()
        self.emit(f'<h4>{esc(titlecase(text))}</h4>')
        if text == 'Sessão exemplar anotada':
            self.emit(arte('H-02', 'arte-meia'))

    def h5(self, text):
        self.close_aside()
        self.emit(f'<h5>{esc(titlecase(text))}</h5>')
        if text.strip().upper() == 'O TRILHO DE TRÊS CONVITES':
            self.emit(arte('S-10', 'arte-spot'))
            self.emit(TRILHO_SVG)

    def h6(self, text):
        self.close_aside()
        self.emit(f'<h6>{esc(text)}</h6>')

    # ---- corpo
    def para(self, text):
        self.corpo_desde_abertura = True
        if text == 'NOS BASTIDORES' or text.startswith('NOS BASTIDORES'):
            self.close_aside()
            self.in_aside = True
            self.emit(f'<aside class="bastidores"><div class="aside-label">{esc(text.title() if text == "NOS BASTIDORES" else text)}</div>')
            return
        m = DIALOGO_RE.match(text)
        if m:
            self.close_aside()
            speaker = m.group(1)
            rest = text[len(speaker):].lstrip(':').strip()
            self.emit(f'<p class="fala"><span class="quem">{speaker}</span> {fmt_inline(rest)}</p>')
            return
        if ARROW_RE.match(text.replace(' ', ' ')) and '→' in text:
            self.emit(f'<p class="diagrama">{esc(text)}</p>')
            return
        if text.startswith('Consolidado da versão anterior'):
            self.emit(f'<p class="nota-consolidacao">{esc(text)}</p>')
            return
        if text.count(' - ') >= 2:
            self.abre_cap = False
            head, *items = text.split(' - ')
            h = ''
            if head.strip():
                h += f'<p class="lista-intro">{fmt_inline(head.strip())}</p>'
            h += '<ul class="tracos">' + ''.join(f'<li>{fmt_inline(i.strip())}</li>' for i in items) + '</ul>'
            self.emit(h)
            return
        if self.abre_cap:
            self.abre_cap = False
            self.emit(f'<p class="abre">{fmt_inline(text)}</p>')
            return
        self.emit(f'<p>{fmt_inline(text)}</p>')

    # ---- laço principal
    def run(self):
        n = len(self.lines)
        while self.i < n:
            line = self.lines[self.i].rstrip()
            if line.startswith('|'):
                rows = []
                while self.i < n and self.lines[self.i].rstrip().startswith('|'):
                    r = self.lines[self.i].rstrip()
                    if set(r) - set('|-: '):
                        rows.append(r)
                    self.i += 1
                self.table_block(rows)
                continue
            self.i += 1
            if not line:
                continue
            if line.startswith('###### '):
                self.h6(line[7:])
            elif line.startswith('##### '):
                self.h5(line[6:])
            elif line.startswith('#### '):
                self.h4(line[5:])
            elif line.startswith('### '):
                self.h3(line[4:])
            elif line.startswith('## '):
                self.chapter(line[3:])
            elif line.startswith('# '):
                self.part(line[2:])
            else:
                self.para(line)
        self.fecha_capitulo()
        return ''.join(self.out)


def build_toc(toc):
    h = ['<nav class="toc"><div class="chap-kicker">DUALIS · LIVRO BÁSICO</div>',
         '<h2 class="toc-title">Sumário</h2>', REGUA, '<ul>']
    for kind, tid, kicker, title in toc:
        if kind == 'part':
            h.append(f'<li class="toc-part"><a href="#{tid}">'
                     f'<span class="toc-kicker">{esc(kicker)}</span> {esc(title)}'
                     f'<span class="toc-page"></span></a></li>')
        elif kind == 'chap':
            h.append(f'<li class="toc-chap"><a href="#{tid}">{esc(title)}'
                     f'<span class="toc-page"></span></a></li>')
    h.append('</ul></nav>')
    return ''.join(h)


def main():
    md = SRC.read_text(encoding='utf-8')
    lines = md.split('\n')

    # frontmatter: as 4 primeiras linhas (título, subtítulo, autor, versão)
    fm, body_start = [], 0
    for j, l in enumerate(lines):
        if l.startswith('# '):
            body_start = j
            break
        if l.strip():
            fm.append(l.strip())
    b = Builder(lines[body_start:])
    corpo = b.run()

    titulo, subtitulo, autor, versao = (fm + ['', '', '', ''])[:4]

    guardas_bg = f"background-image:url('{arte_src('A-03')}')"
    capa_pintada = any((FINAIS / f'A-01.{e}').exists() for e in ('png', 'jpg', 'jpeg', 'webp'))
    capa_texto = '' if capa_pintada else f'''
  <div class="capa-titulo">{esc(titulo)}</div>
  <div class="capa-sub">{esc(subtitulo)}</div>
  <div class="capa-rodape">{esc(autor)} · {esc(versao)}</div>'''
    capa = f'''
<section class="capa">
  <img class="capa-arte" src="{arte_src('A-01')}"/>{capa_texto}
</section>
<section class="guardas" style="{guardas_bg}"></section>
<section class="rosto">
  <div class="rosto-mid">
    {REGUA}
    <h1>{esc(titulo)}</h1>
    <p class="rosto-sub">{esc(subtitulo)}</p>
    <p class="rosto-autor">{esc(autor)}</p>
  </div>
  <p class="rosto-pe">{esc(versao)} · Diagramação conforme o Sistema Gráfico de Dualis</p>
</section>
<section class="frontis">
  <img src="{arte_src('B-00')}"/>
  <p class="frontis-legenda">O mapa de Iris termina exatamente ali.</p>
</section>'''

    quarta = f'''
<section class="guardas" style="{guardas_bg}"></section>
<section class="quarta">
  <div class="quarta-mid">
    <figure class="quarta-vinheta"><img src="{arte_src('A-02')}"/></figure>
    <p class="quarta-texto">Há uma porta diante de você. Talvez tenha uma chave. Talvez não.
    Pode escutar, procurar outra entrada, voltar pelo caminho de onde veio — ou abrir.
    Nenhuma dessas ações exige uma rolagem. Mas cada uma muda aquilo que poderá acontecer depois.</p>
    <p class="quarta-texto"><em>Dualis é um RPG sobre mundos que respondem às escolhas de quem os atravessa.</em></p>
    <div class="quarta-pergunta">O QUE VOCÊ FAZ?</div>
    {REGUA}
    <div class="quarta-marca">{esc(titulo)} · {esc(subtitulo)}</div>
  </div>
</section>'''

    css = (HERE / 'estilo.css').read_text(encoding='utf-8')
    doc = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Dualis · Livro Básico</title>
<style>{css}</style>
</head>
<body>
{capa}
{build_toc(b.toc)}
{corpo}
{quarta}
</body>
</html>'''
    OUT_HTML.write_text(doc, encoding='utf-8')
    print(f'HTML: {OUT_HTML} ({len(doc)//1024} KB)')

    if '--html-only' in sys.argv:
        return
    from weasyprint import HTML
    HTML(str(OUT_HTML)).write_pdf(str(OUT_PDF))
    print(f'PDF:  {OUT_PDF}')


if __name__ == '__main__':
    main()
