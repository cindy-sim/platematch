import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/src/config/firebase';
import { signOut } from 'firebase/auth';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../helper';
import { clearUser, setUser } from '../redux/reducer';

export default function Layout({ children, hideNav = false, setIsAuthCompleted }) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('home');
  const authUser = useSelector((state) => state.app.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  const navItems = [
    { name: 'home', icon: 'mdi:home', path: '/' },
    { name: 'profile', icon: 'mdi:account', path: '/profile' },
    { name: 'matches', icon: 'mdi:heart', path: '/matches' },
    {
      name: 'logout',
      icon: 'mdi:logout',
      path: '#',
      onClick: async () => {
        try {
          dispatch(clearUser());
          await signOut(auth);
          router.push('/login');
        } catch (error) {
          console.error('Logout error:', error);
          router.push('/login');
        }
      },
    },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (initialAuthCheck) return; // Prevent multiple checks
      setInitialAuthCheck(true);

      if (userAuth) {
        console.log('Firebase UID from auth:', userAuth.uid); // Debug log
        try {
          if (authUser && authUser.id) {
            // User data already in Redux, no need to fetch
            setLoading(false);
            if (setIsAuthCompleted) {
              setIsAuthCompleted(true);
            }
            return;
          }

          const userData = await api('auth/profile', 'get', {});
          console.log('User profile fetched in Layout:', userData);
          dispatch(setUser({
            ...userData,
            uid: userAuth.uid,
            email: userAuth.email,
            token: await userAuth.getIdToken(),
          }));
        } catch (e) {
          console.error('Error fetching user profile in Layout:', e);
          dispatch(clearUser());
          router.push('/login');
        }
      } else {
        dispatch(clearUser());
        if (router.pathname !== '/login' && router.pathname !== '/signup') {
          router.push('/login');
        }
      }
      setLoading(false);
      if (setIsAuthCompleted) {
        setIsAuthCompleted(true);
      }
    });

    return () => unsubscribe();
  }, [router, dispatch, setIsAuthCompleted, authUser, initialAuthCheck]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-cream font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-coral text-white p-4 flex justify-between items-center z-50">
        <h1 className="text-xl text-black font-bold">PlateMatch</h1>
        {router.pathname !== '/login' && router.pathname !== '/setup-profile' && !authUser && (
          <button
            onClick={() => router.push('/login')}
            className="text-sm bg-olive px-3 py-1 rounded-full text-black"
          >
            Login
          </button>
        )}
      </header>

      {/* Main Content */}
      <main
        className={`flex-grow overflow-hidden ${
          hideNav ? 'pt-16' : 'pt-16 pb-16'
        }`}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t p-4 flex justify-around items-center z-50">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center ${
                activeNav === item.name ? 'text-coral' : 'text-charcoal'
              }`}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                } else {
                  setActiveNav(item.name);
                }
              }}
            >
              <Icon icon={item.icon} className="w-6 h-6" />
              <span className="text-xs capitalize">{item.name}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}