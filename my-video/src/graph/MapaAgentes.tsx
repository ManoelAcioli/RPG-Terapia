import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Aresta} from './Aresta';
import {estrutura, montarGrafo} from './layout';
import {No} from './No';
import {NucleoParticulas} from './NucleoParticulas';
import type {NoGrafo} from './tipos';

/**
 * `type` e não `interface`: o `Composition` do Remotion exige props
 * atribuíveis a `Record<string, unknown>`, e só type alias ganha a
 * assinatura de índice implícita.
 */
export type PropsMapaAgentes = {
	/** Multiplicador dos raios. 1 = calibrado para 1080 de largura. */
	escala: number;
	/** Posição vertical do centro do grafo, de 0 a 1. */
	centroY: number;
	/** Distância do topo até o título, em px. */
	margemTopo: number;
	/** Distância da base até a legenda, em px. */
	margemBase: number;
	/** Corpo tipográfico do título, em px. */
	tamanhoTitulo: number;
};

const FONTE = 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif';

/** Nós maiores desenhados por último, para ficarem por cima. */
const ORDEM: Record<NoGrafo['tipo'], number> = {
	tarefa: 0,
	agente: 1,
	dominio: 2,
	nucleo: 3,
};

export const MapaAgentes: React.FC<PropsMapaAgentes> = ({
	escala,
	centroY,
	margemTopo,
	margemBase,
	tamanhoTitulo,
}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	const grafo = useMemo(
		() =>
			montarGrafo({
				largura: width,
				altura: height,
				centroY,
				escala,
				fps,
			}),
		[width, height, centroY, escala, fps],
	);

	const nosOrdenados = useMemo(
		() => [...grafo.nos].sort((a, b) => ORDEM[a.tipo] - ORDEM[b.tipo]),
		[grafo.nos],
	);

	const t = fps / 30;
	const cx = width / 2;
	const cy = height * centroY;

	// Contador do título sobe junto com a entrada dos agentes.
	const contador = Math.round(
		interpolate(frame, [30 * t, 96 * t], [0, grafo.totalAgentes], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);

	const respiro = 1 + Math.sin(frame / 90) * 0.012;

	const opacidadeTitulo = interpolate(frame, [6 * t, 26 * t], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const opacidadeLegenda = interpolate(frame, [100 * t, 124 * t], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#0D0F2B'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle at 50% ' +
						`${centroY * 100}%, #2B2E5E 0%, #1A1C44 42%, #0D0F2B 78%)`,
				}}
			/>

			<AbsoluteFill>
				<svg
					width={width}
					height={height}
					viewBox={`0 0 ${width} ${height}`}
					style={{position: 'absolute', inset: 0}}
				>
					<g
						transform={`translate(${cx} ${cy}) scale(${respiro}) translate(${-cx} ${-cy})`}
					>
						<NucleoParticulas
							cx={cx}
							cy={cy}
							raio={64 * escala}
							cor={estrutura.nucleo.cor}
							entrada={0}
						/>

						{grafo.arestas.map((aresta) => (
							<Aresta key={aresta.id} aresta={aresta} escala={escala} />
						))}

						{nosOrdenados.map((no) => (
							<No key={no.id} no={no} />
						))}
					</g>

					{grafo.rotulos.map((rotulo) => {
						const opacidade = interpolate(
							frame,
							[rotulo.entrada, rotulo.entrada + 18 * t],
							[0, 1],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						);

						if (opacidade <= 0) {
							return null;
						}

						return (
							<g key={rotulo.id} opacity={opacidade}>
								{/* Contorno escuro atrás das letras: o rótulo passa por
								    cima dos nós sem perder legibilidade. */}
								<text
									x={rotulo.x}
									y={rotulo.y}
									textAnchor="middle"
									fill="#F2F0FF"
									stroke="#12142F"
									strokeWidth={7 * escala}
									strokeLinejoin="round"
									style={{
										fontFamily: FONTE,
										fontSize: 27 * escala,
										fontWeight: 500,
										letterSpacing: 5 * escala,
										paintOrder: 'stroke',
									}}
								>
									{rotulo.nome}
								</text>
								<text
									x={rotulo.x}
									y={rotulo.y + 26 * escala}
									textAnchor="middle"
									fill={rotulo.cor}
									stroke="#12142F"
									strokeWidth={5 * escala}
									strokeLinejoin="round"
									opacity={0.85}
									style={{
										fontFamily: FONTE,
										fontSize: 14 * escala,
										letterSpacing: 1.4 * escala,
										paintOrder: 'stroke',
									}}
								>
									{rotulo.subtitulo}
								</text>
							</g>
						);
					})}
				</svg>
			</AbsoluteFill>

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'flex-start',
					paddingTop: margemTopo,
					opacity: opacidadeTitulo,
				}}
			>
				<div
					style={{
						fontFamily: FONTE,
						fontSize: 20 * escala,
						letterSpacing: 6 * escala,
						color: '#9B9BD6',
						marginBottom: 18 * escala,
					}}
				>
					RPG-TERAPIA · SELFI
				</div>
				<div
					style={{
						fontFamily: FONTE,
						fontSize: tamanhoTitulo,
						fontWeight: 700,
						color: '#FFFFFF',
						textAlign: 'center',
						lineHeight: 1.12,
						maxWidth: width * 0.84,
					}}
				>
					{contador} agentes rodam
					<br />a operação inteira
				</div>
			</AbsoluteFill>

			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'flex-end',
					paddingBottom: margemBase,
					opacity: opacidadeLegenda,
				}}
			>
				<div
					style={{
						fontFamily: FONTE,
						fontSize: 24 * escala,
						color: '#B9B7E8',
						textAlign: 'center',
						maxWidth: width * 0.8,
					}}
				>
					{grafo.totalDominios} domínios · {grafo.totalAgentes} agentes ·{' '}
					{grafo.nos.length} nós
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
