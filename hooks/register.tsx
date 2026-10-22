import type { EngineInterface, Register, TurnUsage } from 'claude-code'

import type { Dia } from '../types'

const HOJE = { plugin: 'claude-ta-com-sede', key: 'hoje' } as const
const IS_HIDDEN = { plugin: 'claude-ta-com-sede', key: 'isHidden' } as const

// Taxa inventada: 1 ml a cada 1.000 tokens. Cache lido custa 1/10.
const ML_POR_TOKEN = 1 / 1000

const MARCOS: [number, string][] = [
  [50, 'um gole'],
  [250, 'um copo'],
  [500, 'uma garrafinha'],
  [2000, 'uma garrafa de 2 L'],
  [10000, 'um galão de água'],
  [80000, 'um banho de 8 minutos'],
  [150000, 'uma banheira cheia'],
  [Infinity, 'uma piscina infantil'],
]

const comparar = (ml: number) => (MARCOS.find(([limite]) => ml < limite) ?? MARCOS[MARCOS.length - 1]!)[1]

const formatar = (ml: number) => (ml < 1000 ? `${Math.round(ml)} ml` : `${(ml / 1000).toFixed(2)} L`)

const mlDe = (u: TurnUsage) =>
  (u.input_tokens + u.output_tokens + u.cache_creation_input_tokens + u.cache_read_input_tokens / 10) * ML_POR_TOKEN

const dataDe = (ms: number) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// O store é um só para todas as sessões; cada sessão copia dele o total do dia.
const sincronizar = async ($: EngineInterface) => {
  const salvo = (await $.store.get('hoje')) as Dia | undefined
  const data = dataDe(await $.clock.now())
  const dia: Dia = salvo?.data === data ? salvo : { data, ml: 0 }
  const { value: atual } = await $.state.get(HOJE)
  if (atual?.data !== dia.data || atual.ml !== dia.ml) {
    await $.state.set(HOJE, dia)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await sincronizar($)
    // Pega o que outras sessões somaram enquanto esta está parada.
    $.clock.every(10000, () => sincronizar($))
    await $.command.register({ name: 'agua', description: 'Mostra/esconde o contador de água do dia' })

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    if (r.usage === null) {
      return r
    }

    const data = dataDe(await $.clock.now())
    // Outras sessões também somam no store; lê de lá para não perder o total.
    const salvo = (await $.store.get('hoje')) as Dia | undefined
    const antes = salvo?.data === data ? salvo.ml : 0
    const dia: Dia = { data, ml: antes + mlDe(r.usage) }
    await $.store.set('hoje', dia)
    await $.state.set(HOJE, dia)

    if (comparar(antes) !== comparar(dia.ml)) {
      $.ui.toast(`💧 Hoje você já gastou ${comparar(antes)} com o Claude.`)
    }

    return r
  })

  on('command.run', { command: 'agua' }, async $ => {
    await sincronizar($)
    const { value: dia } = await $.state.get(HOJE)
    const { value: isHidden = false } = await $.state.get(IS_HIDDEN)
    await $.state.set(IS_HIDDEN, !isHidden)
    const ml = dia?.ml ?? 0

    return { text: `💧 Hoje: ${formatar(ml)} (${comparar(ml)}). Valor fictício, só por humor.` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { value: dia } = await $.state.get(HOJE)
    const { value: isHidden } = await $.state.get(IS_HIDDEN)
    if (e.props.hasSurvey || !dia || dia.ml === 0 || isHidden) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>
          💧 Água gasta hoje com o Claude: {formatar(dia.ml)} ({comparar(dia.ml)})
        </Text>
      </Box>
    )
  })
}
