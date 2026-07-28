export type Stance = 'raiva' | 'medo' | 'frieza' | 'ternura';
export type Form = 'furia' | 'nevoa' | 'arquivo' | 'ferida';
export type VoiceId = 'medo' | 'raiva' | 'cetico' | 'ternura' | 'culpa';
export type Ending = 'perceber' | 'repetir' | 'partir';

export type SpeakerId =
  | 'kairoon'
  | 'eco'
  | 'voz-medo'
  | 'voz-raiva'
  | 'voz-cetico'
  | 'voz-ternura'
  | 'voz-culpa'
  | 'pergunta';

export interface State {
  cycle: number;
  stance1?: Stance;
  form2?: Form;
  voices: VoiceId[];
  flags: Set<string>;
  ending?: Ending;
}

export function newState(): State {
  return { cycle: 1, voices: [], flags: new Set() };
}

export function addVoice(s: State, v: VoiceId): void {
  if (!s.voices.includes(v)) s.voices.push(v);
}

export const ACCENTS: Record<Form, string> = {
  furia: '#e05545',
  nevoa: '#8fb6c8',
  arquivo: '#d9a441',
  ferida: '#9d6bd6',
};

export const VOICE_COLORS: Record<VoiceId, string> = {
  medo: '#8fb6c8',
  raiva: '#e05545',
  cetico: '#d9a441',
  ternura: '#b07fd8',
  culpa: '#7fa88f',
};

export const SPEAKER_META: Record<SpeakerId, { label: string; cls: string }> = {
  kairoon: { label: 'K A I R O O N', cls: 'sp-kairoon' },
  eco: { label: 'O ECO', cls: 'sp-eco' },
  'voz-medo': { label: 'A Voz do Medo', cls: 'sp-medo' },
  'voz-raiva': { label: 'A Voz da Raiva', cls: 'sp-raiva' },
  'voz-cetico': { label: 'A Voz do Cético', cls: 'sp-cetico' },
  'voz-ternura': { label: 'A Voz da Ternura', cls: 'sp-ternura' },
  'voz-culpa': { label: 'A Voz da Culpa', cls: 'sp-culpa' },
  pergunta: { label: '', cls: 'sp-pergunta' },
};
