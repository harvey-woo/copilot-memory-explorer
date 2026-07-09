<p align="center">
  <img src="media/marketplace-icon.png" alt="Logo" width="128" />
</p>

<h1 align="center">Copilot Memory Explorer</h1>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=cat5th.copilot-memory-explorer">
    <img src="https://img.shields.io/badge/VS%20Code-1.96%2B-blue?logo=visualstudiocode" alt="VS Code" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </a>
  <a href="https://github.com/harvey-woo/copilot-memory-explorer">
    <img src="https://img.shields.io/github/stars/harvey-woo/copilot-memory-explorer?style=social" alt="Stars" />
  </a>
  <br/>
  <a href="README.md">English</a> ·
  <a href="README.zh-cn.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

Durchsuchen und verwalten Sie GitHub Copilot-Speicherdateien mit der nativen VS Code-Oberfläche.

GitHub Copilot sammelt im Laufe von Gesprächen „Erinnerungen" – es zeichnet Ihren Projektkontext, Codierungspräferenzen, Architekturentscheidungen und andere langfristige Informationen auf. Diese Erinnerungen werden lokal als Markdown-Dateien gespeichert, aber es gibt keine integrierte Oberfläche, um sie zu durchsuchen oder zu verwalten.

**Copilot Memory Explorer** schließt diese Lücke: Es bietet eine native VS Code-Seitenleistenansicht, mit der Sie alle nach Chat-Sitzungen organisierten Copilot-Erinnerungen durchsuchen und verwalten können.

## Demo

<p align="center">
  <img src="docs/usage-demo.webp" alt="Nutzungsdemo" width="720" />
</p>

## Funktionen

- **Native TreeView** — Seitenleistenansicht mit nativen VS Code-Kontextmenüs
- **Sitzungsdurchsuchung** — Durchsuchen Sie alle Chat-Sitzungen mit Speichereinträgen
- **Dateibaum** — Rekursive Überprüfung von Sitzungsverzeichnissen, Anzeige von Dateien und Unterverzeichnissen
- **Markdown-Vorschau** — Klicken Sie auf eine Datei, um gerendertes Markdown im Vorschaufenster zu sehen
- **Bildvorschau** — Bilder im Vorschaufenster anzeigen
- **Kontextmenüs** — Rechtsklick zum Kopieren des Pfads, Anzeigen im Finder, Löschen oder Erstellen neuer Speicher
- **Sortierung** — Umschalten der Sortierung nach Name oder Datum über die Titelleiste der Ansicht
- **Neuer Speicher** — Erstellen Sie neue Speicherdateien direkt über die Seitenleiste

## Verwendung

1. Klicken Sie auf das **Copilot Memories**-Symbol in der Aktivitätsleiste
2. Durchsuchen Sie Sitzungen und erweitern Sie sie, um Speicherdateien anzuzeigen
3. Klicken Sie auf eine Datei, um sie im Editor und Vorschaufenster zu öffnen
4. Rechtsklick für Kontextmenüoptionen

## Anforderungen

- VS Code 1.96+
- GitHub Copilot (zum Generieren von Erinnerungen)

## Versionshinweise

Siehe [CHANGELOG.md](CHANGELOG.md) für den Versionsverlauf.

## Lizenz

[MIT](LICENSE)