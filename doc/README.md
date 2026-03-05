# Benutzerdokumentation

Das Projekt besteht aus zwei Teilen:

1. Einer API auf Basis von Schulconnex, welche mehrere Heimatorganisationen unter eine API zusammenfasst.
2. Einer Oberfläche, in der Schulleitungen einrichten können, welche Daten an welches Angebot übertragen werden

## API

Die API basiert auf der [Dienste-API von Schulconnex](https://schulconnex.de/docs/generated/openapi/dienste/schulconnex).
Die API ist unter https://ssd.vidis.schule/schulconnex/v1 erreichbar.

### Authentifizierung

Die API ist durch ein Bearer-Token geschützt.
Ein Token erhält man über den client_credentials Grant.
Dazu muss der Scope `idm_api` angefragt werden.
Der Autorisierungsserver ist [VIDIS](https://aai.vidis.schule/auth/realms/vidis/.well-known/openid-configuration).

### Beispielanfrage

```
GET /schulconnex/v1/personen-info?vollstaendig=personenkontexte,personen,gruppen&organisation.id=8e0289a5-b841-43ff-a394-ea1eee19c3dc HTTP/1.1
Host: ssd.vidis.schule
Authorization: Bearer $TOKEN


HTTP/1.1 200 OK
ETag: W/"1.h5vj8mcu3g"
Content-Type: application/json; charset=utf-8
```

```json
[
  {
    "pid": "5c08b773-3df8-3f36-85fb-d1dbe6ac1249",
    "person": {
      "name": {
        "initialenfamilienname": "W",
        "initialenvorname": "J"
      }
    },
    "personenkontexte": [
      {
        "id": "cd8ac299-4497-3d8d-9bd7-a3b202cf7aa7",
        "organisation": {
          "id": "8e0289a5-b841-43ff-a394-ea1eee19c3dc"
        },
        "gruppen": [
          {
            "gruppe": {
              "id": "019b0d05-52ae-7903-80a7-9b012ca39fa8",
              "orgid": "8e0289a5-b841-43ff-a394-ea1eee19c3dc",
              "bezeichnung": "5c",
              "typ": "Klasse",
              "jahrgangsstufen": ["05"],
              "faecher": [],
              "laufzeit": {
                "von": "2025-08-01",
                "bis": "2026-07-31"
              }
            }
          },
          {
            "gruppe": {
              "id": "019b03f6-b0fe-71eb-b98f-9c84d6846868",
              "orgid": "8e0289a5-b841-43ff-a394-ea1eee19c3dc",
              "bezeichnung": "Test01",
              "typ": "Kurs",
              "jahrgangsstufen": ["06", "05"],
              "faecher": [
                {
                  "bezeichnung": "Mathematik"
                }
              ],
              "laufzeit": {
                "von": "2025-08-01",
                "bis": "2026-07-31"
              }
            }
          }
        ]
      }
    ]
  },
  ...
]
```

## Oberfläche

Die Oberfläche ist unter https://strukturdaten.vidis.schule erreichbar.
Die Anmeldung erfolgt über VIDIS.

In der Oberfläche kann eingestellt werden, welche Daten an welches Angebot übertragen werden sollen.
