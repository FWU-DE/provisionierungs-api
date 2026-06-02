# Architektur

Das Projekt stellt eine API bereit, die Schulstrukturdaten aus verschiedenen Landessystemen verschiedenen Angeboten zur Verfügung stellt.
Die Anbindung der Angebote und die Anbindung der Landessystem sowie das Vereinheitlichen der Daten stehen im Vordergrund.

## Komponentenarchitektur

Das Projekt besteht aus zwei Komponenten:

- UI für das Freischalten einzelner Gruppen oder Schulen für ein Angebot
- API für den Datenabruf durch die Angebote und die Anbindung der Landessysteme

Das Projekt schließt sich an verschiedene Systeme an:

- VIDIS Angebots-API, um sicherzustellen, dass nur Angebote mit vorliegendem AVV Daten abrufen können
- VIDIS Keycloak, um die Authentifizierung der Angebote sicherzustellen und die Authentifizierung der UI zu realisieren
- Landessysteme als Datenquelle
- Angebote als Datenbeziehende

![](https://kroki.io/plantuml/svg/eNqFk89Kw0AQxu_7FKOeA1WKSA9ipRWKRUOrvYjIJDttl2x3w_6pqPg2vokv5iRNbSyie1iyu7_5Zr4ZcuEDuhBXWhxImitDMEyfRjdXk356P0nHQzjqYqeTnbWfL28ng-GEXzrdk9NjIXyhTIkOV4B5sG4aXjQBPpO3KxKixLzABcHhbDQYTQ8BPayVVB7eBPDK7aq0hkxoALiml1xbLGqyaA6_o32zoMwGn_TTUY1jc4GlEu9CtALGaCTtQM3H9nOj1BZpVZ46u1ZeWaPIRbOoqfLnXeNGYsAMPccMmq8altm-gT1J-HbAlf-D3m_IuAHrjaMgSc45Tw-mJal8Sc6AJAdXjtQCMzJVP_ZrTh6WSkoyj7EKrqciRGSp80qxB5i5OCcD0UhYk_v84B46I5oGQRIZ3E6oB_0YllywmqvXjf4OTPRWcpovo_bBxSJEx91i9SaLqE3sSeY5eQ93tmBujZorJNdGWwNnejYDX3v3gbTecpW3at5_Jud1QUbyj_AFtacHiQ==)

## Prozess Freischalten eines Angebots

```mermaid
sequenceDiagram
  autonumber
  actor user as Benutzer

  box VIDIS
      participant vidisportal as VIDIS Portal
      participant angebotsapi as VIDIS Angebots-API
      participant keycloak as VIDIS Keycloak
  end

  box Provisionierung
      participant ui as Provisionierung UI
      participant api as Provisionierung API
  end

  user->>vidisportal: Angebot einrichten, AVV zeichnen
  vidisportal->>angebotsapi: Angebot für Schule aktivieren
  user->>ui: Freigaben einrichten
  ui->>api: Freigaben speichern
```

## Prozess Datenabruf durch Angebot

```mermaid
sequenceDiagram
  autonumber

  box Angebot
      participant angebot as Angebot
  end

  box VIDIS
      participant keycloak as VIDIS Keycloak
      participant angebotsapi as VIDIS Angebots-API
  end

  box Provisionierung
      participant api as Provisionierung API
  end

  box Landessystem
      participant land as Strukturdaten-API
  end

  angebot->>keycloak: Access Token beziehen
  angebot->>+api: Daten abrufen
  api->>keycloak: Access Token validieren
  api->>angebotsapi: AVV sicherstellen
  api->>land: Schulstrukturdaten abrufen
  api-->>-angebot: Schulstrukturdaten zurückliefern
```
