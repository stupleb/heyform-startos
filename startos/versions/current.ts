import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.8:0',
  releaseNotes: {
    en_US:
      'Updates HeyForm to 3.0.8: a REST API and an MCP server, reached with API keys each user creates in their account settings; workspaces can have several owners; forms can use choice matrix fields; and a cleared number field stays empty.',
    es_ES:
      'Actualiza HeyForm a 3.0.8: una API REST y un servidor MCP, a los que se accede con claves de API que cada usuario crea en la configuración de su cuenta; los espacios de trabajo pueden tener varios propietarios; los formularios pueden usar campos de matriz de opciones; y un campo numérico vaciado se queda vacío.',
    de_DE:
      'Aktualisiert HeyForm auf 3.0.8: eine REST-API und ein MCP-Server, erreichbar mit API-Schlüsseln, die jeder Nutzer in seinen Kontoeinstellungen erstellt; Arbeitsbereiche können mehrere Eigentümer haben; Formulare können Auswahlmatrix-Felder verwenden; und ein geleertes Zahlenfeld bleibt leer.',
    pl_PL:
      'Aktualizuje HeyForm do 3.0.8: REST API i serwer MCP, dostępne przez klucze API, które każdy użytkownik tworzy w ustawieniach konta; przestrzenie robocze mogą mieć kilku właścicieli; formularze mogą używać pól macierzy wyboru; a wyczyszczone pole liczbowe pozostaje puste.',
    fr_FR:
      "Met à jour HeyForm vers 3.0.8 : une API REST et un serveur MCP, accessibles avec des clés d'API que chaque utilisateur crée dans les paramètres de son compte ; les espaces de travail peuvent avoir plusieurs propriétaires ; les formulaires peuvent utiliser des champs de matrice de choix ; et un champ numérique vidé reste vide.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
