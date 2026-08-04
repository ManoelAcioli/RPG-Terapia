import {random} from 'remotion';
import estruturaJson from '../../../org/estrutura.json';
import type {
	ArestaGrafo,
	Estrutura,
	Grafo,
	NoGrafo,
	RotuloDominio,
} from './tipos';

export const estrutura = estruturaJson as Estrutura;

const TAU = Math.PI * 2;

/**
 * Raios em unidades de uma tela de 1080 de largura. `escala` ajusta para
 * outros formatos.
 */
const RAIO = {
	dominio: 152,
	agente: 296,
	tarefa: 384,
	rotulo: 462,
};

const TAMANHO = {
	nucleo: 26,
	dominio: 14,
	agente: 6.5,
	tarefa: 3,
};

/** Momento de entrada de cada camada, em frames a 30fps. */
const TEMPO = {
	nucleo: 0,
	dominioBase: 14,
	dominioPasso: 3,
	agenteBase: 30,
	agentePasso: 1.6,
	tarefaBase: 54,
	tarefaPasso: 0.9,
};

/** Ruído determinístico em [-1, 1] a partir de uma semente estável. */
const ruido = (semente: string): number => random(semente) * 2 - 1;

const limitar = (valor: number, minimo: number, maximo: number): number =>
	Math.min(maximo, Math.max(minimo, valor));

export interface OpcoesLayout {
	largura: number;
	altura: number;
	/** Posição vertical do centro, de 0 a 1. */
	centroY?: number;
	/** Multiplicador dos raios. 1 = calibrado para 1080 de largura. */
	escala?: number;
	fps?: number;
}

export const montarGrafo = ({
	largura,
	altura,
	centroY = 0.5,
	escala = 1,
	fps = 30,
}: OpcoesLayout): Grafo => {
	const cx = largura / 2;
	const cy = altura * centroY;
	const t = fps / 30;

	const nos: NoGrafo[] = [];
	const arestas: ArestaGrafo[] = [];
	const rotulos: RotuloDominio[] = [];

	const {nucleo, dominios} = estrutura;

	nos.push({
		id: nucleo.id,
		tipo: 'nucleo',
		nome: nucleo.nome,
		x: cx,
		y: cy,
		raio: TAMANHO.nucleo * escala,
		cor: nucleo.cor,
		paiId: null,
		entrada: TEMPO.nucleo * t,
	});

	const fatia = TAU / dominios.length;
	// Começa no topo, como no diagrama de referência.
	const anguloInicial = -TAU / 4;

	dominios.forEach((dominio, indiceDominio) => {
		const anguloDominio = anguloInicial + fatia * indiceDominio;
		const raioDominio = RAIO.dominio * escala;
		const xDominio = cx + Math.cos(anguloDominio) * raioDominio;
		const yDominio = cy + Math.sin(anguloDominio) * raioDominio;
		const entradaDominio = (TEMPO.dominioBase + TEMPO.dominioPasso * indiceDominio) * t;

		nos.push({
			id: dominio.id,
			tipo: 'dominio',
			nome: dominio.nome,
			x: xDominio,
			y: yDominio,
			raio: TAMANHO.dominio * escala,
			cor: dominio.cor,
			paiId: nucleo.id,
			entrada: entradaDominio,
		});

		arestas.push({
			id: `${nucleo.id}->${dominio.id}`,
			x1: cx,
			y1: cy,
			x2: xDominio,
			y2: yDominio,
			cor: dominio.cor,
			entrada: entradaDominio,
		});

		// O rótulo fica além da nuvem de nós, preso dentro da margem da tela.
		const margem = 24 * escala;
		const raioRotulo = RAIO.rotulo * escala;
		const xRotuloBruto = cx + Math.cos(anguloDominio) * raioRotulo;
		const yRotuloBruto = cy + Math.sin(anguloDominio) * raioRotulo;
		rotulos.push({
			id: dominio.id,
			nome: dominio.nome,
			subtitulo: dominio.subtitulo,
			cor: dominio.cor,
			x: limitar(xRotuloBruto, margem + 130 * escala, largura - margem - 130 * escala),
			y: limitar(yRotuloBruto, margem + 40 * escala, altura - margem - 40 * escala),
			entrada: entradaDominio + 4 * t,
		});

		const agentes = dominio.agentes;
		const aberturaAgentes = fatia * 0.62;
		const passoAgente =
			agentes.length > 1 ? aberturaAgentes / (agentes.length - 1) : aberturaAgentes;

		agentes.forEach((agente, indiceAgente) => {
			const desvio =
				agentes.length > 1
					? -aberturaAgentes / 2 + passoAgente * indiceAgente
					: 0;
			const anguloAgente =
				anguloDominio + desvio + ruido(`${agente.id}-ang`) * 0.018;
			const raioAgente =
				(RAIO.agente + ruido(`${agente.id}-raio`) * 16) * escala;
			const xAgente = cx + Math.cos(anguloAgente) * raioAgente;
			const yAgente = cy + Math.sin(anguloAgente) * raioAgente;
			const entradaAgente =
				(TEMPO.agenteBase +
					TEMPO.agentePasso * (indiceDominio * agentes.length + indiceAgente)) *
				t;

			nos.push({
				id: agente.id,
				tipo: 'agente',
				nome: agente.nome,
				x: xAgente,
				y: yAgente,
				raio: TAMANHO.agente * escala,
				cor: dominio.cor,
				paiId: dominio.id,
				entrada: entradaAgente,
			});

			arestas.push({
				id: `${dominio.id}->${agente.id}`,
				x1: xDominio,
				y1: yDominio,
				x2: xAgente,
				y2: yAgente,
				cor: dominio.cor,
				entrada: entradaAgente,
			});

			const tarefas = agente.tarefas;
			const aberturaTarefas = Math.min(passoAgente * 0.8, 0.2);
			const passoTarefa =
				tarefas.length > 1 ? aberturaTarefas / (tarefas.length - 1) : 0;

			tarefas.forEach((tarefa, indiceTarefa) => {
				const semente = `${agente.id}-${indiceTarefa}`;
				const desvioTarefa =
					tarefas.length > 1
						? -aberturaTarefas / 2 + passoTarefa * indiceTarefa
						: 0;
				const anguloTarefa =
					anguloAgente + desvioTarefa + ruido(`${semente}-ang`) * 0.02;
				const raioTarefa =
					(RAIO.tarefa + ruido(`${semente}-raio`) * 34) * escala;
				const xTarefa = cx + Math.cos(anguloTarefa) * raioTarefa;
				const yTarefa = cy + Math.sin(anguloTarefa) * raioTarefa;
				const entradaTarefa =
					entradaAgente + (TEMPO.tarefaBase - TEMPO.agenteBase) * t +
					TEMPO.tarefaPasso * indiceTarefa * t;

				nos.push({
					id: semente,
					tipo: 'tarefa',
					nome: tarefa,
					x: xTarefa,
					y: yTarefa,
					raio: TAMANHO.tarefa * escala,
					cor: dominio.cor,
					paiId: agente.id,
					entrada: entradaTarefa,
				});

				arestas.push({
					id: `${agente.id}->${semente}`,
					x1: xAgente,
					y1: yAgente,
					x2: xTarefa,
					y2: yTarefa,
					cor: dominio.cor,
					entrada: entradaTarefa,
				});
			});
		});
	});

	return {
		nos,
		arestas,
		rotulos,
		totalAgentes: dominios.reduce((soma, d) => soma + d.agentes.length, 0),
		totalDominios: dominios.length,
	};
};
