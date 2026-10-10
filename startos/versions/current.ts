import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.3:2',
  releaseNotes: {
    en_US:
      "Open UI opens HeyForm at its primary URL, the address you sign in at. If that address stops working, HeyForm switches to another of its addresses until it's back.",
    es_ES:
      'Abrir UI abre HeyForm en su URL principal, la dirección en la que se inicia sesión. Si esa dirección deja de funcionar, HeyForm pasa a otra de sus direcciones hasta que vuelva.',
    de_DE:
      '„UI öffnen“ öffnet HeyForm unter seiner primären URL, der Adresse, unter der Sie sich anmelden. Funktioniert diese Adresse nicht mehr, wechselt HeyForm zu einer seiner anderen Adressen, bis sie wieder verfügbar ist.',
    pl_PL:
      'Otwórz UI otwiera HeyForm pod jego głównym adresem URL, pod którym się logujesz. Jeśli ten adres przestanie działać, HeyForm przełącza się na inny ze swoich adresów, dopóki nie wróci.',
    fr_FR:
      "Ouvrir UI ouvre HeyForm à son URL principale, l'adresse où vous vous connectez. Si cette adresse cesse de fonctionner, HeyForm passe à une autre de ses adresses jusqu'à son retour.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
