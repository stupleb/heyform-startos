import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.0.4:1',
  releaseNotes: {
    en_US:
      'Stops trusting certificates from a compromised certificate authority (eMudhra). Adds Forward Email to the SMTP provider presets.',
    es_ES:
      'Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra). Añade Forward Email a los proveedores SMTP predefinidos.',
    de_DE:
      'Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr. Fügt Forward Email zu den vordefinierten SMTP-Anbietern hinzu.',
    pl_PL:
      'Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra). Dodaje Forward Email do predefiniowanych dostawców SMTP.',
    fr_FR:
      "Ne fait plus confiance aux certificats d'une autorité de certification compromise (eMudhra). Ajoute Forward Email aux fournisseurs SMTP prédéfinis.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
