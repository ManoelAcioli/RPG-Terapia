// Motor mínimo de visual novel: um grafo de nós com falas sequenciais,
// escolhas condicionais e efeitos sobre um estado compartilhado.

export type Stance = 'raiva' | 'medo' | 'frieza' | 'ternura';
export type Form = 'furia' | 'nevoa' | 'arquivo' | 'ferida';
export type VoiceId = 'medo' | 'raiva' | 'cetico' | 'ternura' | 'culpa';

export interface State {
  cycle: number;
  stance1?: Stance;
  form2?: Form;
  voices: VoiceId[];
  flags: Set<string>;
  ending?: 'perceber' | 'repetir' | 'partir';
}

export function newState(): State {
  return { cycle: 1, voices: [], flags: new Set() };
}

export function addVoice(s: State, v: VoiceId): void {
  if (!s.voices.includes(v)) s.voices.push(v);
}

export type Speaker =
  | 'kairoon'
  | 'eco'
  | 'voz-medo'
  | 'voz-raiva'
  | 'voz-cetico'
  | 'voz-ternura'
  | 'voz-culpa'
  | 'pergunta' // o momento híbrido: pergunta aberta, sem resposta
  | undefined; // narração

export interface Line {
  who?: Speaker;
  text: string | ((s: State) => string);
}

export interface Choice {
  label: string | ((s: State) => string);
  goto: string;
  if?: (s: State) => boolean;
  effect?: (s: State) => void;
}

export interface Node {
  id: string;
  art?: string; // chave para o renderizador (mantém a anterior se ausente)
  enter?: (s: State) => void;
  lines: Line[];
  choices?: Choice[];
  next?: string | ((s: State) => string); // usado quando não há escolhas
}

export interface Script {
  start: string;
  nodes: Record<string, Node>;
}

export const SPEAKER_META: Record<
  Exclude<Speaker, undefined>,
  { label: string; cls: string }
> = {
  kairoon: { label: 'K A I R O O N', cls: 'sp-kairoon' },
  eco: { label: 'O ECO', cls: 'sp-eco' },
  'voz-medo': { label: 'A Voz do Medo', cls: 'sp-medo' },
  'voz-raiva': { label: 'A Voz da Raiva', cls: 'sp-raiva' },
  'voz-cetico': { label: 'A Voz do Cético', cls: 'sp-cetico' },
  'voz-ternura': { label: 'A Voz da Ternura', cls: 'sp-ternura' },
  'voz-culpa': { label: 'A Voz da Culpa', cls: 'sp-culpa' },
  pergunta: { label: '', cls: 'sp-pergunta' },
};

// Valida o grafo: todo goto/next aponta para nó existente; nós sem saída
// precisam ser finais explícitos (flag em endings).
export function lintScript(script: Script, endings: string[]): string[] {
  const errors: string[] = [];
  const ids = new Set(Object.keys(script.nodes));
  if (!ids.has(script.start)) errors.push(`start "${script.start}" não existe`);
  for (const node of Object.values(script.nodes)) {
    const targets: string[] = [];
    if (typeof node.next === 'string') targets.push(node.next);
    for (const c of node.choices ?? []) targets.push(c.goto);
    for (const t of targets) {
      if (!ids.has(t)) errors.push(`${node.id}: goto/next para nó inexistente "${t}"`);
    }
    const hasExit =
      node.next !== undefined || (node.choices !== undefined && node.choices.length > 0);
    if (!hasExit && !endings.includes(node.id)) {
      errors.push(`${node.id}: sem saída e não está listado como final`);
    }
  }
  return errors;
}
