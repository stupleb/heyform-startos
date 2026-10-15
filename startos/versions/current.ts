import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.4:0',
  releaseNotes: {
    en_US:
      'Updates HeyForm to 3.0.4, where links in forms open in a new tab and several answers can lead to the same question. Without SMTP, people who sign up go straight to their workspace.',
    es_ES:
      'Actualiza HeyForm a 3.0.4: los enlaces de los formularios se abren en una pestaña nueva y varias respuestas pueden llevar a la misma pregunta. Sin SMTP, quien se registra entra directamente en su espacio de trabajo.',
    de_DE:
      'Aktualisiert HeyForm auf 3.0.4: Links in Formularen öffnen sich in einem neuen Tab, und mehrere Antworten können zur selben Frage führen. Ohne SMTP gelangen neu Registrierte direkt in ihren Arbeitsbereich.',
    pl_PL:
      'Aktualizuje HeyForm do 3.0.4: linki w formularzach otwierają się w nowej karcie, a kilka odpowiedzi może prowadzić do tego samego pytania. Bez SMTP osoby, które się rejestrują, trafiają od razu do swojego obszaru roboczego.',
    fr_FR:
      "Met à jour HeyForm vers 3.0.4 : les liens des formulaires s'ouvrent dans un nouvel onglet et plusieurs réponses peuvent mener à la même question. Sans SMTP, les personnes qui s'inscrivent accèdent directement à leur espace de travail.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
