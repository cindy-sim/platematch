import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBzZAmwtvkMLlJXptZfH0OmZXrUYCHWGuc",
  authDomain: "platematch-5c15c.firebaseapp.com",
  projectId: "platematch-5c15c",
  storageBucket: "platematch-5c15c.firebasestorage.app",
  messagingSenderId: "953697792294",
  appId: "1:953697792294:web:30044d1d34743caeb211e7",
  measurementId: "G-Q2SW4JLHW6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function generateToken(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password).catch(async (err) => {
      if (err.code === 'auth/email-already-in-use') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw err;
      }
    });

    const token = await auth.currentUser.getIdToken();
    console.log('Firebase Token:', token);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

generateToken('test@example.com', 'password123');
