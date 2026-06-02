# Anbindung Angebot

Um ein Angebot Zugriff zu Schulstrukturdaten zu gewähren, müssen folgende Schritte durchgeführt werden:

**Angebot in VIDIS einrichten**

- OpenID-Client anlegen
  - client_credentials Grant für OpenID-Client aktivieren
  - Zugriff zu Scope `idm_api` gewähren
- Angebot in Angebots-API aufnehmen

**Freigaben einrichten**

Freigaben für die Schule oder einzelne Gruppen über die Provisionierungs-UI einrichten.

**Datenabruf durch Angebot**

- Access Token mit scope `idm_api` über client_credentials Grant beziehen
- Daten über API abrufen

Siehe auch [README](./README.md).
