// Trage hier deine eigenen Firebase-Werte ein (siehe README.md, Schritt 2 und 3).
// Diese Werte sind KEIN Geheimnis – sie dürfen öffentlich im Repo stehen.
// Die eigentliche Absicherung passiert über firestore.rules und den Haushaltscode.
(function (global) {
  global.MARKTZETTEL_CONFIG = {
    firebase: {
      apiKey: "DEIN_API_KEY",
      authDomain: "DEIN_PROJEKT.firebaseapp.com",
      projectId: "DEIN_PROJEKT",
      storageBucket: "DEIN_PROJEKT.appspot.com",
      messagingSenderId: "DEINE_SENDER_ID",
      appId: "DEINE_APP_ID"
    },
    // Project settings → Cloud Messaging → Web configuration → "Web Push certificates"
    vapidKey: "DEIN_VAPID_KEY"
  };
})(typeof self !== "undefined" ? self : this);
