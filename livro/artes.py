#!/usr/bin/env python3
"""Artes do livro Dualis — 74 peças do Caderno de Arte, em vetor.

Estilo: tinta e aguada estilizadas. Grandes massas translúcidas (aguada) em
índigo, traço visível por cima, um acento de latão por peça (a luz), verde
oxidado raro. Sete regras do Caderno respeitadas: criatura não é pessoa,
sem rosto legível, sem sofrimento explícito, sem marcação de tipo físico,
o instante anterior, sem símbolos místicos, nada que sugira diagnóstico.
Todas as peças funcionam em preto e branco (valor tonal, não matiz).
"""
from urllib.parse import quote

PAPEL = '#E9E4D8'
IND = '#26364F'
LAT = '#A9762B'
VER = '#3C6B60'

_uid = [0]

def _id():
    _uid[0] += 1
    return f'g{_uid[0]}'

# ---------------------------------------------------------------- primitivas

def svg(body, w, h, defs=''):
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
         f'{"<defs>" + defs + "</defs>" if defs else ""}{body}</svg>')
    return s

def uri(s):
    return f'data:image/svg+xml,{quote(s)}'

import math

def _rnd(seed):
    """PRNG determinístico simples (0..1)."""
    x = math.sin(seed * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)

def mancha(cx, cy, rx, ry, color=IND, op=0.10, seed=1, pts=11):
    """Blob de aguada com borda irregular."""
    ang = [2 * math.pi * k / pts for k in range(pts)]
    rr = [(1 + 0.34 * (_rnd(seed + k) - 0.5) * 2) for k in range(pts)]
    xs = [cx + rx * rr[k] * math.cos(a) for k, a in enumerate(ang)]
    ys = [cy + ry * rr[k] * math.sin(a) for k, a in enumerate(ang)]
    d = f'M{xs[0]:.1f} {ys[0]:.1f}'
    for k in range(pts):
        j = (k + 1) % pts
        mx, my = (xs[k] + xs[j]) / 2, (ys[k] + ys[j]) / 2
        d += f' Q{xs[k]:.1f} {ys[k]:.1f} {mx:.1f} {my:.1f}'
    d += ' Z'
    return f'<path d="{d}" fill="{color}" fill-opacity="{op}"/>'

def grao(w, h, seed=3, n=150, color=IND, op=0.13):
    """Granulação de pigmento / textura de papel."""
    out = []
    for k in range(n):
        x = _rnd(seed + k * 2.1) * w
        y = _rnd(seed + k * 3.7 + 9) * h
        r = 0.4 + _rnd(seed + k * 5.3) * 0.8
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{color}" fill-opacity="{op}"/>')
    return ''.join(out)

def respingos(w, h, seed=7, n=9, color=IND, op=0.22):
    out = []
    for k in range(n):
        x = _rnd(seed + k * 11.3) * w
        y = _rnd(seed + k * 7.9 + 4) * h
        r = 1.0 + _rnd(seed + k * 3.1) * 1.8
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{color}" fill-opacity="{op}"/>')
    return ''.join(out)

def vinheta(w, h, color=IND):
    """Escurecimento das bordas, em camadas."""
    return (f'<rect x="0" y="0" width="{w}" height="{h}" fill="none" stroke="{color}"'
            f' stroke-width="{min(w,h)*0.16}" stroke-opacity="0.055"/>'
            f'<rect x="0" y="0" width="{w}" height="{h}" fill="none" stroke="{color}"'
            f' stroke-width="{min(w,h)*0.07}" stroke-opacity="0.07"/>'
            f'<rect x="0" y="0" width="{w}" height="{h}" fill="none" stroke="{color}"'
            f' stroke-width="{min(w,h)*0.025}" stroke-opacity="0.10"/>')

def lavagem(cx, cy, r, color=IND, op=0.16, achatada=1.0):
    """Lavagem suave: gradiente radial sem borda dura. Retorna (defs, corpo)."""
    i = _id()
    d = (f'<radialGradient id="{i}"><stop offset="0" stop-color="{color}" stop-opacity="{op}"/>'
         f'<stop offset="0.65" stop-color="{color}" stop-opacity="{op*0.55:.3f}"/>'
         f'<stop offset="1" stop-color="{color}" stop-opacity="0"/></radialGradient>')
    b = (f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*achatada:.1f}" fill="url(#{i})"/>')
    return d, b

def fundo_prato(w, h, seed=1, forca=1.0):
    """Atmosfera de aguada para as pranchas. Retorna (defs, corpo)."""
    o = lambda v: min(0.85, v * forca)
    j = lambda k, a, b: a + (_rnd(seed * 3.3 + k) * (b - a))
    defs, corpo = '', f'<rect width="{w}" height="{h}" fill="{IND}" fill-opacity="{o(0.06):.3f}"/>'
    manchas = [
        (j(1, 0.12, 0.32) * w, j(2, 0.08, 0.28) * h, 0.42 * w, o(0.14), 0.7),
        (j(3, 0.68, 0.92) * w, j(4, 0.14, 0.42) * h, 0.36 * w, o(0.11), 0.9),
        (0.5 * w, 1.02 * h, 0.55 * w, o(0.16), 0.45),
        (j(5, 0.3, 0.7) * w, j(6, 0.4, 0.7) * h, 0.5 * w, o(0.06), 0.8),
    ]
    for cx, cy, r, op, ach in manchas:
        d, b = lavagem(cx, cy, r, IND, op, ach)
        defs += d
        corpo += b
    corpo += mancha(w * j(7, 0.2, 0.8), h * j(8, 0.15, 0.5), w * 0.3, h * 0.24, IND, o(0.035), seed + 9)
    return defs, corpo

def prato(corpo, w, h, defs='', seed=None, forca=1.0):
    """Prancha completa: aguada de fundo + cena + granulação + vinheta."""
    if seed is None:
        seed = len(corpo) % 97
    fd, fb = fundo_prato(w, h, seed, forca)
    return svg(fb + corpo
               + grao(w, h, seed + 5, n=int(w * h / 620))
               + respingos(w, h, seed + 6)
               + vinheta(w, h), w, h, defs + fd)


def P(d, fill='none', stroke=None, w=1.6, op=None, dash=None, cap='round'):
    a = f'<path d="{d}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="round"'
    if op is not None:
        a += f' fill-opacity="{op}"' if fill != 'none' else f' stroke-opacity="{op}"'
    if dash:
        a += f' stroke-dasharray="{dash}"'
    return a + '/>'

def R(x, y, w, h, fill='none', stroke=None, sw=1.6, op=None, rx=0):
    a = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    if op is not None:
        a += f' fill-opacity="{op}"'
    return a + '/>'

def C(cx, cy, r, fill='none', stroke=None, sw=1.6, op=None, dash=None):
    a = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    if op is not None:
        a += f' fill-opacity="{op}"'
    if dash:
        a += f' stroke-dasharray="{dash}"'
    return a + '/>'

def E(cx, cy, rx, ry, fill='none', stroke=None, sw=1.6, op=None):
    a = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"'
    if stroke:
        a += f' stroke="{stroke}" stroke-width="{sw}"'
    if op is not None:
        a += f' fill-opacity="{op}"'
    return a + '/>'

def T(x, y, s, size=11, fill=IND, anchor='middle', font='Liberation Sans', ls=1.5, op=1):
    return (f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" '
            f'letter-spacing="{ls}" fill="{fill}" fill-opacity="{op}" text-anchor="{anchor}">{s}</text>')

def glow(cx, cy, r, color=LAT, op=0.55):
    """Halo de luz (lanterna, janela). Retorna (defs, corpo)."""
    i = _id()
    d = (f'<radialGradient id="{i}"><stop offset="0" stop-color="{color}" stop-opacity="{op}"/>'
         f'<stop offset="1" stop-color="{color}" stop-opacity="0"/></radialGradient>')
    return d, f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{i})"/>'

def ceu(w, h, top=IND, top_op=0.34, bot_op=0.04):
    """Aguada de céu, mais densa em cima."""
    i = _id()
    d = (f'<linearGradient id="{i}" x1="0" y1="0" x2="0" y2="1">'
         f'<stop offset="0" stop-color="{top}" stop-opacity="{top_op}"/>'
         f'<stop offset="1" stop-color="{top}" stop-opacity="{bot_op}"/></linearGradient>')
    return d, f'<rect width="{w}" height="{h}" fill="url(#{i})"/>'

def fig(x, y, h, color=IND, op=0.92):
    """Figura de costas, sem rosto: capa e cabeça."""
    hw = h * 0.17
    r = h * 0.095
    return (P(f'M{x-hw} {y} Q{x-hw*1.15} {y-h*0.52} {x-hw*0.5} {y-h*0.7} '
              f'Q{x} {y-h*0.78} {x+hw*0.5} {y-h*0.7} Q{x+hw*1.15} {y-h*0.52} {x+hw} {y} Z',
              fill=color, op=op)
            + C(x, y - h + r, r, fill=color, op=op))

def monte(cx, base, rx, ry, color=IND, op=0.18):
    return P(f'M{cx-rx} {base} Q{cx} {base-2*ry} {cx+rx} {base} Z', fill=color, op=op)

def chuva(x, y, w, h, n=14, color=IND, op=0.5):
    out = []
    for k in range(n):
        px = x + w * (k + 0.3) / n
        py = y + (k % 4) * h / 5
        out.append(P(f'M{px} {py} l-6 14', stroke=color, w=1.1, op=op))
    return ''.join(out)

def nevoa(y, w, h=26, op=0.55):
    return R(-4, y, w + 8, h, fill=PAPEL, op=op)

def hachura(x, y, w, h, gap=7, color=IND, op=0.35, sw=0.9):
    out = []
    k = 0
    while k * gap < w + h:
        x0 = x + k * gap
        out.append(P(f'M{min(x0, x+w)} {y + max(0, x0-(x+w))} L{x + max(0, x0-h)} {y + min(k*gap, h)}',
                     stroke=color, w=sw, op=op))
        k += 1
    return ''.join(out)

def porta(x, y, w, h, color=IND, sw=2, arco=False, aberta=0):
    """Porta simples; aberta=fração entreaberta (faixa escura)."""
    out = ''
    if arco:
        out += P(f'M{x} {y+h} V{y+w/2} A{w/2} {w/2} 0 0 1 {x+w} {y+w/2} V{y+h}',
                 stroke=color, w=sw)
    else:
        out += R(x, y, w, h, stroke=color, sw=sw)
    if aberta:
        out += R(x + w - w*aberta, y + (w/2 if arco else 2), w*aberta - 2,
                 h - (w/2 if arco else 4), fill=color, op=0.85)
    return out

def mesa_topo(x, y, w, h):
    """Tampo de mesa visto de cima."""
    return R(x, y, w, h, fill=IND, op=0.08) + R(x, y, w, h, stroke=IND, sw=1.8)

def moldura_mapa(x, y, w, h):
    return (R(x, y, w, h, stroke=IND, sw=1.6)
            + P(f'M{x+8} {y+8} h14 M{x+8} {y+8} v14', stroke=IND, w=1)
            + P(f'M{x+w-8} {y+h-8} h-14 M{x+w-8} {y+h-8} v-14', stroke=IND, w=1))

def rosa_ventos(cx, cy, r):
    return (C(cx, cy, r, stroke=IND, sw=1)
            + P(f'M{cx} {cy-r-6} L{cx+r*0.28} {cy} L{cx} {cy+r*0.7} L{cx-r*0.28} {cy} Z',
                fill=IND, op=0.8)
            + T(cx, cy - r - 10, 'N', 9, IND))

# ============================================================ LOTE C · criaturas
# retrato de meia página · viewBox 350 × 270

CW, CH = 350, 270

def _base_c():
    return R(0, 0, CW, CH, fill=IND, op=0.045)

def c01_vigia():
    """Sentinela de armadura sob um arco de pedra; capuz de muitos olhos,
    lanterna acesa numa mão, a outra aberta, oferecendo. Água parada aos pés."""
    d1, g1 = glow(150, 196, 52, LAT, 0.65)
    d2, g2 = glow(150, 196, 24, LAT, 0.9)
    corpo = (
        # parede de pedra à direita, arco à esquerda
        mancha(300, 130, 90, 160, IND, 0.22, 31)
        + P('M258 0 V270 M258 0 H350 V270', stroke=IND, w=0, cap='butt')
        + R(252, 0, 98, 270, fill=IND, op=0.16)
        + ''.join(P(f'M{262 + (k % 3) * 26} {18 + k * 24} h{18 + (k % 2) * 8}',
                    stroke=IND, w=1, op=0.35) for k in range(10))
        + P('M64 270 V96 Q64 10 170 6', stroke=IND, w=3.4)
        + P('M50 270 V98 Q50 -2 170 -8', stroke=IND, w=2)
        + P('M50 270 V98 Q50 -2 170 -8 L170 6 Q64 10 64 96 L64 270 Z', fill=IND, op=0.30)
        + mancha(30, 60, 70, 90, IND, 0.28, 32)
        + hachura(0, 0, 64, 270, gap=9, op=0.18)
        # muralha distante com torre, sob céu de aguada
        + P('M0 208 h44 M8 208 v-26 h20 v26', stroke=IND, w=1.4, op=0.55)
        + P('M18 182 q4 -10 10 -12 q6 2 8 12', stroke=IND, w=1.2, op=0.55)
        # ÁGUA parada aos pés
        + R(0, 244, 350, 26, fill=IND, op=0.20)
        + P('M12 250 h44 M70 256 h60 M210 252 h52 M290 260 h40', stroke=PAPEL, w=1, op=0.5)
        # ------------- a criatura -------------
        # capa e saiote
        + P('M186 244 L180 150 Q176 120 186 108 L226 108 Q238 122 232 152 L228 244 '
            'Q206 252 186 244 Z', fill=IND, op=0.88)
        + P('M228 150 Q252 176 246 244 L228 236', fill=IND, op=0.5)      # capa às costas
        + P('M186 176 h44 M188 190 h42', stroke=PAPEL, w=1, op=0.35)     # placas do saiote
        # couraça com rebites
        + P('M184 116 Q206 104 230 116 L232 152 Q206 162 182 152 Z', fill=IND, op=0.95)
        + P('M184 116 Q206 104 230 116 L232 152 Q206 162 182 152 Z', stroke=IND, w=1.6)
        + P('M190 124 Q206 116 224 124 M188 136 Q206 128 226 136', stroke=PAPEL, w=1, op=0.45)
        + ''.join(C(190 + k * 8, 148 - (k % 2) * 3, 0.9, fill=PAPEL, op=0.7) for k in range(6))
        # cinto e bolsa
        + P('M184 152 Q206 162 232 152', stroke=LAT, w=2.4, op=0.8)
        + P('M222 158 q10 2 10 12 q-6 4 -12 0 Z', fill=IND, op=0.95)
        + C(227, 164, 1.1, fill=LAT, op=0.9)
        # botas na água
        + P('M196 244 v14 M220 244 v14', stroke=IND, w=7)
        + E(196, 261, 9, 3, fill=IND, op=0.9) + E(220, 261, 9, 3, fill=IND, op=0.9)
        # braço com a lanterna
        + P('M188 122 Q168 138 162 168', stroke=IND, w=7)
        + P('M162 168 q-4 6 -12 6', stroke=IND, w=4)
        + g1 + g2
        + P('M150 174 v6', stroke=IND, w=1.6)
        + P('M141 182 h18 l-3 26 h-12 Z', stroke=IND, w=1.8)
        + P('M141 182 q9 -8 18 0', stroke=IND, w=1.6)
        + R(145, 187, 10, 16, fill=LAT, op=0.85)
        + C(150, 195, 3, fill=PAPEL, op=0.9)
        + E(150, 246, 26, 5, fill=LAT, op=0.25)                          # luz na água
        # braço oferecido, mão aberta
        + P('M228 122 Q258 128 278 142', stroke=IND, w=7)
        + P('M278 142 q10 4 14 10 m-14 -10 q12 0 18 4 m-18 -4 q8 8 8 14',
            stroke=IND, w=2.6)
        # cabeça encapuzada, constelação de olhos (sem rosto humano)
        + P('M192 108 Q188 76 206 68 Q226 66 228 92 Q229 104 224 108 Z', fill=IND, op=0.96)
        + P('M192 108 Q188 76 206 68 Q226 66 228 92 Q229 104 224 108 Z', stroke=IND, w=1.4)
        # olhos: elipses com pupila, apontando para direções diferentes
        + E(201, 82, 3.6, 2.3, fill=PAPEL, op=0.92) + C(202, 82, 1, fill=IND)
        + E(212, 76, 3.4, 2.2, fill=PAPEL, op=0.92) + C(211, 76, 1, fill=IND)
        + E(220, 86, 3.2, 2.1, fill=PAPEL, op=0.92) + C(221, 86, 0.9, fill=IND)
        + E(206, 94, 3.4, 2.2, fill=PAPEL, op=0.92) + C(205, 94, 1, fill=IND)
        + E(216, 99, 3, 2, fill=PAPEL, op=0.92) + C(217, 99, 0.9, fill=IND)
        + E(197, 99, 2.7, 1.8, fill=PAPEL, op=0.85) + C(196, 99, 0.8, fill=IND)
        + E(224, 76, 2.5, 1.7, fill=PAPEL, op=0.8) + C(224, 76, 0.8, fill=IND)
        # gotejar de chuva fina junto ao arco
        + chuva(60, 30, 90, 40, 8, IND, 0.35)
    )
    return prato(corpo, CW, CH, d1 + d2, seed=17, forca=1.25)

def c02_estrategista():
    corpo = (
        _base_c()
        # sala vista de cima: paredes como ombros, porta como boca
        + P('M60 250 V80 Q60 44 106 40 L244 40 Q290 44 290 80 V250', stroke=IND, w=2.4)
        + P('M60 250 V80 Q60 44 106 40 L244 40 Q290 44 290 80 V250 Z', fill=IND, op=0.07)
        + R(160, 236, 30, 14, stroke=IND, sw=1.8)           # porta-boca
        # mapa grande na mesa central
        + R(105, 96, 140, 108, fill=PAPEL, op=0.9) + R(105, 96, 140, 108, stroke=IND, sw=1.6)
        + P('M105 132 q40 -8 70 4 t70 -6', stroke=IND, w=1)
        + P('M124 96 v108 M188 96 v108', stroke=IND, w=0.7, op=0.5)
        + P('M105 170 h140', stroke=IND, w=0.7, op=0.5)
        # peças de madeira: nenhuma figura humana no mapa; uma peça caída
        + C(146, 120, 6, fill=IND, op=0.85) + C(206, 148, 6, fill=IND, op=0.85)
        + C(170, 186, 6, fill=IND, op=0.85)
        + E(226, 191, 7, 4, fill=LAT, op=0.9)               # a peça caída, em latão
        + P('M226 187 v-3', stroke=LAT, w=1.2)
        + hachura(60, 40, 46, 40, gap=8, op=0.2) + hachura(244, 40, 46, 40, gap=8, op=0.2)
    )
    return prato(corpo, CW, CH)

def c03_rastreador():
    corpo = (
        _base_c()
        # interior de taverna: mesas ao fundo
        + R(20, 190, 90, 40, fill=IND, op=0.10) + R(240, 196, 88, 36, fill=IND, op=0.10)
        + P('M0 250 h350', stroke=IND, w=1.2, op=0.4)
        # grupo que conversa (siluetas, sem rosto)
        + fig(96, 236, 84, op=0.8) + fig(128, 240, 92, op=0.85) + fig(160, 236, 80, op=0.8)
        # a criatura: magra, curvada, quase transparente, três passos atrás
        + P('M262 246 Q252 200 262 176 Q270 158 278 176 Q286 200 280 246 Z',
            fill=IND, op=0.22)
        + C(270, 166, 9, fill=IND, op=0.22)
        # superfícies polidas no lugar dos olhos, refletindo quem está à frente
        + E(266, 164, 3.4, 4.4, fill=PAPEL, op=0.95) + E(275, 164, 3.4, 4.4, fill=PAPEL, op=0.95)
        + P('M264 163 q2 -2 4 0 M273 163 q2 -2 4 0', stroke=IND, w=0.8, op=0.7)
        + nevoa(246, CW, 16, 0.35)
    )
    return prato(corpo, CW, CH)

def c04_guardiao():
    corpo = (
        _base_c()
        + porta(120, 60, 110, 190, arco=True, sw=2.2)
        + hachura(120, 60, 110, 60, gap=9, op=0.15)
        # corpo pesado, de costas para a porta, de frente para nós; braços abertos, sem arma
        + P('M175 128 Q130 140 128 220 L138 250 H212 L222 220 Q220 140 175 128 Z',
            fill=IND, op=0.9)
        + C(175, 116, 15, fill=IND, op=0.9)
        + P('M136 160 L86 176 M214 160 L264 176', stroke=IND, w=7, cap='round')
        # marca antiga de pancada no peito, bordas enferrujadas
        + C(175, 176, 9, stroke=PAPEL, sw=1.6) + C(175, 176, 9, stroke=LAT, sw=1)
        + P('M170 172 l10 8 M180 172 l-10 8', stroke=LAT, w=1.2)
        + P('M100 250 h150', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH)

def c05_adiador():
    corpo = (
        _base_c()
        # janela ao fundo: o dia inteiro passando em faixas
        + R(236, 52, 76, 74, stroke=IND, sw=1.8)
        + R(236, 52, 76, 18, fill=LAT, op=0.5) + R(236, 70, 76, 18, fill=LAT, op=0.28)
        + R(236, 88, 76, 20, fill=IND, op=0.18) + R(236, 108, 76, 18, fill=IND, op=0.4)
        # relógio de ponteiros parados
        + C(80, 78, 22, stroke=IND, sw=1.8) + P('M80 78 v-13 M80 78 h9', stroke=IND, w=1.6)
        + C(80, 78, 2, fill=IND)
        # balcão
        + P('M30 176 H320 V250 H30 Z', fill=IND, op=0.12) + P('M30 176 H320', stroke=IND, w=2.2)
        # funcionário atrás do balcão (de costas ao observador? não: sem rosto, meio corpo)
        + fig(150, 176, 96, op=0.85)
        # pilha de papéis que sai do quadro
        + ''.join(R(212 + (k % 3) * 2, 168 - k * 9, 64, 9, fill=PAPEL, op=0.95) +
                  R(212 + (k % 3) * 2, 168 - k * 9, 64, 9, stroke=IND, sw=0.9)
                  for k in range(14))
    )
    return prato(corpo, CW, CH)

def c06_eremita():
    d1, g1 = glow(214, 96, 42)
    corpo = (
        _base_c()
        + monte(70, 270, 160, 60, op=0.12)
        # casa de pedra sem porta, janela alta iluminada
        + P('M120 250 V110 L175 70 L230 110 V250 Z', fill=IND, op=0.14)
        + P('M120 250 V110 L175 70 L230 110 V250', stroke=IND, w=2.2)
        + hachura(120, 110, 110, 50, gap=11, op=0.16)
        + g1 + R(202, 84, 24, 26, fill=LAT, op=0.55) + R(202, 84, 24, 26, stroke=IND, sw=1.6)
        # sombra sem traços na janela
        + P('M208 110 q6 -14 12 0 Z', fill=IND, op=0.5)
        # gente passando na rua, em silhueta
        + fig(46, 252, 54, op=0.35) + fig(76, 254, 60, op=0.4) + fig(296, 252, 58, op=0.38)
        + P('M0 254 h350', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH, d1)

def c07_juiz():
    corpo = (
        _base_c()
        # tribunal vazio visto do banco do réu; cadeira alta ocupada por figura sem rosto
        + P('M40 250 L80 120 H270 L310 250', stroke=IND, w=1.4, op=0.5)
        + R(130, 70, 90, 120, fill=IND, op=0.10)
        + R(148, 60, 54, 96, stroke=IND, sw=2)                       # espaldar alto
        + P('M148 156 h54 M156 156 v34 M194 156 v34', stroke=IND, w=2)
        + P('M160 118 Q175 106 190 118 L192 150 H158 Z', fill=IND, op=0.9)  # túnica
        + C(175, 104, 11, fill=IND, op=0.9)                          # cabeça sem rosto
        # mesa vazia: nenhum papel
        + P('M120 196 H230 L238 214 H112 Z', fill=IND, op=0.14)
        + P('M112 214 H238', stroke=IND, w=1.8)
        + nevoa(230, CW, 22, 0.3)
    )
    return prato(corpo, CW, CH)

def c08_carrasco():
    corpo = (
        _base_c()
        + hachura(0, 0, 350, 46, gap=12, op=0.1)
        # figura encapuzada de costas; capuz solto: não há ninguém dentro
        + P('M175 92 Q120 116 128 210 L136 250 H214 L222 210 Q230 116 175 92 Z',
            fill=IND, op=0.9)
        + P('M156 96 Q175 70 194 96 Q186 108 175 108 Q164 108 156 96 Z', fill=IND, op=0.9)
        + E(175, 100, 9, 6, fill=PAPEL, op=0.9)                      # o vazio dentro do capuz
        # machado apoiado no chão, lâmina voltada para si
        + P('M258 250 V150', stroke=IND, w=2.6)
        + P('M258 150 Q236 158 240 182 Q252 174 258 176 Z', fill=IND, op=0.85)
        + P('M60 250 h230', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH)

def c09_artesao():
    corpo = (
        _base_c()
        # prateleiras com peças quase prontas, com poeira
        + P('M24 60 h120 M24 110 h120 M24 160 h120', stroke=IND, w=1.8)
        + ''.join(R(30 + k * 26, y - 20, 18, 20, stroke=IND, sw=1.2)
                  for k in range(4) for y in (60, 110, 160))
        + ''.join(P(f'M{32 + k * 26} {y - 23} h14', stroke=IND, w=0.8, op=0.4)
                  for k in range(4) for y in (60, 110, 160))          # poeira
        # bancada com objeto belíssimo sendo desmontado
        + P('M180 196 H330 V250 H180 Z', fill=IND, op=0.12) + P('M180 196 H330', stroke=IND, w=2.2)
        + E(255, 178, 30, 16, stroke=IND, sw=2)
        + P('M234 168 q21 -18 42 0', stroke=LAT, w=1.6)
        + P('M287 176 l26 -12 M279 188 l30 4', stroke=IND, w=1.4)     # peças saindo
        + C(318, 160, 5, stroke=IND, sw=1.4) + C(313, 194, 4, stroke=IND, sw=1.4)
        # mãos de trabalho (só mãos, sem pessoa)
        + P('M214 196 q-6 -12 4 -16 M300 196 q8 -10 -2 -16', stroke=IND, w=2)
    )
    return prato(corpo, CW, CH)

def c10_camaleao():
    corpo = (
        _base_c()
        # três grupos, sem divisória; a figura central muda de tom em cada terço
        + fig(52, 246, 74, op=0.45) + fig(80, 250, 80, op=0.5)
        + fig(270, 246, 74, op=0.45) + fig(298, 250, 80, op=0.5)
        + fig(160, 250, 70, op=0.4) + fig(196, 250, 70, op=0.4)
        # a criatura: mesma silhueta, três tratamentos
        + P('M175 250 Q160 190 164 160 Q175 148 186 160 Q190 190 175 250 Z', fill=IND, op=0.85)
        + P('M175 250 Q160 190 164 160 L175 154 V250 Z', fill=VER, op=0.5)
        + P('M186 160 Q190 190 175 250 V154 Q182 154 186 160 Z', fill=LAT, op=0.45)
        + C(175, 142, 11, fill=IND, op=0.75)
        + C(175, 142, 11, stroke=IND, sw=1.2)
    )
    return prato(corpo, CW, CH)

def c11_ator():
    d1, g1 = glow(175, 96, 74, LAT, 0.5)
    corpo = (
        _base_c()
        # palco e foco de luz
        + P('M40 250 H310', stroke=IND, w=2.2)
        + P('M120 250 L175 64 L230 250', stroke=LAT, w=1, op=0.5)
        + g1
        # figura impecável em cena
        + P('M175 130 Q152 140 154 200 L160 250 H190 L196 200 Q198 140 175 130 Z', fill=IND, op=0.92)
        + C(175, 118, 12, fill=IND, op=0.92)
        + P('M167 146 l8 10 8 -10', stroke=PAPEL, w=1.4)              # lapela
        # plateia de cadeiras vazias
        + ''.join(R(34 + k * 40, 216 + (k % 2) * 4, 20, 26, stroke=IND, sw=1.2, op=0.7)
                  for k in range(3))
        + ''.join(R(258 + k * 40, 216 + (k % 2) * 4, 20, 26, stroke=IND, sw=1.2, op=0.7)
                  for k in range(2))
        # bastidores: fresta com figurinos idênticos
        + R(298, 60, 40, 130, fill=IND, op=0.15)
        + ''.join(P(f'M{306 + k * 9} 74 q4 10 0 104', stroke=IND, w=1.2, op=0.7) for k in range(4))
    )
    return prato(corpo, CW, CH, d1)

def c12_herdeiro():
    corpo = (
        _base_c()
        # sala de retratos: todos com o mesmo casaco
        + ''.join(R(28 + k * 64, 48, 44, 58, stroke=IND, sw=1.6) +
                  P(f'M{40 + k * 64} 100 Q{50 + k * 64} 78 {60 + k * 64} 100 Z', fill=IND, op=0.5) +
                  C(50 + k * 64, 72, 7, fill=IND, op=0.5)
                  for k in range(5))
        # porta aberta ao fundo para um campo, e ninguém olha para ela
        + porta(296, 128, 40, 122, sw=1.8)
        + R(300, 132, 32, 114, fill=VER, op=0.30)
        + P('M300 210 q16 -10 32 0', stroke=VER, w=1.2)
        # jovem com casaco grande demais e brasão
        + P('M150 250 L146 160 Q150 138 172 136 Q194 138 198 160 L194 250 Z', fill=IND, op=0.9)
        + P('M146 168 l-10 34 M198 168 l10 34', stroke=IND, w=5)      # mangas longas demais
        + C(172, 124, 12, fill=IND, op=0.9)
        + P('M164 160 l8 12 8 -12 v16 h-16 Z', fill=LAT, op=0.85)     # brasão que não escolheu
        + P('M60 250 h240', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH)

def c13_oraculo():
    corpo = (
        _base_c()
        # entrada aberta atrás, com alguém chegando
        + porta(36, 70, 62, 180, arco=True, sw=1.8)
        + fig(67, 244, 66, op=0.35)
        # figura sentada de costas para a entrada
        + P('M210 250 Q198 196 210 178 Q222 164 234 178 Q246 196 234 250 Z', fill=IND, op=0.9)
        + C(222, 166, 11, fill=IND, op=0.9)
        # bacia de água absolutamente parada, reflexo que não corresponde
        + E(222, 236, 58, 14, stroke=IND, sw=2)
        + E(222, 236, 46, 9, fill=IND, op=0.12)
        + P('M196 234 q10 -12 20 0 M226 236 l16 -10 m-6 10 l10 -6', stroke=LAT, w=1.3)
        + nevoa(140, CW, 18, 0.3)
    )
    return prato(corpo, CW, CH)

def c14_leitor():
    corpo = (
        _base_c()
        + mesa_topo(40, 50, 270, 170)
        # objetos comuns dispostos como oráculo
        + P('M84 96 q6 -14 22 -10 q10 2 8 14 l-6 18 q-14 4 -22 -6 Z', stroke=IND, w=1.6)  # luva
        + P('M90 100 l4 12 m4 -14 l4 14 m4 -16 l3 15', stroke=IND, w=1.1)
        + R(196, 84, 40, 26, stroke=IND, sw=1.6) + P('M196 97 h40', stroke=IND, w=1)      # bilhete
        + C(150, 168, 17, stroke=IND, sw=1.8) + P('M167 168 q10 -3 8 6', stroke=IND, w=1.4)  # xícara
        + E(150, 168, 10, 6, fill=IND, op=0.3)
        + C(256, 158, 9, stroke=IND, sw=1.4)                                                # botão
        # linhas finas ligando os objetos: um desenho que quase faz sentido
        + P('M106 104 L196 96 M216 110 L256 152 M150 150 L118 112 M162 156 L200 108',
            stroke=LAT, w=0.9, dash='5 4')
        + C(106, 104, 2, fill=LAT) + C(216, 110, 2, fill=LAT) + C(150, 150, 2, fill=LAT)
    )
    return prato(corpo, CW, CH)

def c15_pressagio():
    d1, g1 = ceu(CW, CH, IND, 0.10, 0.02)
    corpo = (
        g1
        # paisagem tranquila ao entardecer
        + monte(90, 250, 170, 46, op=0.16) + monte(280, 250, 180, 56, op=0.20)
        + P('M0 250 h350', stroke=IND, w=1.4)
        + R(150, 216, 26, 34, stroke=IND, sw=1.4) + P('M150 216 l13 -12 13 12', stroke=IND, w=1.4)
        + R(160, 232, 8, 18, fill=IND, op=0.5)
        + P('M40 250 q30 -8 60 0 M240 250 q30 -8 70 0', stroke=VER, w=1.1, op=0.6)
        # faixa de escuridão sem forma no céu, que não projeta sombra
        + P('M30 74 Q120 52 210 66 Q290 76 330 60 Q300 92 210 88 Q110 94 30 74 Z',
            fill=IND, op=0.55)
    )
    return prato(corpo, CW, CH, d1)

def c16_colecionador():
    corpo = (
        _base_c()
        # corredor estreitado pelo acúmulo; tudo limpo e guardado
        + P('M40 250 V60 M310 250 V60', stroke=IND, w=1.8)
        + ''.join(R(48, 226 - k * 34, 74 - k * 4, 30, stroke=IND, sw=1.4) for k in range(5))
        + ''.join(R(232 + k * 3, 226 - k * 34, 70 - k * 4, 30, stroke=IND, sw=1.4) for k in range(5))
        + ''.join(P(f'M52 {238 - k * 34} h20', stroke=IND, w=0.9, op=0.6) for k in range(5))
        + C(96, 216, 6, stroke=IND, sw=1.1) + E(262, 148, 10, 5, stroke=IND, sw=1.1)
        # cadeira de visita completamente bloqueada
        + R(150, 196, 30, 40, stroke=IND, sw=1.6) + P('M150 196 v-20 h30 v20', stroke=IND, w=1.6)
        + R(136, 216, 24, 22, fill=IND, op=0.25) + R(174, 210, 26, 28, fill=IND, op=0.25)
        + R(154, 172, 24, 16, fill=IND, op=0.25)
        + P('M60 250 h230', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH)

def c17_inventariante():
    corpo = (
        _base_c()
        # escrivão magro e alto
        + P('M120 250 Q112 170 120 130 Q126 108 138 106 Q150 108 152 128 L156 250 Z',
            fill=IND, op=0.9)
        + C(137, 96, 10, fill=IND, op=0.9)
        + P('M152 150 l30 -8', stroke=IND, w=4)
        # livro grosso apoiado no braço; uma única coluna que desce até o chão
        + P('M182 118 L242 108 L246 152 L186 162 Z', fill=PAPEL, op=0.95)
        + P('M182 118 L242 108 L246 152 L186 162 Z', stroke=IND, w=1.8)
        + P('M214 113 L218 157', stroke=IND, w=1)                     # lombada da página dupla
        + ''.join(P(f'M191 {126 + k * 7} l18 -2', stroke=IND, w=0.9) for k in range(5))
        # a coluna se estende para fora do livro, descendo até o chão
        + R(224, 152, 16, 98, fill=PAPEL, op=0.95) + R(224, 152, 16, 98, stroke=IND, sw=1.4)
        + ''.join(P(f'M227 {162 + k * 9} h10', stroke=IND, w=0.9) for k in range(9))
        + P('M60 250 h230', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH)

def c18_contabilista():
    corpo = (
        _base_c()
        + mesa_topo(30, 130, 290, 100)
        # duas mãos da mesma pessoa (que não aparece): uma entrega o pão, outra anota
        + P('M96 130 Q80 96 100 84 Q112 78 120 92 L128 122', stroke=IND, w=2)
        + E(132, 152, 26, 14, fill=LAT, op=0.6) + E(132, 152, 26, 14, stroke=IND, sw=1.6)
        + P('M114 150 q18 -8 36 0', stroke=IND, w=1)                  # pão
        + P('M250 130 Q268 100 252 88 Q240 80 232 96 L228 120', stroke=IND, w=2)
        + R(216, 140, 60, 40, fill=PAPEL, op=0.95) + R(216, 140, 60, 40, stroke=IND, sw=1.4)
        + P('M246 140 v40', stroke=IND, w=1)
        + ''.join(P(f'M222 {148 + k * 8} h18 M252 {148 + k * 8} h18', stroke=IND, w=0.8) for k in range(4))
        # balança de mesa com um lado sempre mais baixo
        + P('M175 226 v-32 M151 194 h48', stroke=IND, w=1.8)
        + P('M151 194 l-7 14 h14 Z', fill=IND, op=0.7)
        + P('M199 194 l-7 20 h14 Z', fill=IND, op=0.7)
    )
    return prato(corpo, CW, CH)

def c19_devedor():
    corpo = (
        _base_c()
        + P('M0 250 h350', stroke=IND, w=1.4)
        # a pessoa à frente, que não sabe que ela está ali
        + fig(120, 246, 110, op=0.85)
        # a criatura um passo atrás, olhando o chão, com embrulhos de outra pessoa
        + P('M226 246 Q216 200 224 178 Q230 164 240 172 Q250 186 246 246 Z', fill=IND, op=0.75)
        + C(236, 164, 9, fill=IND, op=0.75)
        + P('M236 156 q-4 3 -3 8', stroke=IND, w=1, op=0)             # cabeça baixa (sugestão)
        + R(250, 176, 26, 20, stroke=IND, sw=1.4) + R(256, 154, 22, 18, stroke=IND, sw=1.4)
        + R(248, 200, 30, 22, stroke=IND, sw=1.4)
        + P('M250 186 h26 M256 163 h22 M248 211 h30', stroke=IND, w=0.8, op=0.6)
    )
    return prato(corpo, CW, CH)

def c20_salvador():
    corpo = (
        _base_c()
        # água na altura da cintura
        + R(0, 196, 350, 74, fill=IND, op=0.18)
        + P('M0 196 q30 6 60 0 t60 0 t60 0 t60 0 t60 0 t60 0', stroke=IND, w=1.4, op=0.7)
        # figura de braços cheios, três volumes, estendendo a mão para um quarto
        + P('M160 208 Q142 160 160 140 Q172 128 184 140 Q198 160 188 208 Z', fill=IND, op=0.9)
        + C(172, 128, 11, fill=IND, op=0.9)
        + R(142, 138, 24, 18, stroke=IND, sw=1.6) + R(166, 124, 22, 16, stroke=IND, sw=1.6)
        + R(150, 158, 26, 18, stroke=IND, sw=1.6)
        + P('M188 152 L226 142', stroke=IND, w=2.4)
        + R(228, 128, 22, 18, stroke=LAT, sw=1.8)                     # o quarto volume
        # atrás, no seco, três pessoas capazes, olhando
        + fig(288, 196, 62, op=0.5) + fig(312, 198, 66, op=0.55) + fig(334, 196, 58, op=0.5)
    )
    return prato(corpo, CW, CH)

def c21_abandonado():
    d1, g1 = glow(232, 148, 40, LAT, 0.5)
    corpo = (
        _base_c()
        + hachura(0, 0, 350, 60, gap=12, op=0.12)                     # noite
        # porta entreaberta com luz dentro
        + porta(206, 96, 60, 154, sw=2, aberta=0.22)
        + g1 + R(214, 100, 12, 146, fill=LAT, op=0.5)
        # degraus de pedra
        + P('M60 250 H206 M74 232 H206 M90 214 H206', stroke=IND, w=1.8)
        # criança sentada, casaco de adulto sobre os ombros; não chora e não chama
        + P('M128 214 Q120 186 132 176 Q142 170 150 178 Q158 188 152 214 Z', fill=IND, op=0.9)
        + P('M124 190 Q118 200 122 214 M156 188 Q162 200 158 214', stroke=IND, w=2.4)  # casaco largo
        + C(140, 168, 8.5, fill=IND, op=0.9)
        # rua vazia à frente
        + P('M0 250 h350', stroke=IND, w=1.4)
    )
    return prato(corpo, CW, CH, d1)

def c22_duplo():
    corpo = (
        _base_c()
        # superfície refletora alta encostada na parede
        + P('M96 40 L254 40 L242 250 L108 250 Z', stroke=IND, w=2.2)
        + P('M96 40 L254 40 L242 250 L108 250 Z', fill=IND, op=0.06)
        + P('M112 56 L134 234', stroke=PAPEL, w=5, op=0.8)            # brilho
        # o reflexo mostra a mesma sala com uma pessoa a mais, melhor iluminada
        + R(124, 64, 104, 172, fill=IND, op=0.05)
        + P('M136 210 h84', stroke=IND, w=1.2, op=0.6)                # linha da sala refletida
        + R(196, 90, 24, 36, stroke=IND, sw=1.2, op=0.7)              # janela refletida
        + fig(178, 208, 92, op=0.8)
        + P('M178 116 m-14 0', stroke=LAT, w=0)  # (âncora)
        + C(178, 124, 12, stroke=LAT, sw=1.2)                          # levemente melhor iluminada
        # quem se olha não aparece no quadro
        + nevoa(238, CW, 32, 0.25)
    )
    return prato(corpo, CW, CH)

def c23_invisivel():
    corpo = (
        _base_c()
        # mesa de refeição com seis lugares e cinco pessoas
        + E(175, 190, 130, 44, fill=IND, op=0.10) + E(175, 190, 130, 44, stroke=IND, sw=1.8)
        + fig(80, 172, 62, op=0.8) + fig(140, 158, 60, op=0.8) + fig(210, 158, 60, op=0.8)
        + fig(270, 172, 62, op=0.8) + fig(120, 236, 64, op=0.85)
        # o sexto lugar: prato usado, talher no lugar, cadeira afastada; ninguém olha
        + C(238, 226, 15, stroke=IND, sw=1.4) + C(238, 226, 9, stroke=IND, sw=0.8, dash='2 3')
        + P('M258 216 v22 M263 216 v22', stroke=IND, w=1.2)
        + R(226, 252, 26, 14, stroke=IND, sw=1.4)                     # cadeira afastada
    )
    return prato(corpo, CW, CH)

def c24_silenciador():
    corpo = (
        _base_c()
        # meio corpo, fundo neutro; mão gentil sobre a própria boca, pulso relaxado
        + P('M175 270 L165 190 Q150 150 175 138 Q200 150 190 190 L185 270',
            fill=IND, op=0.14)
        + P('M175 270 L165 190 Q150 150 175 138 Q200 150 190 190 L185 270 Z',
            fill='none', stroke=IND, w=0)
        + C(175, 116, 26, fill=IND, op=0.14) + C(175, 116, 26, stroke=IND, sw=2)
        # sem traços de rosto; apenas a mão
        + P('M150 128 Q158 120 170 124 L188 130 Q196 134 192 140 Q186 146 174 142 L156 136 Q148 132 150 128 Z',
            fill=PAPEL, op=0.95)
        + P('M150 128 Q158 120 170 124 L188 130 Q196 134 192 140 Q186 146 174 142 L156 136 Q148 132 150 128 Z',
            stroke=IND, w=1.8)
        + P('M162 130 l16 5 M160 134 l14 4', stroke=IND, w=0.9, op=0.7)
        + P('M192 140 Q206 152 204 170', stroke=IND, w=2)              # pulso relaxado
    )
    return prato(corpo, CW, CH)

# ============================================================ LOTE E · spots
SW_, SH_ = 320, 180

def s02_cena():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        + mesa_topo(24, 18, 272, 144)
        + R(60, 44, 58, 40, fill=PAPEL, op=0.9) + R(60, 44, 58, 40, stroke=IND, sw=1.2)
        + P('M66 56 h44 M66 66 h36 M66 76 h40', stroke=IND, w=0.8, op=0.6)
        + R(206, 96, 52, 36, fill=PAPEL, op=0.9) + R(206, 96, 52, 36, stroke=IND, sw=1.2)
        + C(160, 130, 13, stroke=IND, sw=1.2) + E(160, 133, 8, 3, fill=IND, op=0.3)  # copo
        + R(140, 60, 15, 15, stroke=IND, sw=1.6, rx=3) + R(162, 68, 15, 15, stroke=IND, sw=1.6, rx=3)
        + C(147, 67, 1.6, fill=IND) + C(169, 75, 1.6, fill=IND) + C(165, 71, 1.6, fill=IND)
        + C(173, 79, 1.6, fill=IND)
        # mãos nas bordas, sem rostos
        + P('M24 96 q14 -6 24 4 M296 70 q-14 -6 -24 4', stroke=IND, w=2)
    )
    return svg(corpo, SW_, SH_)

def s03_contexto():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.08)
        + R(20, 16, 280, 148, stroke=IND, sw=2)
        # todas as saídas visíveis, nenhuma boa
        + porta(34, 52, 34, 76, sw=1.6) + hachura(34, 52, 34, 76, gap=7, op=0.3)
        + porta(252, 52, 34, 76, sw=1.6) + P('M252 90 h34', stroke=IND, w=5)
        + porta(142, 16, 38, 42, sw=1.6) + P('M146 22 l30 30 M176 22 l-30 30', stroke=IND, w=1.4)
        + fig(160, 140, 62, op=0.9)
    )
    return svg(corpo, SW_, SH_)

def s04_zona():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # mão a centímetros da maçaneta, e nada mais
        + P('M208 20 V160', stroke=IND, w=2.4)
        + C(196, 92, 7, stroke=IND, sw=2)
        + P('M60 104 Q96 84 128 92 Q160 100 172 96 Q178 94 182 93',
            stroke=IND, w=2.2)
        + P('M96 116 Q130 104 162 106 M100 92 Q120 78 148 84', stroke=IND, w=1.4, op=0.7)
        + P('M182 93 q4 -1 6 -1', stroke=IND, w=2, dash='2 4')
    )
    return svg(corpo, SW_, SH_)

def s05_resposta():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.06)
        # pedra caindo num lago já em movimento
        + E(160, 110, 130, 44, stroke=IND, sw=1.2, op=0.5)
        + E(160, 110, 96, 32, stroke=IND, sw=1.3, op=0.7)
        + E(120, 122, 60, 18, stroke=IND, sw=1.2, op=0.8)   # anéis antigos, deformados
        + E(206, 120, 44, 13, stroke=IND, sw=1.2, op=0.8)
        + C(160, 44, 8, fill=IND, op=0.9)
        + P('M160 56 v34', stroke=IND, w=1.2, dash='3 4')
        + E(160, 104, 14, 4, stroke=LAT, sw=1.6)
    )
    return svg(corpo, SW_, SH_)

def s06_ecos():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # gaveta de outra pessoa, objeto guardado junto de coisas sem relação
        + R(40, 40, 240, 100, stroke=IND, sw=2) + C(160, 52, 4, fill=IND)
        + P('M40 60 h240', stroke=IND, w=1.2)
        + R(60, 76, 44, 30, stroke=IND, sw=1.2) + E(200, 96, 24, 12, stroke=IND, sw=1.2)
        + P('M240 76 l24 28 m0 -28 l-24 28', stroke=IND, w=1.1)
        + C(136, 100, 12, stroke=LAT, sw=1.8)               # o objeto que voltou a importar
        + P('M136 92 v8 l6 4', stroke=LAT, w=1.4)
    )
    return svg(corpo, SW_, SH_)

def s07_marcas():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # cabo de ferramenta gasto exatamente onde a mão pega
        + P('M50 140 Q120 120 200 106 Q260 96 282 60', stroke=IND, w=9)
        + P('M50 140 Q120 120 200 106 Q260 96 282 60', stroke=PAPEL, w=6)
        + P('M50 140 Q120 120 200 106 Q260 96 282 60', stroke=IND, w=6, op=0.25)
        + P('M140 118 Q170 110 196 106', stroke=LAT, w=6, op=0.8)     # o desgaste da mão
        + P('M270 74 L306 36 M262 66 L298 30', stroke=IND, w=2)
    )
    return svg(corpo, SW_, SH_)

def s08_seguranca():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # cena ao fundo, desfocada
        + R(150, 30, 150, 90, fill=IND, op=0.10)
        + fig(190, 112, 44, op=0.3) + fig(224, 116, 48, op=0.3) + fig(258, 112, 44, op=0.3)
        + E(226, 96, 52, 20, stroke=IND, sw=1, op=0.3)
        # cadeira afastada, assento para fora; ninguém sentado
        + R(60, 90, 40, 34, stroke=IND, sw=2)
        + P('M60 124 v26 M100 124 v26 M60 90 l-14 -26 M100 90 l-12 -24', stroke=IND, w=2)
        + P('M46 64 h42', stroke=IND, w=2)
    )
    return svg(corpo, SW_, SH_)

def s09_eixo():
    corpo = (
        R(0, 0, SW_, SH_, fill=VER, op=0.05)
        # bifurcação vista de cima, ramos idênticos
        + P('M160 176 V96 Q160 84 148 76 L84 28', stroke=IND, w=7, op=0.8)
        + P('M160 96 Q160 84 172 76 L236 28', stroke=IND, w=7, op=0.8)
        + P('M160 176 V96 Q160 84 148 76 L84 28 M160 96 Q160 84 172 76 L236 28',
            stroke=PAPEL, w=2, op=0.6, dash='6 8')
        + monte(56, 130, 40, 16, VER, 0.18) + monte(268, 128, 44, 18, VER, 0.18)
        + C(160, 96, 3.4, fill=LAT)
    )
    return svg(corpo, SW_, SH_)

def s10_trilho():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # três degraus de pedra, musgo só no primeiro
        + R(48, 130, 74, 30, stroke=IND, sw=2)
        + R(122, 106, 74, 54, stroke=IND, sw=2)
        + R(196, 74, 74, 86, stroke=IND, sw=2)
        + P('M52 134 q10 6 20 0 q10 -6 18 0', stroke=VER, w=2)         # musgo
        + P('M56 142 q8 4 14 0', stroke=VER, w=1.4)
        + P('M32 160 h256', stroke=IND, w=2)
        + hachura(196, 74, 74, 20, gap=9, op=0.15)
    )
    return svg(corpo, SW_, SH_)

def s11_preparar():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        + mesa_topo(30, 24, 260, 132)
        # papel com três nomes e nada mais
        + R(64, 48, 88, 64, fill=PAPEL, op=0.95) + R(64, 48, 88, 64, stroke=IND, sw=1.4)
        + P('M74 64 h40 M74 80 h48 M74 96 h36', stroke=IND, w=1.6)
        # caderno aberto quase em branco
        + R(180, 56, 96, 68, fill=PAPEL, op=0.95) + R(180, 56, 96, 68, stroke=IND, sw=1.4)
        + P('M228 56 v68', stroke=IND, w=1)
        + P('M188 68 h28', stroke=IND, w=1.2)
        + P('M240 120 q6 -4 10 0', stroke=LAT, w=1.4)                  # pena pousada
        + P('M250 120 l14 -16', stroke=LAT, w=1.6)
    )
    return svg(corpo, SW_, SH_)

def s12_npcs():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.05)
        # três pessoas de perfil, cada uma olhando para fora do quadro
        + fig(80, 162, 96, op=0.85) + fig(160, 168, 104, op=0.9) + fig(240, 162, 96, op=0.85)
        + P('M64 84 L18 66', stroke=LAT, w=1.2, dash='4 5')
        + P('M160 76 L160 18', stroke=LAT, w=1.2, dash='4 5')
        + P('M256 84 L302 60', stroke=LAT, w=1.2, dash='4 5')
    )
    return svg(corpo, SW_, SH_)

def s13_ritmo():
    corpo = (
        R(0, 0, SW_, SH_, fill=IND, op=0.06)
        # dois dados no ar, sem face visível
        + R(120, 44, 30, 30, stroke=IND, sw=2.2, rx=6)
        + R(178, 76, 30, 30, stroke=IND, sw=2.2, rx=6)
        + P('M126 90 q-8 12 -18 16 M212 72 q10 -8 12 -18', stroke=IND, w=1.2, op=0.6)
        + P('M112 60 q-10 2 -16 8 M158 40 q6 -8 14 -10', stroke=IND, w=1.2, op=0.6)
        + P('M60 160 h200', stroke=IND, w=1.6)
        + E(150, 160, 60, 6, fill=IND, op=0.15)
    )
    return svg(corpo, SW_, SH_)

def s14_campanha():
    faixas = []
    tons = [(VER, 0.30), (LAT, 0.35), (IND, 0.12), (IND, 0.35)]
    for k, (cor, op) in enumerate(tons):
        y = 10 + k * 40
        faixas.append(R(20, y, 280, 36, fill=cor, op=op))
        faixas.append(P(f'M20 {y+26} Q100 {y+16} 170 {y+24} T300 {y+22}', stroke=IND, w=1.6))
        faixas.append(P(f'M62 {y+26} l6 -8 6 8 M212 {y+24} l7 -9 7 9', stroke=IND, w=1.1))
    corpo = R(0, 0, SW_, SH_, fill=IND, op=0.04) + ''.join(faixas) + R(20, 10, 280, 160, stroke=IND, sw=1.6)
    return svg(corpo, SW_, SH_)

# ============================================================ LOTE B · aberturas
BW, BH = 760, 496

def b00_ponte():
    """S-01/B-00: a ponte, a tempestade, três figuras, o mapa aberto."""
    d1, g1 = ceu(BW, BH, IND, 0.42, 0.06)
    d2, g2 = glow(560, 240, 90, LAT, 0.32)
    corpo = (
        g1
        + chuva(430, 20, 320, 60, 22, IND, 0.5)
        + monte(120, 330, 260, 130, op=0.35) + monte(650, 330, 280, 150, op=0.45)
        + g2
        # desfiladeiro
        + P('M0 330 L250 330 L290 496 L0 496 Z', fill=IND, op=0.5)
        + P('M760 330 L510 330 L470 496 L760 496 Z', fill=IND, op=0.5)
        # ponte antiga
        + P('M250 336 Q380 300 510 336', stroke=IND, w=5)
        + P('M250 352 Q380 318 510 352', stroke=IND, w=3)
        + ''.join(P(f'M{270 + k * 30} {345 - abs(k - 4) * 2} v14', stroke=IND, w=1.6) for k in range(9))
        # três figuras paradas na borda, uma com mapa aberto
        + fig(200, 330, 64) + fig(232, 332, 58)
        + fig(168, 332, 60)
        + P('M150 302 h24 v16 h-24 Z', fill=PAPEL, op=0.95) + R(150, 302, 24, 16, stroke=IND, sw=1.2)
        + P('M154 310 q8 -4 16 2', stroke=IND, w=0.8)
        + nevoa(380, BW, 40, 0.35)
    )
    return prato(corpo, BW, BH, d1 + d2)

def b01_mesa():
    d1, g1 = glow(380, 130, 180, LAT, 0.30)
    corpo = (
        R(0, 0, BW, BH, fill=IND, op=0.10) + g1
        # mesa à altura dos olhos, cadeira vazia puxada, convidando
        + P('M40 330 H720', stroke=IND, w=4)
        + P('M90 330 V470 M670 330 V470', stroke=IND, w=3)
        + R(150, 260, 110, 70, fill=PAPEL, op=0.85) + R(150, 260, 110, 70, stroke=IND, sw=1.6)
        + P('M162 280 h60 M162 296 h76 M162 312 h52', stroke=IND, w=1.2, op=0.7)
        + R(420, 276, 26, 26, stroke=IND, sw=2, rx=5) + R(458, 288, 26, 26, stroke=IND, sw=2, rx=5)
        + C(500, 300, 17, stroke=IND, sw=1.8) + E(500, 304, 11, 4, fill=IND, op=0.25)
        + P('M560 330 q4 -40 30 -44', stroke=IND, w=2)
        # cadeira vazia em primeiro plano, de costas para nós
        + R(310, 380, 140, 22, stroke=IND, sw=3)
        + P('M320 402 V480 M440 402 V480 M310 380 Q380 366 450 380', stroke=IND, w=3)
    )
    return prato(corpo, BW, BH, d1)

def b02_ficha():
    corpo = (
        R(0, 0, BW, BH, fill=IND, op=0.07)
        + mesa_topo(60, 50, 640, 400)
        # ficha em branco
        + R(140, 110, 220, 290, fill=PAPEL, op=0.97) + R(140, 110, 220, 290, stroke=IND, sw=2)
        + P('M160 150 h120', stroke=IND, w=1.6) + P('M160 180 h90', stroke=IND, w=1)
        + ''.join(P(f'M160 {216 + k * 26} h180', stroke=IND, w=0.8, op=0.35) for k in range(6))
        # objetos de alguém: uma luva, um bilhete, uma chave
        + P('M470 160 q10 -22 34 -16 q16 4 12 22 l-8 28 q-22 6 -34 -8 Z', stroke=IND, w=2)
        + P('M480 166 l6 18 m6 -21 l6 21 m5 -23 l5 22', stroke=IND, w=1.3)
        + R(500, 260, 90, 56, fill=PAPEL, op=0.9) + R(500, 260, 90, 56, stroke=IND, sw=1.6)
        + P('M500 260 l45 30 45 -30', stroke=IND, w=1.2)
        + C(490, 380, 14, stroke=LAT, sw=2.6)
        + P('M502 386 l50 22 m-16 -8 l-6 12 m18 -4 l-6 12', stroke=LAT, w=2.6)
    )
    return prato(corpo, BW, BH)

def b03_vilarejo():
    d1, g1 = ceu(BW, BH, IND, 0.5, 0.10)
    d2, g2 = glow(300, 322, 34, LAT, 0.85)
    corpo = (
        g1
        + monte(180, 380, 320, 120, op=0.35) + monte(600, 380, 340, 140, op=0.45)
        # vilarejo ao anoitecer, visto de longe
        + ''.join(
            R(180 + k * 60, 330 - (k % 3) * 14, 38, 50 + (k % 3) * 14, fill=IND, op=0.75)
            + P(f'M{176 + k * 60} {332 - (k % 3) * 14} l23 -20 23 20', stroke=IND, w=2.4)
            for k in range(7))
        # uma janela se acendendo, três se apagando
        + g2 + R(294, 316, 11, 13, fill=LAT, op=0.95)
        + R(474, 306, 11, 13, fill=IND, op=0.25) + R(534, 322, 11, 13, fill=IND, op=0.25)
        + R(414, 322, 11, 13, fill=IND, op=0.25)
        + P('M0 380 h760', stroke=IND, w=2)
        + nevoa(392, BW, 30, 0.4)
    )
    return prato(corpo, BW, BH, d1 + d2)

def b04_tela():
    corpo = (
        R(0, 0, BW, BH, fill=IND, op=0.06)
        + mesa_topo(60, 60, 640, 380)
        # folha do Mestre vista de cima: três nomes e uma linha
        + R(200, 120, 280, 220, fill=PAPEL, op=0.97) + R(200, 120, 280, 220, stroke=IND, sw=2)
        + P('M230 170 h110 M230 214 h140 M230 258 h96', stroke=IND, w=2)
        + P('M230 302 h190', stroke=LAT, w=2.2)
        # xícara ao lado
        + C(570, 210, 38, stroke=IND, sw=2.4) + E(570, 210, 26, 22, fill=IND, op=0.15)
        + P('M606 196 q22 4 0 30', stroke=IND, w=2.2)
        + E(570, 268, 44, 8, stroke=IND, sw=1, op=0.4)
        + P('M556 168 q6 -12 0 -22 M584 168 q6 -12 0 -22', stroke=IND, w=1.2, op=0.5)
    )
    return prato(corpo, BW, BH)

def b05_torre():
    d1, g1 = ceu(BW, BH, IND, 0.5, 0.08)
    d2, g2 = glow(380, 96, 60, LAT, 0.8)
    corpo = (
        g1
        + monte(160, 440, 300, 60, op=0.25) + monte(620, 440, 300, 80, op=0.3)
        # torre estreita vista de baixo, lanterna acesa no alto
        + P('M340 440 L368 96 L392 96 L420 440 Z', fill=IND, op=0.85)
        + g2 + C(380, 88, 9, fill=LAT)
        + P('M368 96 Q380 74 392 96', stroke=IND, w=3)
        + P('M352 300 h56 M346 360 h68 M358 240 h44', stroke=PAPEL, w=1.4, op=0.35)
        # figura pequena de costas com mapa enrolado, decidindo se sobe
        + fig(330, 452, 40)
        + P('M340 432 l14 -6', stroke=IND, w=3)
        + P('M0 452 h760', stroke=IND, w=2)
        + nevoa(410, BW, 26, 0.3)
    )
    return prato(corpo, BW, BH, d1 + d2)

def b06_mapa():
    corpo = (
        R(0, 0, BW, BH, fill=IND, op=0.06)
        + mesa_topo(50, 40, 660, 420)
        # mapa à mão com metade em branco; a mão que desenha está fora do quadro
        + R(130, 90, 500, 320, fill=PAPEL, op=0.97) + moldura_mapa(130, 90, 500, 320)
        + P('M150 300 Q220 240 300 260 Q350 274 380 250', stroke=IND, w=2)
        + P('M180 180 Q240 160 300 176', stroke=IND, w=1.4)
        + monte(230, 230, 30, 14, IND, 0.3) + monte(280, 214, 24, 12, IND, 0.3)
        + C(340, 300, 5, fill=IND) + T(340, 322, '·', 10)
        + P('M380 250 q20 -14 22 -36', stroke=IND, w=1.4, dash='5 6')   # o traço para no meio
        + rosa_ventos(190, 360, 22)
        # cantos segurados por objetos
        + C(150, 108, 13, fill=IND, op=0.6) + R(590, 96, 30, 22, fill=IND, op=0.5)
        + E(608, 390, 20, 12, fill=IND, op=0.5)
    )
    return prato(corpo, BW, BH)

def b07_estrada():
    d1, g1 = ceu(BW, BH, IND, 0.30, 0.05)
    corpo = (
        g1
        + monte(200, 400, 340, 90, op=0.2) + monte(620, 400, 300, 110, op=0.25)
        # estrada longa sumindo no horizonte
        + P('M80 496 Q340 420 396 300 Q420 250 424 210', stroke=IND, w=4)
        + P('M180 496 Q400 430 430 300 Q446 250 448 210', stroke=IND, w=3)
        # seis marcos de pedra, cada um de um material diferente
        + R(150, 400, 26, 60, fill=IND, op=0.85)
        + P('M240 388 l14 -22 14 22 v40 h-28 Z', fill=IND, op=0.6)
        + C(330, 380, 16, fill=LAT, op=0.7) + P('M316 396 h28 v18 h-28 Z', fill=LAT, op=0.7)
        + R(392, 340, 14, 40, fill=VER, op=0.6)
        + P('M436 322 l9 -14 9 14 v24 h-18 Z', fill=IND, op=0.45)
        + R(452, 280 , 8, 22, fill=IND, op=0.35)
        + P('M0 460 h760', stroke=IND, w=2)
        + nevoa(200, BW, 60, 0.5)
    )
    return prato(corpo, BW, BH, d1)

# ============================================================ LOTE T · territórios
TW, TH = 640, 300

def t01_desconhecido():
    d1, g1 = ceu(TW, TH, IND, 0.16, 0.03)
    corpo = (
        g1
        + P('M0 240 Q160 226 300 236', stroke=IND, w=3)
        + P('M40 262 Q180 250 300 258', stroke=IND, w=2)
        # a estrada some no nevoeiro; o mapa acaba antes do terreno
        + P('M300 236 q60 -4 90 6', stroke=IND, w=2, dash='4 8', op=0.6)
        + nevoa(140, TW, 120, 0.75)
        + nevoa(60, TW, 60, 0.5)
        # marco de pedra sem inscrição
        + P('M120 240 v-64 q0 -10 12 -10 q12 0 12 10 v64', stroke=IND, w=2.4)
        + R(126, 190, 12, 26, fill=IND, op=0.10)
        + fig(340, 246, 34, op=0.5)
    )
    return prato(corpo, TW, TH, d1)

def t02_muralha():
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.05)
        # obstáculo grande e antigo com marcas de tentativas
        + R(60, 60, 520, 180, fill=IND, op=0.16) + R(60, 60, 520, 180, stroke=IND, sw=2.6)
        + P('M60 120 H580 M60 180 H580', stroke=IND, w=1.2, op=0.5)
        + ''.join(P(f'M{110 + k * 90} 60 V120 M{65 + k * 90} 120 V180 M{110 + k * 90} 180 V240',
                    stroke=IND, w=1.2, op=0.5) for k in range(6))
        + P('M150 100 l20 18 m0 -18 l-20 18', stroke=IND, w=1.6)      # marcas de tentativa
        + P('M320 150 q10 12 0 24', stroke=IND, w=1.6) + C(452, 96, 8, stroke=IND, sw=1.4)
        # escada quebrada encostada
        + P('M200 240 L260 120 M232 240 L288 128', stroke=IND, w=2.4)
        + P('M212 216 l34 6 M222 192 l34 6 M234 166 l32 6', stroke=IND, w=2)
        + P('M246 142 l18 4', stroke=IND, w=2, dash='4 4')            # degrau partido
        # passagem lateral que não se vê de frente
        + P('M580 200 q26 -6 34 -22', stroke=LAT, w=2, dash='5 5')
        + P('M0 240 h640', stroke=IND, w=2)
    )
    return prato(corpo, TW, TH)

def t03_encruzilhada():
    d1, g1 = ceu(TW, TH, IND, 0.22, 0.04)
    corpo = (
        g1
        + chuva(20, 30, 180, 50, 12, IND, 0.5)
        # quatro estradas igualmente boas
        + P('M320 300 L320 150 M320 150 L80 60 M320 150 L560 60 M320 150 L320 20',
            stroke=IND, w=0)
        + P('M300 300 Q310 200 320 160 L100 70', stroke=IND, w=3)
        + P('M340 300 Q330 200 320 160 L540 70', stroke=IND, w=3)
        + P('M320 160 V30', stroke=IND, w=3)
        # placa com os braços arrancados
        + P('M400 250 V150', stroke=IND, w=3)
        + R(388, 150, 8, 12, fill=IND, op=0.7) + R(404, 138, 8, 12, fill=IND, op=0.7)
        + P('M388 156 l-16 2 M412 144 l16 -2', stroke=IND, w=1.2, dash='2 4')
        + P('M0 268 h640', stroke=IND, w=1.6)
    )
    return prato(corpo, TW, TH, d1)

def t04_porta_fechada():
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.05)
        # corredor doméstico, nada de sinistro
        + P('M0 250 H640', stroke=IND, w=2)
        + P('M40 250 L120 60 H520 L600 250', stroke=IND, w=1.2, op=0.4)
        + R(260, 84, 120, 166, stroke=IND, sw=2.4)
        + R(272, 96, 96, 142, stroke=IND, sw=1.2)
        + C(354, 170, 6, stroke=IND, sw=1.8)
        # poeira acumulada só na maçaneta
        + P('M346 160 q8 -6 16 0 M344 180 q10 6 20 0', stroke=LAT, w=1.2, op=0.8)
        # um quadro torto e um vaso: domesticidade
        + R(150, 110, 40, 30, stroke=IND, sw=1.2) + P('M150 110 l40 4', stroke=IND, w=0)
        + E(480, 234, 16, 8, stroke=IND, sw=1.4) + P('M474 228 q6 -18 12 0', stroke=VER, w=1.6)
    )
    return prato(corpo, TW, TH)

def t05_lugar_mesa():
    d1, g1 = glow(320, 130, 160, LAT, 0.30)
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.10) + g1
        # mesa longa vista de uma ponta
        + P('M240 260 L300 120 L340 120 L400 260 Z', fill=IND, op=0.12)
        + P('M240 260 L300 120 M400 260 L340 120 M300 120 h40', stroke=IND, w=2.4)
        + P('M262 212 h116 M282 168 h76', stroke=IND, w=1, op=0.5)
        # pessoas em silhueta dos dois lados
        + fig(210, 230, 58, op=0.7) + fig(250, 180, 48, op=0.6) + fig(282, 148, 40, op=0.55)
        + fig(430, 230, 58, op=0.7) + fig(392, 180, 48, op=0.6)
        # a cadeira vazia perto do meio é o assunto
        + R(346, 152, 24, 20, stroke=LAT, sw=2)
        + P('M348 152 v-16 h20 v16', stroke=LAT, w=2)
    )
    return prato(corpo, TW, TH, d1)

def t06_olhos():
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.06)
        # praça vista de cima; todas as figuras voltadas ao mesmo ponto fora do quadro
        + C(320, 150, 120, stroke=IND, sw=1.2, op=0.4)
        + E(320, 150, 190, 110, stroke=IND, sw=1, op=0.25)
        + ''.join(
            E(x, y, 7, 11, fill=IND, op=0.75) + C(x, y - 12, 4.5, fill=IND, op=0.75)
            + P(f'M{x} {y-4} L{x + (640 - x) * 0.06} {y - 4 - (y) * 0.02}', stroke=LAT, w=0.8, op=0.5)
            for x, y in [(160, 90), (220, 150), (180, 210), (300, 80), (330, 190),
                         (410, 120), (390, 230), (470, 170), (250, 250), (500, 90),
                         (540, 220), (100, 160)])
    )
    return prato(corpo, TW, TH)

def t07_cordas():
    d1, g1 = ceu(TW, TH, IND, 0.18, 0.03)
    corpo = (
        g1
        # desfiladeiro e ponte de corda em uso
        + P('M0 190 L150 190 L190 300 L0 300 Z', fill=IND, op=0.4)
        + P('M640 190 L490 190 L450 300 L640 300 Z', fill=IND, op=0.4)
        + P('M150 196 Q320 240 490 196', stroke=IND, w=2.6)
        + P('M150 176 Q320 216 490 176', stroke=IND, w=1.6)
        + ''.join(P(f'M{170 + k * 32} {180 + 36 * (1 - abs(k - 5) / 5) ** 0.5 * 0.9} v'
                    f'{16 + 20 * (1 - abs(k - 5) / 5)}', stroke=IND, w=1, op=0.7)
                  for k in range(11))
        # uma atravessa, uma segura a ponta, uma olha o céu
        + fig(320, 232, 40, op=0.9)
        + fig(136, 190, 44, op=0.8) + P('M148 168 l14 10', stroke=IND, w=2)
        + fig(520, 190, 44, op=0.8) + P('M520 148 l6 -10', stroke=IND, w=1.4, op=0.7)
        + C(560, 60, 14, stroke=IND, sw=1, op=0.5)
    )
    return prato(corpo, TW, TH, d1)

def t08_coroa():
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.08)
        # sala de decisão vazia; nenhuma coroa literal
        + E(320, 190, 190, 60, fill=IND, op=0.10) + E(320, 190, 190, 60, stroke=IND, sw=2.2)
        # cadeiras iguais + uma maior
        + ''.join(R(x, y, 22, 18, stroke=IND, sw=1.4) for x, y in
                  [(150, 250), (240, 264), (400, 264), (490, 250), (180, 116), (420, 116)])
        + R(296, 84, 48, 40, stroke=IND, sw=2.4)
        + P('M296 84 v-18 h48 v18', stroke=IND, w=2.4)
        # pilha de documentos aguardando assinatura
        + ''.join(R(300 + (k % 2) * 3, 168 - k * 5, 44, 5, fill=PAPEL, op=0.95)
                  + R(300 + (k % 2) * 3, 168 - k * 5, 44, 5, stroke=IND, sw=0.7) for k in range(5))
        + P('M352 148 l20 -6', stroke=LAT, w=1.6)                     # a pena espera
    )
    return prato(corpo, TW, TH)

def t09_balanca():
    d1, g1 = glow(150, 130, 40, LAT, 0.7)
    d2, g2 = glow(490, 130, 40, LAT, 0.7)
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.07)
        # dois caminhos, duas casas acesas
        + P('M320 290 Q250 220 170 170 M320 290 Q390 220 470 170', stroke=IND, w=3)
        + g1 + g2
        + R(120, 110, 60, 56, stroke=IND, sw=2) + P('M114 112 l36 -26 36 26', stroke=IND, w=2)
        + R(136, 128, 12, 14, fill=LAT, op=0.9)
        + R(460, 110, 60, 56, stroke=IND, sw=2) + P('M454 112 l36 -26 36 26', stroke=IND, w=2)
        + R(476, 128, 12, 14, fill=LAT, op=0.9)
        # figura parada entre os dois, sem mochila
        + fig(320, 290, 62, op=0.95)
        + P('M0 292 h640', stroke=IND, w=1.6)
    )
    return prato(corpo, TW, TH, d1 + d2)

def t10_espelho():
    d1, g1 = glow(430, 90, 46, LAT, 0.6)
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.12)
        + hachura(0, 0, 640, 80, gap=14, op=0.10)
        # rua depois da chuva; janela iluminada acima
        + R(390, 56, 80, 68, stroke=IND, sw=2) + g1
        + R(402, 66, 24, 22, fill=LAT, op=0.75) + R(434, 66, 24, 22, fill=LAT, op=0.55)
        + P('M340 160 h300', stroke=IND, w=1.4, op=0.5)
        + P('M0 240 h640', stroke=IND, w=2)
        # poça de água parada: o reflexo mais nítido que a janela real
        + E(300, 262, 110, 22, fill=IND, op=0.15) + E(300, 262, 110, 22, stroke=IND, sw=1.6)
        + R(266, 250, 68, 26, fill=LAT, op=0.9) + R(266, 250, 68, 26, stroke=IND, sw=1.6)
        + P('M290 250 v26 M312 250 v26', stroke=IND, w=1.2)
    )
    return prato(corpo, TW, TH, d1)

def t11_ruina():
    d1, g1 = glow(430, 190, 50, LAT, 0.75)
    corpo = (
        R(0, 0, TW, TH, fill=IND, op=0.06)
        # estrutura que já foi importante, vegetação
        + P('M100 250 V110 L140 70 H300 L320 110 M320 250 V110', stroke=IND, w=2.4)
        + P('M100 160 h60 M100 200 h100', stroke=IND, w=1.2, op=0.5)
        + P('M140 70 V50 M180 70 V42 M220 70 V50', stroke=IND, w=2)   # ameias partidas
        + P('M96 250 q30 -40 10 -90 M120 250 q24 -30 12 -60', stroke=VER, w=2)
        + P('M320 130 q30 24 8 60', stroke=VER, w=2)
        # cômodo ainda em uso: fogo aceso, roupa secando
        + R(380, 150, 110, 100, stroke=IND, sw=2.4) + g1
        + P('M380 150 l55 -34 55 34', stroke=IND, w=2.4)
        + P('M420 250 v-30 q15 -14 30 0 v30', stroke=IND, w=2)
        + P('M492 176 h70', stroke=IND, w=1.4)
        + P('M504 176 v22 h14 v-22 M532 176 v18 h12 v-18', stroke=IND, w=1.3)
        + P('M436 216 q4 -12 -2 -20 q10 6 8 20 Z', fill=LAT, op=0.9)  # chama pequena
        + P('M0 250 h640', stroke=IND, w=2)
    )
    return prato(corpo, TW, TH, d1)

def t12_travessia():
    d1, g1 = ceu(TW, TH, IND, 0.2, 0.03)
    corpo = (
        g1
        # água e cais
        + R(0, 190, 640, 110, fill=IND, op=0.16)
        + P('M0 190 h640', stroke=IND, w=1.6)
        + P('M40 190 h150 V300', stroke=IND, w=0)
        + P('M0 190 H190 L190 300', stroke=IND, w=2.4)
        + ''.join(P(f'M{60 + k * 40} 190 v26', stroke=IND, w=2) for k in range(4))
        # barco pequeno saindo; ainda dá para voltar
        + P('M300 236 Q340 252 390 236 L378 218 H312 Z', fill=IND, op=0.85)
        + P('M345 218 V160', stroke=IND, w=2.2)
        + P('M345 160 L385 200 H345', fill=PAPEL, op=0.65)
        + P('M345 160 L385 200 H345 Z', stroke=IND, w=1.6)
        + fig(330, 232, 30, op=0.95)
        # uma pessoa na margem
        + fig(160, 188, 44, op=0.9)
        + P('M190 216 q60 10 110 12', stroke=IND, w=1, dash='3 6', op=0.6)  # a corda ainda solta
        + P('M240 264 q40 8 80 0 M420 268 q40 8 80 0', stroke=IND, w=1, op=0.4)
    )
    return prato(corpo, TW, TH, d1)

# ============================================================ LOTE F · os Quatro
FW, FH = 420, 560

def _base_f():
    return (R(0, 0, FW, FH, fill=IND, op=0.05)
            + R(14, 14, FW - 28, FH - 28, stroke=IND, sw=1.2, op=0.35))

def f01_iris():
    corpo = (
        _base_f()
        + monte(90, 470, 180, 60, op=0.10) + monte(330, 470, 190, 80, op=0.12)
        # três quartos, olhar para fora do quadro; ombros tensos
        + P('M210 530 L196 400 Q170 380 176 330 Q180 300 210 292 Q244 300 246 336 Q250 386 228 402 L224 530 Z',
            fill=IND, op=0.88)
        + C(212, 262, 30, fill=IND, op=0.88)
        + P('M196 238 Q216 226 234 244 Q240 258 236 272', stroke=IND, w=2)   # cabelo preso
        + P('M242 270 L282 258', stroke=IND, w=1.2, dash='3 5', op=0.6)      # o olhar, para longe
        # roupa de campo gasta; correias
        + P('M186 340 L240 328', stroke=PAPEL, w=2, op=0.6)
        + P('M180 380 L244 368', stroke=PAPEL, w=1.4, op=0.4)
        # caixa de instrumentos remendada, três vezes
        + R(150, 420, 96, 62, fill=IND, op=0.2) + R(150, 420, 96, 62, stroke=IND, sw=2.2)
        + P('M150 448 h96', stroke=IND, w=1.4) + C(198, 448, 4, stroke=IND, sw=1.4)
        + P('M162 428 l14 10 M214 462 l16 -10', stroke=LAT, w=1.8)           # remendos
        + P('M186 470 l10 8', stroke=LAT, w=1.8)
        + P('M60 530 h300', stroke=IND, w=1.6)
    )
    return prato(corpo, FW, FH)

def f02_tavi():
    corpo = (
        _base_f()
        + P('M40 500 h340', stroke=IND, w=1.4, op=0.5)
        # magro, postura de quem está de saída: peso num pé, corpo levemente rodado
        + P('M206 520 L200 420 Q182 400 188 348 Q192 318 214 310 Q240 318 240 352 Q244 402 228 420 L236 520 Z',
            fill=IND, op=0.85)
        + C(216, 282, 27, fill=IND, op=0.85)
        + P('M240 360 Q268 380 262 420', stroke=IND, w=5)             # braço solto, meio passo
        + P('M244 520 l22 -6', stroke=IND, w=4)                        # pé já virado
        # sorriso pequeno: sugerido só pela inclinação da cabeça (sem rosto legível)
        + P('M200 262 q10 -10 24 -6', stroke=IND, w=1.2, op=0.5)
        # roupa de lugar nenhum: camadas
        + P('M192 342 Q216 332 238 344', stroke=PAPEL, w=1.6, op=0.5)
        + P('M196 372 Q216 362 236 372', stroke=PAPEL, w=1.2, op=0.35)
    )
    return prato(corpo, FW, FH)

def f03_beren():
    corpo = (
        _base_f()
        + P('M50 512 h320', stroke=IND, w=1.6)
        # mãos grandes, cansado e de pé; bolsa pesada de um lado só
        + P('M196 512 L190 400 Q166 380 174 322 Q180 290 214 284 Q250 292 252 336 Q256 386 238 402 L242 512 Z',
            fill=IND, op=0.9)
        + C(214, 254, 31, fill=IND, op=0.9)
        + P('M190 276 q24 16 48 0 l-6 14 q-18 10 -36 0 Z', fill=IND, op=0.9)   # barba malfeita
        + P('M174 330 Q150 360 152 420', stroke=IND, w=6)
        + C(152, 424, 8, fill=IND, op=0.95)                                     # mão grande
        # a bolsa que pesa mais do que deveria
        + P('M252 340 Q286 356 288 420', stroke=IND, w=4)
        + P('M262 420 q0 -14 26 -14 q26 0 26 14 l-4 48 q-24 10 -44 0 Z', fill=IND, op=0.35)
        + P('M262 420 q0 -14 26 -14 q26 0 26 14 l-4 48 q-24 10 -44 0 Z', stroke=IND, w=2.2)
        + P('M268 438 h44', stroke=IND, w=1.2)
        + P('M288 406 v-10', stroke=LAT, w=2)                          # fecho de latão
    )
    return prato(corpo, FW, FH)

def f04_wren():
    corpo = (
        _base_f()
        # sentada num parapeito baixo, botas nos pés; nunca frágil: postura firme
        + R(120, 430, 180, 16, fill=IND, op=0.2) + P('M120 430 h180', stroke=IND, w=2)
        + P('M208 430 L204 372 Q192 356 198 322 Q202 300 218 296 Q236 302 236 328 Q240 358 230 372 L232 430 Z',
            fill=IND, op=0.88)
        + C(218, 274, 22, fill=IND, op=0.88)
        + P('M204 296 q14 -8 28 0', stroke=PAPEL, w=1.2, op=0.4)       # gola alta
        # pernas com botas, firmes no apoio
        + P('M212 430 V486 M228 430 V486', stroke=IND, w=6)
        + P('M206 486 h16 v10 h-22 Z', fill=IND, op=0.95)
        + P('M222 486 h16 v10 h-22 Z', fill=IND, op=0.95)
        # rosto deliberadamente pouco individualizado: nada além da silhueta
        + P('M120 446 h180', stroke=IND, w=1, op=0.4)
    )
    return prato(corpo, FW, FH)

# ============================================================ LOTE G · crônicas
GW, GH = 640, 300

def g01_vespera():
    d1, g1 = ceu(GW, GH, IND, 0.55, 0.15)
    acesas = [(x, y) for x in range(70, 590, 52) for y in (150, 190, 230)]
    corpo = (
        g1
        # cidade da madrugada vista de um telhado; janelas demais acesas
        + P('M0 130 l70 24 v146 H0 Z', fill=IND, op=0.75)              # o telhado de onde se vê
        + P('M0 130 l70 24', stroke=IND, w=2.4)
        + ''.join(R(56 + k * 52, 120 + (k * 37) % 60, 40, 300, fill=IND, op=0.6) for k in range(11))
        + ''.join(R(x + (y % 3) * 3, y + (x % 5), 8, 10, fill=LAT, op=0.85)
                  for k, (x, y) in enumerate(acesas) if k != 16)
        # a única janela apagada, no centro
        + R(acesas[16][0] + 1, acesas[16][1], 9, 11, fill=IND, op=0.95)
        + R(acesas[16][0] - 1, acesas[16][1] - 2, 13, 15, stroke=PAPEL, sw=1, op=0.6)
    )
    return prato(corpo, GW, GH, d1)

def g02_arken():
    d1, g1 = glow(320, 150, 90, LAT, 0.30)
    corpo = (
        R(0, 0, GW, GH, fill=IND, op=0.14)
        + hachura(0, 0, 640, 300, gap=26, op=0.06)
        # a Primeira Porta, monumental, entreaberta; alguém bate do outro lado
        + P('M200 300 V96 Q200 40 320 40 Q440 40 440 96 V300', stroke=IND, w=3.4)
        + P('M212 300 V100 Q212 52 320 52 Q428 52 428 100 V300', stroke=IND, w=1.4, op=0.6)
        + g1
        + P('M320 52 V300', stroke=IND, w=2)
        + R(320, 60, 12, 240, fill=LAT, op=0.35)                       # a fresta de luz
        + C(302, 180, 5, stroke=IND, sw=1.8)
        + T(320, 26, '· · ·', 13, IND, op=0.8)                          # a batida
        + P('M60 300 h520', stroke=IND, w=2)
        + fig(150, 296, 52, op=0.7) + fig(500, 296, 48, op=0.6)
    )
    return prato(corpo, GW, GH, d1)

def g03_torre_espelhos():
    d1, g1 = ceu(GW, GH, IND, 0.30, 0.06)
    corpo = (
        g1
        + monte(120, 280, 220, 60, op=0.2) + monte(540, 280, 220, 70, op=0.24)
        # torre de vidro de sete andares
        + P('M290 280 L302 40 H338 L350 280 Z', fill=PAPEL, op=0.5)
        + P('M290 280 L302 40 H338 L350 280 Z', stroke=IND, w=2.4)
        + ''.join(P(f'M{292 + k * 0.9} {248 - k * 30} h{54 - k * 1.6}', stroke=IND, w=1, op=0.6)
                  for k in range(7))
        + P('M306 60 L318 250', stroke=PAPEL, w=3, op=0.9)             # o brilho do vidro
        # reflexos da torre nas poças da cidade
        + E(240, 288, 40, 8, stroke=IND, sw=1.2, op=0.5) + P('M232 282 l10 -18', stroke=IND, w=1, op=0.4)
        + E(420, 290, 50, 9, stroke=IND, sw=1.2, op=0.5) + P('M416 284 l8 -16', stroke=IND, w=1, op=0.4)
        + P('M0 280 h640', stroke=IND, w=2)
        + fig(380, 276, 40, op=0.6)
    )
    return prato(corpo, GW, GH, d1)

def g04_trem():
    d1, g1 = glow(120, 140, 70, LAT, 0.5)
    corpo = (
        R(0, 0, GW, GH, fill=IND, op=0.16)
        # plataforma, relógio em 23:59, trem esperando
        + P('M0 250 h640', stroke=IND, w=2.6)
        + P('M40 250 v-160 h80 v160', stroke=IND, w=0)
        + R(60, 60, 120, 190, fill=IND, op=0.25)                        # estação
        + g1 + C(120, 120, 26, fill=PAPEL, op=0.95) + C(120, 120, 26, stroke=IND, sw=2.2)
        + P('M120 120 L120 100 M120 120 L104 122', stroke=IND, w=2)     # 23:59
        # o trem
        + R(260, 150, 330, 84, fill=IND, op=0.8)
        + R(260, 150, 330, 84, stroke=IND, sw=2)
        + P('M260 150 q-24 42 0 84', stroke=IND, w=2)
        + ''.join(R(286 + k * 62, 168, 34, 26, fill=LAT, op=0.5) for k in range(5))
        + C(300, 246, 12, stroke=IND, sw=2) + C(380, 246, 12, stroke=IND, sw=2)
        + C(480, 246, 12, stroke=IND, sw=2) + C(552, 246, 12, stroke=IND, sw=2)
        # uma pessoa na plataforma com o bilhete
        + fig(210, 248, 54, op=0.95)
        + P('M222 216 l14 -4', stroke=PAPEL, w=2)
    )
    return prato(corpo, GW, GH, d1)

def g05_vila():
    corpo = (
        R(0, 0, GW, GH, fill=IND, op=0.07)
        # o arco dos nomes, com a inscrição apagada
        + P('M180 280 V140 Q180 60 320 60 Q460 60 460 140 V280', stroke=IND, w=3.4)
        + R(260, 84, 120, 30, fill=PAPEL, op=0.9) + R(260, 84, 120, 30, stroke=IND, sw=1.6)
        + P('M274 100 h20 M304 100 h24 M338 100 h28', stroke=IND, w=1.2, op=0.25, dash='2 3')
        # casas conhecidas, placas vazias
        + R(60, 200, 70, 80, stroke=IND, sw=2) + P('M55 202 l40 -28 40 28', stroke=IND, w=2)
        + R(510, 200, 70, 80, stroke=IND, sw=2) + P('M505 202 l40 -28 40 28', stroke=IND, w=2)
        + R(84, 226, 22, 12, stroke=IND, sw=1.2)
        + R(534, 226, 22, 12, stroke=IND, sw=1.2)
        + P('M0 280 h640', stroke=IND, w=2)
        + fig(320, 276, 48, op=0.8) + fig(354, 278, 42, op=0.6)
    )
    return prato(corpo, GW, GH)

def g06_jardim():
    d1, g1 = glow(320, 200, 120, VER, 0.25)
    corpo = (
        R(0, 0, GW, GH, fill=IND, op=0.08)
        # muralha branca contínua; dentro, o jardim
        + P('M40 240 Q320 190 600 240', stroke=IND, w=3)
        + P('M40 262 Q320 212 600 262', stroke=IND, w=1.6, op=0.6)
        + P('M40 240 Q320 190 600 240 L600 262 Q320 212 40 262 Z', fill=PAPEL, op=0.85)
        + g1
        # copas do jardim aparecendo por cima da muralha
        + E(220, 196, 40, 22, fill=VER, op=0.45) + E(320, 184, 52, 26, fill=VER, op=0.5)
        + E(420, 196, 44, 22, fill=VER, op=0.45) + E(270, 204, 30, 16, fill=VER, op=0.4)
        + P('M220 218 v14 M320 210 v18 M420 218 v14', stroke=IND, w=2)
        # do lado de fora: a mochila e a muda que Nima deixou
        + P('M140 288 q0 -10 18 -10 q18 0 18 10 l-3 22 q-15 7 -30 0 Z', stroke=IND, w=2)
        + P('M186 306 q0 -14 10 -16 M196 290 q-4 -10 4 -14', stroke=VER, w=2)
        + E(196, 308, 12, 4, stroke=IND, sw=1.2)
        + P('M0 310 h640', stroke=IND, w=0)
    )
    return prato(corpo, GW, GH, d1)

# ============================================================ LOTE H · mapas

def h01_mundo():
    W, H = 700, 880
    corpo = (
        R(0, 0, W, H, fill=PAPEL) + R(0, 0, W, H, fill=LAT, op=0.05)
        + moldura_mapa(30, 30, W - 60, H - 60)
        + R(44, 44, W - 88, H - 88, stroke=IND, sw=0.8, op=0.4)
        # litoral principal
        + P('M60 640 Q140 600 180 520 Q210 460 300 440 Q360 430 400 380 Q440 330 520 330 '
            'Q600 330 640 290 L640 840 L60 840 Z', fill=IND, op=0.08)
        + P('M60 640 Q140 600 180 520 Q210 460 300 440 Q360 430 400 380 Q440 330 520 330 Q600 330 640 290',
            stroke=IND, w=2.2)
        + P('M70 660 Q150 620 195 540', stroke=IND, w=0.9, op=0.4)
        # montanhas do norte
        + ''.join(P(f'M{300 + k * 34} {200 + (k % 3) * 12} l14 -24 14 24', stroke=IND, w=1.6)
                  for k in range(6))
        # rio até Erva Baixa
        + P('M420 380 Q400 480 340 520 Q300 550 310 620', stroke=IND, w=1.6)
        + P('M310 620 q-4 30 -20 44', stroke=IND, w=1.2)
        # cidades e vilas
        + C(180, 520, 5, fill=IND) + T(180, 505, 'PONTA CINZA', 10)
        + C(340, 520, 4, fill=IND) + T(340, 505, 'ERVA BAIXA', 10)
        + C(520, 330, 5, fill=IND) + T(520, 315, 'VÉSPERA', 10)
        + C(300, 620, 4, fill=IND) + T(300, 648, 'MERCADO BAIXO', 10)
        + P('M330 512 l20 16', stroke=IND, w=0.8, op=0.5)
        # a parte em branco: ninguém foi até ali
        + P('M120 120 Q240 100 340 130', stroke=IND, w=1, dash='3 7', op=0.6)
        + T(230, 180, 'ninguém foi até aqui', 13, IND, font='Liberation Serif', ls=0.5, op=0.65)
        + T(230, 200, '— I.', 11, IND, font='Liberation Serif', ls=0.5, op=0.5)
        # convenções de cartógrafo
        + rosa_ventos(600, 760, 34)
        + P('M80 760 h120', stroke=IND, w=2) + P('M80 754 v12 M140 754 v12 M200 754 v12', stroke=IND, w=1.2)
        + T(140, 786, 'VINTE LÉGUAS', 9)
        + T(350, 76, 'ROTAS DO NORTE · LEVANTAMENTO DA GUILDA DO FAROL', 12, IND, ls=2.5)
    )
    return svg(corpo, W, H)

def h02_erva_baixa():
    W, H = 640, 430
    casas = [(150, 160), (210, 120), (280, 100), (360, 104), (430, 130), (480, 170),
             (150, 250), (200, 290), (270, 320), (350, 330), (430, 300), (480, 250),
             (250, 190), (390, 210)]
    corpo = (
        R(0, 0, W, H, fill=PAPEL) + R(0, 0, W, H, fill=LAT, op=0.04)
        + moldura_mapa(24, 24, W - 48, H - 48)
        # quatorze casas em traço de mão
        + ''.join(R(x, y, 30, 24, stroke=IND, sw=1.6) + P(f'M{x-3} {y+2} l18 -12 18 12', stroke=IND, w=1.6)
                  for x, y in casas)
        # poço central seco
        + C(320, 215, 16, stroke=IND, sw=2.2) + C(320, 215, 9, stroke=IND, sw=1, dash='2 3')
        + T(320, 252, 'O POÇO', 10)
        # trilha para a mina, subindo
        + P('M336 200 Q420 150 470 90 Q500 60 560 50', stroke=IND, w=1.6, dash='6 5')
        + P('M560 60 l14 -24 14 24 M588 66 l10 -18 10 18', stroke=IND, w=1.6)
        + T(560, 96, 'A MINA', 10)
        # rio velho
        + P('M60 380 Q200 360 320 372 Q460 384 580 366', stroke=IND, w=2)
        + P('M60 390 Q200 370 320 382', stroke=IND, w=1, op=0.5)
        + T(140, 356, 'RIO VELHO', 9, IND, op=0.7)
        + T(320, 62, 'ERVA BAIXA', 15, IND, ls=4)
        + T(320, 410, 'levantado às pressas, seis dias depois de o poço secar', 11, IND,
            font='Liberation Serif', ls=0.4, op=0.6)
    )
    return svg(corpo, W, H)

def h03_territorios():
    W, H = 640, 430
    # constelação: posições dos doze Territórios
    pos = {
        'O DESCONHECIDO': (110, 90), 'A MURALHA': (250, 70), 'A ENCRUZILHADA': (150, 200),
        'A PORTA FECHADA': (300, 160), 'O LUGAR À MESA': (450, 90), 'AS CORDAS': (520, 180),
        'A COROA': (400, 240), 'A BALANÇA': (250, 300), 'O ESPELHO': (420, 330),
        'A RUÍNA': (120, 330), 'OS OLHOS DOS OUTROS': (540, 300), 'A TRAVESSIA': (320, 390),
    }
    liga = [('O DESCONHECIDO', 'A MURALHA'), ('O DESCONHECIDO', 'A ENCRUZILHADA'),
            ('A MURALHA', 'A PORTA FECHADA'), ('A ENCRUZILHADA', 'A BALANÇA'),
            ('A PORTA FECHADA', 'O LUGAR À MESA'), ('O LUGAR À MESA', 'AS CORDAS'),
            ('AS CORDAS', 'A COROA'), ('A COROA', 'A BALANÇA'), ('A BALANÇA', 'A RUÍNA'),
            ('A COROA', 'O ESPELHO'), ('O ESPELHO', 'OS OLHOS DOS OUTROS'),
            ('OS OLHOS DOS OUTROS', 'AS CORDAS'), ('A BALANÇA', 'A TRAVESSIA'),
            ('O ESPELHO', 'A TRAVESSIA'), ('O LUGAR À MESA', 'OS OLHOS DOS OUTROS'),
            ('A PORTA FECHADA', 'A COROA')]
    corpo = R(0, 0, W, H, fill=IND, op=0.08) + moldura_mapa(24, 24, W - 48, H - 48)
    for a, b in liga:
        (x1, y1), (x2, y2) = pos[a], pos[b]
        corpo += P(f'M{x1} {y1} L{x2} {y2}', stroke=IND, w=0.9, op=0.4, dash='1 5')
    for nome, (x, y) in pos.items():
        corpo += C(x, y, 4, fill=LAT) + C(x, y, 7.5, stroke=IND, sw=0.9, op=0.6)
        corpo += T(x, y - 14, nome, 9.5, IND, ls=1.2)
    corpo += T(320, 56, 'OS DOZE TERRITÓRIOS · QUAIS COSTUMAM APARECER JUNTOS', 11, IND, ls=2)
    return svg(corpo, W, H)

# ============================================================ LOTE A · capa e guardas

def a01_capa():
    W, H = 760, 1000
    d1, g1 = glow(380, 588, 130, LAT, 0.35)
    corpo = (
        R(0, 0, W, H, fill=IND)
        # paisagem dividida 62/38: índigo em cima, latão embaixo
        + R(0, 620, W, 380, fill=LAT)
        + P('M0 620 h760', stroke=PAPEL, w=2, op=0.6)
        # relevo sutil nas duas metades
        + monte(180, 620, 260, 90, PAPEL, 0.06) + monte(560, 620, 300, 120, PAPEL, 0.08)
        + P('M120 780 Q380 700 640 780', stroke=IND, w=2, op=0.35)
        + P('M60 880 Q380 800 700 880', stroke=IND, w=2, op=0.25)
        + g1
        # uma única figura de costas, diante da divisão
        + P('M380 720 Q346 660 360 560 Q368 520 380 512 Q392 520 400 560 Q414 660 380 720 Z',
            fill='#141E2D')
        + P('M348 700 Q330 664 342 590 Q354 540 380 532 Q406 540 418 590 Q430 664 412 700 '
            'L404 720 H356 Z', fill='#141E2D')
        + C(380, 496, 24, fill='#141E2D')
        + P('M402 512 Q414 548 418 590', stroke=LAT, w=1.4, op=0.5)
        + P('M356 700 L352 720 M404 700 L408 720', stroke='#141E2D', w=3)
        # textura de aguada e granulação
        + grao(W, H, 44, 420, PAPEL, 0.05)
    )
    d2, g2 = lavagem(180, 150, 300, PAPEL, 0.06, 0.7)
    d3, g3 = lavagem(620, 320, 260, PAPEL, 0.05, 0.8)
    d4, g4 = lavagem(380, 860, 360, IND, 0.16, 0.5)
    corpo = g2 + g3 + corpo + g4
    corpo += vinheta(W, H, '#101826')
    return svg(corpo, W, H, d1 + d2 + d3 + d4)

def a02_quarta():
    W, H = 760, 420
    corpo = (
        R(0, 0, W, H, fill='none')
        # vinheta: a caixa de instrumentos, os dois dados, o mapa dobrado
        + R(300, 150, 116, 74, fill=IND, op=0.15) + R(300, 150, 116, 74, stroke=IND, sw=2.2)
        + P('M300 184 h116', stroke=IND, w=1.4) + C(358, 184, 5, stroke=IND, sw=1.4)
        + P('M316 160 l14 10', stroke=LAT, w=1.8)
        + R(452, 186, 22, 22, stroke=IND, sw=2, rx=4) + R(482, 198, 22, 22, stroke=IND, sw=2, rx=4)
        + P('M232 176 l54 -8 -6 52 -54 8 Z', fill=PAPEL, op=0.9)
        + P('M232 176 l54 -8 -6 52 -54 8 Z', stroke=IND, w=1.8)
        + P('M258 172 l-4 52', stroke=IND, w=1)
    )
    return svg(corpo, W, H)

def a03_guardas(brasoes_corpos):
    """Padronagem 400×400 com os oito brasões em malha irregular."""
    W = 400
    celulas = [(28, 20, 0.9), (150, 44, 0.75), (276, 22, 0.9), (86, 130, 0.8),
               (216, 150, 0.95), (330, 132, 0.75), (30, 250, 0.8), (160, 262, 0.85),
               (296, 250, 0.8), (94, 342, 0.75), (230, 356, 0.8), (338, 340, 0.9)]
    corpos = list(brasoes_corpos)
    corpo = R(0, 0, W, W, fill='none')
    for k, (x, y, e) in enumerate(celulas):
        b = corpos[k % 8]
        corpo += (f'<g transform="translate({x} {y}) scale({e})" opacity="0.5" stroke="{IND}" '
                  f'fill="none" stroke-linecap="round" stroke-linejoin="round">{b}</g>')
    return svg(corpo, W, W)

# ============================================================ catálogo

def catalogo(brasoes_corpos=None):
    pecas = {
        'C-01': c01_vigia(), 'C-02': c02_estrategista(), 'C-03': c03_rastreador(),
        'C-04': c04_guardiao(), 'C-05': c05_adiador(), 'C-06': c06_eremita(),
        'C-07': c07_juiz(), 'C-08': c08_carrasco(), 'C-09': c09_artesao(),
        'C-10': c10_camaleao(), 'C-11': c11_ator(), 'C-12': c12_herdeiro(),
        'C-13': c13_oraculo(), 'C-14': c14_leitor(), 'C-15': c15_pressagio(),
        'C-16': c16_colecionador(), 'C-17': c17_inventariante(), 'C-18': c18_contabilista(),
        'C-19': c19_devedor(), 'C-20': c20_salvador(), 'C-21': c21_abandonado(),
        'C-22': c22_duplo(), 'C-23': c23_invisivel(), 'C-24': c24_silenciador(),
        'S-02': s02_cena(), 'S-03': s03_contexto(), 'S-04': s04_zona(),
        'S-05': s05_resposta(), 'S-06': s06_ecos(), 'S-07': s07_marcas(),
        'S-08': s08_seguranca(), 'S-09': s09_eixo(), 'S-10': s10_trilho(),
        'S-11': s11_preparar(), 'S-12': s12_npcs(), 'S-13': s13_ritmo(),
        'S-14': s14_campanha(),
        'B-00': b00_ponte(), 'B-01': b01_mesa(), 'B-02': b02_ficha(),
        'B-03': b03_vilarejo(), 'B-04': b04_tela(), 'B-05': b05_torre(),
        'B-06': b06_mapa(), 'B-07': b07_estrada(),
        'T-01': t01_desconhecido(), 'T-02': t02_muralha(), 'T-03': t03_encruzilhada(),
        'T-04': t04_porta_fechada(), 'T-05': t05_lugar_mesa(), 'T-06': t06_olhos(),
        'T-07': t07_cordas(), 'T-08': t08_coroa(), 'T-09': t09_balanca(),
        'T-10': t10_espelho(), 'T-11': t11_ruina(), 'T-12': t12_travessia(),
        'F-01': f01_iris(), 'F-02': f02_tavi(), 'F-03': f03_beren(), 'F-04': f04_wren(),
        'G-01': g01_vespera(), 'G-02': g02_arken(), 'G-03': g03_torre_espelhos(),
        'G-04': g04_trem(), 'G-05': g05_vila(), 'G-06': g06_jardim(),
        'H-01': h01_mundo(), 'H-02': h02_erva_baixa(), 'H-03': h03_territorios(),
        'A-01': a01_capa(), 'A-02': a02_quarta(),
    }
    if brasoes_corpos:
        pecas['A-03'] = a03_guardas(brasoes_corpos)
    return pecas
