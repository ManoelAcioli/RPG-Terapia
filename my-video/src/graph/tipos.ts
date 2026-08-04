export interface Agente {
	id: string;
	nome: string;
	entrega: string;
	tarefas: string[];
}

export interface Dominio {
	id: string;
	nome: string;
	subtitulo: string;
	cor: string;
	papel: string;
	agentes: Agente[];
}

export interface Nucleo {
	id: string;
	nome: string;
	papel: string;
	cor: string;
}

export interface Estrutura {
	titulo: string;
	subtitulo: string;
	nucleo: Nucleo;
	dominios: Dominio[];
}

export type TipoNo = 'nucleo' | 'dominio' | 'agente' | 'tarefa';

export interface NoGrafo {
	id: string;
	tipo: TipoNo;
	nome: string;
	x: number;
	y: number;
	raio: number;
	cor: string;
	paiId: string | null;
	/** Frame em que o nó começa a entrar. */
	entrada: number;
}

export interface ArestaGrafo {
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	cor: string;
	entrada: number;
}

export interface RotuloDominio {
	id: string;
	nome: string;
	subtitulo: string;
	cor: string;
	x: number;
	y: number;
	entrada: number;
}

export interface Grafo {
	nos: NoGrafo[];
	arestas: ArestaGrafo[];
	rotulos: RotuloDominio[];
	totalAgentes: number;
	totalDominios: number;
}
