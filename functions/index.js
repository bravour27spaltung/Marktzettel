/**
 * Cloud Function: schickt eine Push-Benachrichtigung an alle Geräte im
 * selben Haushalt, sobald sich die Einkaufsliste oder ein Rezept ändert –
 * außer an das Gerät, das die Änderung selbst ausgelöst hat.
 *
 * Erfordert den Firebase-Tarif "Blaze" (siehe README.md, Schritt 5).
 */
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

setGlobalOptions({ region: "europe-west1", maxInstances: 5 });
initializeApp();
const db = getFirestore();

function describeItemChange(before, after) {
  if (!before && after) return `${after.name || "Artikel"} hinzugefügt`;
  if (before && !after) return `${before.name || "Artikel"} entfernt`;
  if (before && after) {
    if (before.done !== after.done) {
      return after.done ? `${after.name} abgehakt` : `${after.name} wieder geöffnet`;
    }
    if (before.qty !== after.qty || before.unit !== after.unit || before.aisle !== after.aisle) {
      return `${after.name} geändert`;
    }
  }
  return "Einkaufsliste aktualisiert";
}

function describeRecipeChange(before, after) {
  if (!before && after) return `Neues Rezept: ${after.title || "Unbenannt"}`;
  if (before && !after) return `Rezept gelöscht: ${before.title || "Unbenannt"}`;
  if (before && after) return `Rezept geändert: ${after.title || "Unbenannt"}`;
  return "Rezepte aktualisiert";
}

async function notifyHousehold(code, excludeDeviceId, title, body) {
  const devicesSnap = await db.collection(`households/${code}/devices`).get();
  const tokens = [];
  devicesSnap.forEach((d) => {
    if (d.id === excludeDeviceId) return;
    const t = d.get("token");
    if (t) tokens.push(t);
  });
  if (!tokens.length) return;

  const resp = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: { fcmOptions: { link: "/" } },
  });

  // Ungültig gewordene Tokens (App deinstalliert, Berechtigung entzogen) aufräumen.
  const invalid = [];
  resp.responses.forEach((r, i) => {
    if (!r.success) {
      const errCode = r.error && r.error.code;
      if (
        errCode === "messaging/registration-token-not-registered" ||
        errCode === "messaging/invalid-registration-token"
      ) {
        invalid.push(tokens[i]);
      }
    }
  });
  if (invalid.length) {
    const batch = db.batch();
    devicesSnap.forEach((d) => {
      if (invalid.includes(d.get("token"))) batch.update(d.ref, { token: null });
    });
    await batch.commit();
  }
}

exports.onItemChange = onDocumentWritten(
  "households/{code}/items/{itemId}",
  async (event) => {
    const before = event.data.before.exists ? event.data.before.data() : null;
    const after = event.data.after.exists ? event.data.after.data() : null;
    const actor = (after && after.by) || (before && before.by) || null;
    const body = describeItemChange(before, after);
    await notifyHousehold(event.params.code, actor, "Marktzettel", body);
  }
);

exports.onRecipeChange = onDocumentWritten(
  "households/{code}/recipes/{recipeId}",
  async (event) => {
    const before = event.data.before.exists ? event.data.before.data() : null;
    const after = event.data.after.exists ? event.data.after.data() : null;
    const actor = (after && after.by) || (before && before.by) || null;
    const body = describeRecipeChange(before, after);
    await notifyHousehold(event.params.code, actor, "Marktzettel", body);
  }
);
