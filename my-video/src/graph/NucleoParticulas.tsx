import React from 'react';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

const QUANTIDADE = 90;

/**
 * Poeira luminosa em volta do núcleo. Posições derivadas de `random()` com
 * semente fixa — determinístico entre frames e entre execuções de render.
 */
export const NucleoParticulas: React.FC<{
	cx: number;
	cy: number;
	raio: number;
	cor: string;
	entrada: number;
}> = ({cx, cy, raio, cor, entrada}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const surgimento = interpolate(
		frame,
		[entrada, entrada + 30 * (fps / 30)],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	if (surgimento <= 0) {
		return null;
	}

	const particulas = new Array(QUANTIDADE).fill(0).map((_, i) => {
		const angulo = random(`p-${i}-a`) * Math.PI * 2;
		// Raiz quadrada distribui as partículas por área, não por raio.
		const distancia = Math.sqrt(random(`p-${i}-d`)) * raio;
		const velocidade = 0.1 + random(`p-${i}-v`) * 0.25;
		const anguloAtual = angulo + (frame / fps) * velocidade;
		const cintilar =
			0.35 + Math.abs(Math.sin(frame / 22 + random(`p-${i}-f`) * 6)) * 0.65;

		return {
			x: cx + Math.cos(anguloAtual) * distancia,
			y: cy + Math.sin(anguloAtual) * distancia,
			r: 0.8 + random(`p-${i}-r`) * 1.9,
			o: cintilar * surgimento,
		};
	});

	return (
		<g>
			{particulas.map((p, i) => (
				<circle
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					cx={p.x}
					cy={p.y}
					r={p.r}
					fill={cor}
					opacity={p.o * 0.8}
				/>
			))}
		</g>
	);
};
