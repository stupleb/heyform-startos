import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.5:0',
  releaseNotes: {
    en_US:
      'Updates HeyForm to 3.0.5: forms can email extra recipients on each submission, choice questions can branch on "Other" answers, and responses show the respondent\'s IP address. A new action stops HeyForm storing those addresses.',
    es_ES:
      'Actualiza HeyForm a 3.0.5: los formularios pueden avisar por correo a más destinatarios en cada envío, las preguntas de opción pueden ramificarse según las respuestas "Otro" y las respuestas muestran la dirección IP de quien responde. Una acción nueva hace que HeyForm deje de guardar esas direcciones.',
    de_DE:
      'Aktualisiert HeyForm auf 3.0.5: Formulare können bei jeder Einsendung weitere Empfänger per E-Mail benachrichtigen, Auswahlfragen können nach „Sonstiges“-Antworten verzweigen, und Antworten zeigen die IP-Adresse der antwortenden Person. Eine neue Aktion sorgt dafür, dass HeyForm diese Adressen nicht mehr speichert.',
    pl_PL:
      'Aktualizuje HeyForm do 3.0.5: formularze mogą powiadamiać e-mailem dodatkowych odbiorców o każdym zgłoszeniu, pytania wyboru mogą rozgałęziać się według odpowiedzi „Inne”, a odpowiedzi pokazują adres IP respondenta. Nowa akcja sprawia, że HeyForm przestaje zapisywać te adresy.',
    fr_FR:
      "Met à jour HeyForm vers 3.0.5 : les formulaires peuvent avertir par e-mail d'autres destinataires à chaque réponse, les questions à choix peuvent se ramifier selon les réponses « Autre » et les réponses affichent l'adresse IP du répondant. Une nouvelle action empêche HeyForm d'enregistrer ces adresses.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
