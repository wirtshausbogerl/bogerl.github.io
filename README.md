# s'Bogerl – Website

Website des Wirtshaus s'Bogerl ([wirtshausbogerl.at](https://wirtshausbogerl.at)), gebaut mit [Hugo](https://gohugo.io).
Jede Änderung auf `main` wird automatisch gebaut und veröffentlicht (dauert ca. 1–2 Minuten, Status unter „Actions“).

## Was bearbeite ich wo?

| Was | Datei |
|---|---|
| Speisekarte | `data/speisekarte.yaml` |
| Getränkeempfehlungen, Partner-Logo | `data/getraenke.yaml` |
| Öffnungszeiten, warme Küche | `data/oeffnungszeiten.yaml` |
| Betriebsurlaub & Popups | `data/hinweise.yaml` |
| Team | `data/team.yaml` (Fotos in `assets/images/team/`) |
| Bewertungen | `data/bewertungen.yaml` |
| Texte der Startseite (inkl. Dialekt) | `content/_index.md` |
| Impressum / Datenschutz | `content/impressum.md`, `content/datenschutz.md` |
| Adresse, Telefon, E-Mail, Firmendaten | `hugo.toml` → `[params]` (gilt für alle Seiten) |
| Essensfotos der Slideshow | einfach Bilder in `assets/images/galerie/` legen oder löschen (Reihenfolge nach Dateiname) |

Bilder werden beim Bauen automatisch verkleinert – Originale können also in voller Größe hochgeladen werden.

## Betriebsurlaub eintragen

In `data/hinweise.yaml`:

```yaml
urlaub:
  - von: 2027-02-01
    bis: 2027-02-14
```

Der Hinweis bei den Öffnungszeiten und das Popup (ab 14 Tage vorher) erscheinen automatisch
und verschwinden nach dem letzten Urlaubstag von selbst.

## Lokal ansehen

```sh
hugo server
```

Dann <http://localhost:1313> öffnen.

## Einmalige Einrichtung auf GitHub

Settings → Pages → Build and deployment → **Source: GitHub Actions**.
Die eigene Domain steht in `static/CNAME` und muss zu `baseURL` in `hugo.toml` passen.
