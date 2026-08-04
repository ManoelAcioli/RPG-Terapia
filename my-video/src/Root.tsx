import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import {MapaAgentes} from './graph/MapaAgentes';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="MapaAgentesVertical"
				component={MapaAgentes}
				durationInFrames={300}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					escala: 0.88,
					centroY: 0.48,
					margemTopo: 175,
					margemBase: 400,
					tamanhoTitulo: 74,
				}}
			/>
			<Composition
				id="MapaAgentesHorizontal"
				component={MapaAgentes}
				durationInFrames={300}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					escala: 0.78,
					centroY: 0.55,
					margemTopo: 56,
					margemBase: 48,
					tamanhoTitulo: 52,
				}}
			/>
			<Composition
				id="MyComp"
				component={MyComposition}
				durationInFrames={150}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
