// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import { auth } from '@/src/config/firebase';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { api } from '@/src/helper';
// import Layout from '@/src/components/Layout';
// import { useDispatch } from 'react-redux';
// import { setUser } from '@/src/redux/reducer';

// export default function Login() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [isSignup, setIsSignup] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [userType, setUserType] = useState('KOL');
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       let userCredential;
//       if (isSignup) {
//         userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         await api('signup', 'post', { type: userType }, setLoading);
//         router.push('/setup-profile');
//       } else {
//         userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const token = await user.getIdToken();

//         const userData = await api('auth/profile', 'get', {}, setLoading);
//         console.log('User profile fetched on login:', userData);

//         if (userData && userData.name) {
//           const userDetails = {
//             ...userData,
//             uid: user.uid,
//             email: user.email,
//             token,
//           };
//           dispatch(setUser(userDetails));
//           router.push('/');
//         } else {
//           dispatch(setUser({ uid: user.uid, email: user.email, token }));
//           setError('Profile not found. Please complete your profile setup.');
//           router.push('/setup-profile');
//         }
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       switch (err.code) {
//         case 'auth/user-not-found':
//         case 'auth/wrong-password':
//         case 'auth/invalid-credential':
//           setError('Invalid email or password. Please try again.');
//           break;
//         case 'auth/email-already-in-use':
//           setError('Email is already in use. Please use a different email.');
//           break;
//         case 'auth/weak-password':
//           setError('Password is too weak. Please use a stronger password.');
//           break;
//         default:
//           setError(err.message || 'Something went wrong. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout hideNav>
//       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
//         <h2 className="text-2xl font-bold text-charcoal mb-6 text-black">
//           {isSignup ? 'Sign Up' : 'Login'}
//         </h2>
//         <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-charcoal">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
//               placeholder="Enter your email"
//               disabled={loading}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-charcoal">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
//               placeholder="Enter your password"
//               disabled={loading}
//             />
//           </div>
//           {isSignup && (
//             <div>
//               <label className="block text-sm font-medium text-charcoal">I am a</label>
//               <div className="flex space-x-4 mt-2">
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     value="KOL"
//                     checked={userType === 'KOL'}
//                     onChange={() => setUserType('KOL')}
//                     className="mr-2"
//                     disabled={loading}
//                   />
//                   KOL
//                 </label>
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     value="Restaurant"
//                     checked={userType === 'Restaurant'}
//                     onChange={() => setUserType('Restaurant')}
//                     className="mr-2"
//                     disabled={loading}
//                   />
//                   Restaurant
//                 </label>
//               </div>
//             </div>
//           )}
//           <button
//             type="submit"
//             className="w-full bg-coral text-black py-2 rounded-md hover:bg-coral-dark disabled:opacity-50"
//             disabled={loading}
//           >
//             {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
//           </button>
//         </form>
//         <p className="mt-4 text-sm text-charcoal">
//           {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
//           <button
//             onClick={() => setIsSignup(!isSignup)}
//             className="text-coral hover:underline"
//             disabled={loading}
//           >
//             {isSignup ? 'Login' : 'Sign Up'}
//           </button>
//         </p>
//         {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
//       </div>
//     </Layout>
//   );
// }

import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/src/config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { api } from '@/src/helper';
import Layout from '@/src/components/Layout';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/redux/reducer';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('KOL');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await api('signup', 'post', { type: userType }, setLoading);
        router.push('/setup-profile');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        router.push('/'); // Let Layout.js handle the profile fetch
      }
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('Email is already in use. Please use a different email or log in.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        default:
          setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
        <h2 className="text-2xl font-bold text-charcoal mb-6 text-black">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-charcoal">I am a</label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="KOL"
                    checked={userType === 'KOL'}
                    onChange={() => setUserType('KOL')}
                    className="mr-2"
                    disabled={loading}
                  />
                  KOL
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Restaurant"
                    checked={userType === 'Restaurant'}
                    onChange={() => setUserType('Restaurant')}
                    className="mr-2"
                    disabled={loading}
                  />
                  Restaurant
                </label>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-coral text-black py-2 rounded-md hover:bg-coral-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-charcoal">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-coral hover:underline"
            disabled={loading}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </Layout>
  );
}