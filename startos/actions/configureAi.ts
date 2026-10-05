import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

const inputSpec = InputSpec.of({
  ai: Value.union({
    name: i18n('AI Features'),
    description: i18n(
      "Create forms from a description and translate forms, using any service that speaks OpenAI's API: OpenAI itself, or Ollama or llama.cpp on this server.",
    ),
    default: 'disabled',
    variants: Variants.of({
      disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
      enabled: {
        name: i18n('Enabled'),
        spec: InputSpec.of({
          baseUrl: Value.text({
            name: i18n('API URL'),
            description: i18n(
              'The base URL of the OpenAI-compatible API, usually ending in /v1. For a service on this server, copy its HTTPS address from its Interfaces page.',
            ),
            required: true,
            default: 'https://api.openai.com/v1',
            patterns: [
              {
                regex: '^https?://.+',
                description: i18n('Must start with http:// or https://'),
              },
            ],
          }),
          apiKey: Value.text({
            name: i18n('API Key'),
            description: i18n(
              'Leave empty for a local service that needs no key.',
            ),
            required: false,
            default: null,
            masked: true,
          }),
          model: Value.text({
            name: i18n('Model'),
            description: i18n(
              'The model name exactly as the service lists it. It must be able to return JSON.',
            ),
            required: true,
            default: null,
          }),
        }),
      },
    }),
  }),
})

export const configureAi = sdk.Action.withInput(
  'configure-ai',

  async ({ effects }) => ({
    name: i18n('Configure AI'),
    description: i18n(
      "Turn on HeyForm's AI form builder and form translation by connecting an OpenAI-compatible service. HeyForm restarts to apply it.",
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Integrations'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const ai = await storeJson.read((s) => s.ai).once()
    return {
      ai: ai
        ? { selection: 'enabled' as const, value: ai }
        : { selection: 'disabled' as const, value: {} },
    }
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, {
      ai:
        input.ai.selection === 'enabled'
          ? {
              baseUrl: input.ai.value.baseUrl.trim().replace(/\/+$/, ''),
              apiKey: input.ai.value.apiKey?.trim() ?? '',
              model: input.ai.value.model.trim(),
            }
          : null,
    }),
)
