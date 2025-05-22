import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import env from "./env";

const firebase_app = initializeApp(env.firebase);
const auth = getAuth(firebase_app);
const storage = getStorage(firebase_app);

export {
  auth,
  onIdTokenChanged,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  storage
};
