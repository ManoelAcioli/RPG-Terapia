import React from 'react';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {NoGrafo} from './tipos';

const OPACIDADE: Record<NoGrafo['tipo'], number> = {
	nucleo: 1,
	dominio: 1,
	agente: 0.92,
	tarefa: 0.7,
};

/** Ponto do grafo: entra com mola e depois respira devagar. */
export const No: React.FC<{no: NoGrafo}> = ({no}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	if (frame < no.entrada) {
		return null;
	}

	const desdeEntrada = frame - no.entrada;

	const entrada = spring({
		frame: desdeEntrada,
		fps,
		config: {damping: 13, mass: 0.5, stiffness: 110},
	});

	// Fase estável por nó — nunca Math.random(), o render é frame a frame.
	const fase = random(`${no.id}-fase`) * Math.PI * 2;
	const respiro = 1 + Math.sin(desdeEntrada / 26 + fase) * 0.07;

	const raio = no.raio * entrada * respiro;
	const opacidade = OPACIDADE[no.tipo];

	return (
		<g>
			<circle
				cx={no.x}
				cy={no.y}
				r={raio * 3.2}
				fill={no.cor}
				opacity={0.13 * entrada}
			/>
			<circle
				cx={no.x}
				cy={no.y}
				r={raio}
				fill={no.tipo === 'dominio' ? 'none' : no.cor}
				stroke={no.cor}
				strokeWidth={no.tipo === 'dominio' ? raio * 0.28 : 0}
				opacity={opacidade * entrada}
			/>
		</g>
	);
};
