import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.3:1',
  releaseNotes: {
    en_US:
      'Configure Stripe shows the addresses to enter in Stripe under the fields they go with, and says which Stripe setup it needs.',
    es_ES:
      'La acción Configurar Stripe muestra las direcciones que hay que introducir en Stripe bajo los campos a los que corresponden, e indica qué configuración de Stripe necesita.',
    de_DE:
      'Die Aktion „Stripe konfigurieren“ zeigt die Adressen für Stripe unter den Feldern, zu denen sie gehören, und nennt die nötige Stripe-Einrichtung.',
    pl_PL:
      'Akcja Skonfiguruj Stripe pokazuje adresy do wpisania w Stripe pod polami, których dotyczą, i podaje, jakiej konfiguracji Stripe wymaga.',
    fr_FR:
      "L'action Configurer Stripe affiche les adresses à saisir dans Stripe sous les champs correspondants et indique la configuration Stripe requise.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
