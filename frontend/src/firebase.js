import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyB4FQPEwLZhSA_3pbY0CV2H5ilstmNtpq0",
  authDomain: "greenpulse-dd32a.firebaseapp.com",
  databaseURL: "https://greenpulse-dd32a-default-rtdb.firebaseio.com",
  projectId: "greenpulse-dd32a",
  storageBucket: "greenpulse-dd32a.firebasestorage.app",
  messagingSenderId: "751273952480",
  appId: "1:751273952480:web:b2b798b7db453a18d43c85",
  measurementId: "G-DT8LQECFSQ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
