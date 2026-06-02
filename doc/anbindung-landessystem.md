# Anbindung Landessystem

Um ein weiteres Landessystem anbinden zu können, muss ein `Adapter` implementiert werden, der die Daten aus dem Landessystem in das Format der API übersetzt.
Bestehende Adapter beruhen auf der [Dienste-API von Schulconnex](https://schulconnex.de/docs/generated/openapi/dienste/schulconnex). Weitere Landessysteme auf Schulconnexbasis können daher einfach durch die Implementierung eines neuen Adapters angebunden werden.
