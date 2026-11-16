import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.7:0',
  releaseNotes: {
    en_US:
      'Updates HeyForm to 3.0.7: forms can take card payments through Stripe, choice options can be limited to a number of responses, responses can be archived, and respondents can request deletion of their response.',
    es_ES:
      'Actualiza HeyForm a 3.0.7: los formularios pueden cobrar con tarjeta a través de Stripe, las opciones de elección pueden limitarse a un número de respuestas, las respuestas pueden archivarse y quienes responden pueden pedir que se borre su respuesta.',
    de_DE:
      'Aktualisiert HeyForm auf 3.0.7: Formulare können Kartenzahlungen über Stripe annehmen, Auswahloptionen lassen sich auf eine Anzahl von Antworten begrenzen, Antworten können archiviert werden, und Antwortende können die Löschung ihrer Antwort beantragen.',
    pl_PL:
      'Aktualizuje HeyForm do 3.0.7: formularze mogą przyjmować płatności kartą przez Stripe, opcje wyboru można ograniczyć do liczby odpowiedzi, odpowiedzi można archiwizować, a respondenci mogą poprosić o usunięcie swojej odpowiedzi.',
    fr_FR:
      'Met à jour HeyForm vers 3.0.7 : les formulaires peuvent encaisser des paiements par carte via Stripe, les options de choix peuvent être limitées à un nombre de réponses, les réponses peuvent être archivées et les répondants peuvent demander la suppression de leur réponse.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
