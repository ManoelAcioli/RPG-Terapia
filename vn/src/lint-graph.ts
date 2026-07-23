// Valida o grafo narrativo: gotos válidos, becos sem saída, alcançabilidade.
import { lintScript, newState, State } from './engine';
import { script, ENDINGS } from './script';

const errors = lintScript(script, ENDINGS);

// alcançabilidade: BFS considerando todos os valores possíveis de next(fn)
const FORMS = ['furia', 'nevoa', 'arquivo', 'ferida'] as const;
const reached = new Set<string>();
const queue = [script.start];
while (queue.length) {
  const id = queue.shift()!;
  if (reached.has(id)) continue;
  reached.add(id);
  const node = script.nodes[id];
  if (!node) continue;
  const targets: string[] = [];
  if (typeof node.next === 'string') targets.push(node.next);
  if (typeof node.next === 'function') {
    for (const f of FORMS) {
      const s: State = { ...newState(), form2: f };
      targets.push(node.next(s));
    }
  }
  for (const c of node.choices ?? []) targets.push(c.goto);
  queue.push(...targets);
}
for (const id of Object.keys(script.nodes)) {
  if (!reached.has(id)) errors.push(`nó inalcançável: ${id}`);
}
for (const e of ENDINGS) {
  if (!reached.has(e)) errors.push(`final inalcançável: ${e}`);
}

if (errors.length) {
  console.error('GRAFO INVÁLIDO:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(
  `grafo ok: ${Object.keys(script.nodes).length} nós, ${ENDINGS.length} finais, todos alcançáveis`
);
