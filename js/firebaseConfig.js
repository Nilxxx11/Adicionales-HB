// firebaseConfig.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "tu-apiKey",
  authDomain: "tu-authDomain",
  projectId: "tu-projectId",
  storageBucket: "tu-storageBucket",
  messagingSenderId: "tu-messagingSenderId",
  appId: "tu-appId",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const database = getDatabase(app);

export { app, database };
