# 🍷 Mijn Wijnkelder — Netlify versie

Een persoonlijk digitaal wijnarchief. Data wordt opgeslagen in **Netlify Blobs** — dezelfde data op alle apparaten.

---

## 📁 Projectstructuur

```
mijn-wijnkelder/
├── netlify/
│   └── functions/
│       └── wines.js        ← API (GET / POST / PUT / DELETE)
├── index.html
├── kelder.html
├── wijn.html
├── app.js                  ← API-wrapper (geen localStorage meer)
├── style.css
├── package.json            ← Dependency: @netlify/blobs
├── netlify.toml            ← Routering: /api/* naar function
└── README.md
```

---

## 🚀 Deployen op Netlify

### Stap 1 — Zet bestanden op GitHub

1. Maak een gratis account op https://github.com
2. Klik rechtsboven op "+" → "New repository"
3. Geef het een naam (bijv. `mijn-wijnkelder`) en klik "Create repository"
4. Upload alle bestanden (inclusief de `netlify/` map) via de GitHub interface of met Git:

```bash
git init
git add .
git commit -m "eerste versie"
git remote add origin https://github.com/JOUNAAM/mijn-wijnkelder.git
git push -u origin main
```

### Stap 2 — Koppel aan Netlify

1. Ga naar https://netlify.com en maak een gratis account
2. Klik "Add new site" → "Import an existing project"
3. Kies GitHub en selecteer je repository
4. Build-instellingen hoef je niet aan te passen (netlify.toml regelt alles)
5. Klik "Deploy site" — klaar! ✅

Je krijgt een URL zoals `https://jouw-naam.netlify.app`

### Updates pushen

```bash
git add .
git commit -m "update"
git push
```
Netlify herdeployt automatisch.

---

## 🔧 Lokaal testen

```bash
npm install
npm install -g netlify-cli
netlify dev
# → http://localhost:8888
```

---

## 🗄️ Opslag

Data staat in **Netlify Blobs** — ingebouwd, gratis, geen externe database nodig.
Gratis tier: 1 GB opslag, 125.000 function-aanroepen/maand — ruim voldoende.

---

Proost! 🥂
