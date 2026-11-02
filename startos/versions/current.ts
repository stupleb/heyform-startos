import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.6:0',
  releaseNotes: {
    en_US:
      'Updates HeyForm to 3.0.6: respondents can submit forms that include a file upload, and form notifications gain reply-to and subject options.',
    es_ES:
      'Actualiza HeyForm a 3.0.6: quien responde puede enviar formularios que incluyen la subida de un archivo, y las notificaciones del formulario incorporan opciones de dirección de respuesta y de asunto.',
    de_DE:
      'Aktualisiert HeyForm auf 3.0.6: Antwortende können Formulare mit einem Datei-Upload absenden, und Formularbenachrichtigungen erhalten Optionen für Antwortadresse und Betreff.',
    pl_PL:
      'Aktualizuje HeyForm do 3.0.6: respondenci mogą wysyłać formularze z przesyłanym plikiem, a powiadomienia formularza zyskują opcje adresu do odpowiedzi i tematu.',
    fr_FR:
      "Met à jour HeyForm vers 3.0.6 : les répondants peuvent envoyer des formulaires comportant un fichier joint, et les notifications du formulaire gagnent des options d'adresse de réponse et d'objet.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
