import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ArestaGrafo} from './tipos';

const DURACAO_TRACO = 16;

/** Linha entre pai e filho, desenhada da ponta do pai para a do filho. */
export const Aresta: React.FC<{aresta: ArestaGrafo; escala: number}> = ({
	aresta,
	escala,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const duracao = DURACAO_TRACO * (fps / 30);
	const progresso = interpolate(
		frame,
		[aresta.entrada, aresta.entrada + duracao],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	if (progresso <= 0) {
		return null;
	}

	const comprimento = Math.hypot(aresta.x2 - aresta.x1, aresta.y2 - aresta.y1);

	return (
		<line
			x1={aresta.x1}
			y1={aresta.y1}
			x2={aresta.x2}
			y2={aresta.y2}
			stroke={aresta.cor}
			strokeWidth={1.1 * escala}
			strokeOpacity={0.3 * progresso + 0.05}
			strokeLinecap="round"
			strokeDasharray={comprimento}
			strokeDashoffset={comprimento * (1 - progresso)}
		/>
	);
};
