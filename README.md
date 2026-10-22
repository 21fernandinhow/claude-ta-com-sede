# claude-ta-com-sede 💧

Um mod de humor para o Claude Code. Ele mostra quanta água você "gastou" hoje com o Claude.

```
💧 Água gasta hoje com o Claude: 1.24 L (uma garrafa de 2 L)
```

- Soma os tokens de cada resposta do modelo e converte para ml.
- Guarda o total do dia entre sessões e zera no dia seguinte.
- Mostra um aviso a cada nível: gole, copo, garrafinha, garrafa de 2 L, galão, banho, banheira, piscina infantil.
- `/agua` mostra o total e liga ou desliga a linha.

> **Valor fictício.** A taxa é 1 ml a cada 1.000 tokens (cache lido vale 1/10). As estimativas públicas vão de ~0,3 ml a ~50 ml por 1.000 tokens, conforme o que cada estudo conta. Mude `ML_POR_TOKEN` em `hooks/register.tsx` se quiser.

## Instalar

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install claude-ta-com-sede --marketplace 21fernandinhow/claude-ta-com-sede
```

Responda `y` para adicionar o marketplace e escolha o escopo.

Num shell:

```bash
claude plugin install claude-ta-com-sede --marketplace 21fernandinhow/claude-ta-com-sede
```

Versões antigas da CLI não têm a opção `--marketplace`. Nelas, instale em dois passos:

```bash
claude plugin marketplace add 21fernandinhow/claude-ta-com-sede
claude plugin install claude-ta-com-sede@claude-ta-com-sede
```

No app desktop, onde `/plugin` não funciona: clique em **+** ao lado da caixa de prompt, depois **Plugins**, **Add marketplace** com `21fernandinhow/claude-ta-com-sede`, e então **Add plugin**.
