# Marktzettel

Gemeinsame Einkaufsliste und Rezeptsammlung für euren Haushalt. Läuft als
kostenlose Web-App über GitHub Pages, synchronisiert über Firebase und
schickt echte Push-Benachrichtigungen, wenn jemand anderes etwas ändert –
auch wenn die App gerade geschlossen ist.

Diese Anleitung führt einmalig durch die Einrichtung. Danach reicht es,
die Seite auf euren Handys zu öffnen.

## Was du brauchst

- Einen kostenlosen Google-Account für Firebase
- Eine Kreditkarte, um den Firebase-Tarif auf "Blaze" umzustellen (nötig
  für Cloud Functions / echte Push-Benachrichtigungen). Bei der Nutzung
  durch zwei bis wenige Personen bleiben die Kosten bei 0 €, der
  kostenlose Kontingent-Anteil ("Spark"-Grenzen) wird nicht annähernd
  ausgeschöpft.
- Node.js auf deinem Rechner, um die Firebase CLI einmalig auszuführen

## 1. Firebase-Projekt anlegen

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
   und klicke auf "Projekt hinzufügen".
2. Name frei wählbar, z. B. "Marktzettel". Google Analytics kannst du
   abwählen, wird nicht gebraucht.
3. Warte, bis das Projekt erstellt ist.

## 2. Web-App im Projekt registrieren

1. Im Projekt-Dashboard auf das Symbol **`</>`** ("Web-App hinzufügen")
   klicken.
2. App-Spitzname z. B. "Marktzettel Web". Firebase Hosting **nicht**
   aktivieren (wir nutzen GitHub Pages).
3. Firebase zeigt dir jetzt ein `firebaseConfig`-Objekt mit `apiKey`,
   `authDomain`, `projectId` usw. Trage genau diese Werte in die Datei
   **`config.js`** in diesem Repo ein (Feld `firebase: {...}`).

## 3. Firestore aktivieren

1. Im linken Menü **Build → Firestore Database → Datenbank erstellen**.
2. Standort wählen (z. B. `eur3 (europe-west)`), Produktionsmodus lassen.
3. Die Sicherheitsregeln liefert dieses Repo mit (`firestore.rules`) und
   werden in Schritt 6 automatisch hochgeladen.

## 4. Cloud Messaging (Push) einrichten

1. Im linken Menü **Build → Cloud Messaging** bzw. **Projekteinstellungen
   → Cloud Messaging**.
2. Unter "Web-Push-Zertifikate" auf **Schlüsselpaar generieren** klicken.
3. Den angezeigten Schlüssel in `config.js` bei `vapidKey` eintragen.

## 5. Auf den Blaze-Tarif umstellen

1. Unten links in der Firebase-Konsole auf "Tarif upgraden" bzw. das
   Spark-Symbol klicken, **Blaze** wählen, Kreditkarte hinterlegen.
2. Das ist nur nötig, damit Cloud Functions laufen dürfen (Firebase
   verlangt hierfür ein aktives Billing-Konto, auch wenn du im
   kostenlosen Kontingent bleibst). Du kannst optional in der Google
   Cloud Console ein Budget-Alarm bei z. B. 1 € einrichten, um sicher zu
   gehen.

## 6. Firebase CLI: Regeln und Cloud Function hochladen

Auf deinem Rechner, im geklonten Repo-Ordner:

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # das eben angelegte Projekt auswählen
```

Trage die angezeigte Projekt-ID auch in `.firebaserc` ein (Feld
`"default"`), falls `firebase use --add` sie nicht automatisch
übernommen hat.

```bash
cd functions
npm install
cd ..
firebase deploy --only firestore:rules,functions
```

Das lädt die Sicherheitsregeln und die Cloud Function hoch, die bei
jeder Änderung eine Push-Benachrichtigung verschickt.

## 7. GitHub Pages aktivieren

1. Im GitHub-Repo unter **Settings → Pages**.
2. Bei "Build and deployment" → Branch **main** und Ordner **/(root)**
   auswählen, speichern.
3. Nach ein paar Minuten ist die Seite unter
   `https://bravour27spaltung.github.io/marktzettel/` erreichbar.

Denk daran, `config.js` mit deinen echten Werten aus Schritt 2 und 4
vorher zu committen und zu pushen – ohne die echten Werte läuft die App
nur lokal auf einem Gerät, ohne Sync und ohne Benachrichtigungen.

## 8. Auf beiden Handys einrichten

1. Die GitHub-Pages-URL öffnen.
2. Eine Person tippt auf "Neuen Haushalt anlegen" und bekommt einen Code
   angezeigt (z. B. `AB3K9XZ2`) – diesen Code der zweiten Person geben
   (WhatsApp, SMS, mündlich).
3. Die zweite Person tippt auf "Bestehendem Haushalt beitreten" und gibt
   den Code ein.
4. Beide geben ihren eigenen Namen ein (erscheint als "von …" bei
   Einträgen).
5. **Zum Home-Bildschirm hinzufügen** (wichtig für Push-Benachrichtigungen
   auf dem iPhone, siehe unten):
   - iPhone/Safari: Teilen-Symbol → "Zum Home-Bildschirm"
   - Android/Chrome: Menü (⋮) → "Zum Startbildschirm hinzufügen" bzw.
     "App installieren"
6. In den Einstellungen der App (Symbol oben rechts) auf
   **Benachrichtigungen aktivieren** tippen und die Berechtigung
   erlauben.

### Wichtige Einschränkung auf dem iPhone

Web-Push funktioniert in Safari **nur**, wenn die Seite zuvor über "Zum
Home-Bildschirm hinzufügen" installiert wurde (ab iOS 16.4), und nur,
wenn ihr sie von dort aus öffnet – nicht direkt im Safari-Tab. Ohne
Installation erscheint der Button "Benachrichtigungen aktivieren" zwar,
die Berechtigung schlägt aber fehl oder es kommen keine
Benachrichtigungen an.

## Wie der Sync funktioniert

Es gibt kein klassisches Login. Stattdessen teilen sich alle Geräte
eines Haushalts einen zufälligen, achtstelligen Code. Alle Daten liegen
in Firestore unter `households/<euer-code>/…`. Wer den Code kennt, kann
lesen und schreiben (siehe `firestore.rules`) – das ist bewusst simpel
gehalten für eine private Liste zwischen wenigen vertrauten Personen.
Gib den Code nicht öffentlich weiter und teile ihn nur mit Personen, die
mitschreiben dürfen sollen.

### Mehrere Listen pro Haushalt

Ein Haushalt kann mehrere Einkaufslisten haben (z. B. "Wocheneinkauf" und
"Drogerie"). Jede Liste liegt unter
`households/<code>/lists/<listId>/items/…` und hat eigene Artikel;
Rezepte, Kategorien und Geräte gelten dagegen für den ganzen Haushalt und
werden von allen Listen gemeinsam genutzt. Über den Button mit dem
Listennamen oben auf der Einkaufsseite lassen sich Listen anlegen,
umbenennen, sortieren, archivieren und (nur archivierte) endgültig
löschen.

Bestehende Haushalte, die noch Artikel in der alten, flachen Struktur
(`households/<code>/items/…`) hatten, werden beim ersten Öffnen nach
diesem Update automatisch in eine neue Liste "Einkauf" umgezogen – das
passiert einmalig und automatisch, es ist keine manuelle Migration
nötig.

## Wie die Benachrichtigungen funktionieren

Jedes Gerät speichert beim Aktivieren von Benachrichtigungen ein
sogenanntes FCM-Token unter `households/<code>/devices/<geräte-id>`. Die
Cloud Function in `functions/index.js` reagiert auf jede Änderung an
Artikeln oder Rezepten und schickt eine Push-Nachricht an alle
gespeicherten Tokens des Haushalts – außer an das Gerät, das die
Änderung selbst ausgelöst hat. Bei mehreren Listen steht der
Listenname mit in der Nachricht.

## Rezepte aus Text übernehmen

Die eingebaute Texterkennung (ohne KI) erkennt Mengen, Einheiten und
Zubereitungsschritte aus eingefügtem Text recht zuverlässig, ist aber
nicht perfekt – kurz gegenprüfen lohnt sich. Eine KI-gestützte Auslese
wie in der ursprünglichen Claude-Version ist hier bewusst nicht mehr
enthalten, da sie einen eigenen, kostenpflichtigen KI-Zugang bräuchte.

## Automatisches Deployment (GitHub Actions)

Damit `index.html`-Änderungen nicht mehr manuell per `firebase deploy`
vom eigenen Rechner veröffentlicht werden müssen, deployt eine GitHub
Action (`.github/workflows/firebase-hosting-deploy.yml`) das Hosting
automatisch bei jedem Push auf `main`. Cloud Functions und
Firestore-Regeln sind bewusst ausgenommen und bleiben ein manueller
Schritt (`firebase deploy --only functions,firestore:rules`), da sie
seltener und mit mehr Bedacht geändert werden.

Einmalige Einrichtung:

1. In der [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
   das Firebase-Projekt auswählen (`marktzettel-5fcb0`), einen neuen
   Dienstkonto ("Service Account") anlegen, z. B. Name
   `github-actions-deploy`.
2. Dem Dienstkonto die Rolle **Firebase Hosting Admin** zuweisen (unter
   "IAM & Verwaltung" → das Dienstkonto suchen → "Rolle hinzufügen").
3. Beim Dienstkonto unter "Schlüssel" → "Schlüssel hinzufügen" →
   "Neuen Schlüssel erstellen" → **JSON** wählen. Es wird eine
   `.json`-Datei heruntergeladen.
4. Im GitHub-Repo unter **Settings → Secrets and variables → Actions →
   New repository secret**:
   - Name: `FIREBASE_SERVICE_ACCOUNT_MARKTZETTEL_5FCB0`
   - Value: den kompletten Inhalt der heruntergeladenen JSON-Datei
     einfügen.
5. Fertig. Ab jetzt reicht `git push origin main` – die Seite wird
   automatisch innerhalb weniger Minuten aktualisiert, auch ohne dass
   der eigene Rechner dafür an sein muss. Den Fortschritt sieht man im
   GitHub-Repo unter dem Reiter **Actions**.

## Fehlerbehebung

- **"config.js ist noch nicht ausgefüllt"-Hinweis in der App**: Werte aus
  Schritt 2 und 4 eintragen und neu pushen/deployen.
- **Kein Sync zwischen den Handys**: Prüfen, ob beide denselben
  Haushaltscode verwenden (Einstellungen → oben in der App), und ob
  `firestore.rules` erfolgreich deployed wurde.
- **Keine Push-Benachrichtigungen**: Blaze-Tarif aktiv? Cloud Function
  deployed (`firebase deploy --only functions`)? Auf dem iPhone: App
  über "Zum Home-Bildschirm" installiert und von dort geöffnet?
  Benachrichtigungen in den Handy-Einstellungen für die App/den Browser
  erlaubt?
- **Firestore-Regeln ändern**: Datei `firestore.rules` anpassen, dann
  `firebase deploy --only firestore:rules`.
