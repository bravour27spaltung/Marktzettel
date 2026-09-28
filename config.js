// Trage hier deine eigenen Firebase-Werte ein (siehe README.md, Schritt 2 und 3).
// Diese Werte sind KEIN Geheimnis – sie dürfen öffentlich im Repo stehen.
// Die eigentliche Absicherung passiert über firestore.rules und den Haushaltscode.
(function (global) {
  global.MARKTZETTEL_CONFIG = {
    firebase: {
      apiKey: "AIzaSyD9GC4sle0pfDbTHVRDI5I7Vd1v_M3FAQg",
      authDomain: "marktzettel-5fcb0.firebaseapp.com",
      projectId: "marktzettel-5fcb0",
      storageBucket: "marktzettel-5fcb0.firebasestorage.app",
      messagingSenderId: "620748019595",
      appId: "1:620748019595:web:a2a0b363be35df4b82818e"
    },
    // Project settings → Cloud Messaging → Web configuration → "Web Push certificates"
    vapidKey: "BLe6Ffs2sRuh5zPcBqMxHSMi6jAg4vfozlmesm5ASMh7sspUcTVmwiI9hVzhnIvm5bDVoL7IIz_bJbs3Z6HJcJI"
  };
})(typeof self !== "undefined" ? self : this);
