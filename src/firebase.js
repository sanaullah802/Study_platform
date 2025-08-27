
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCDPUp5WYB3C8X-Jr20AtpldxUJdMwmV9s",
  authDomain: "virtualstudy-1223c.firebaseapp.com",
  databaseURL: "https://virtualstudy-1223c-default-rtdb.firebaseio.com",
  projectId: "virtualstudy-1223c",
  storageBucket: "virtualstudy-1223c.firebasestorage.app",
  messagingSenderId: "591473828349",
  appId: "1:591473828349:web:1ba13cb3c20333bfd7b994"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);