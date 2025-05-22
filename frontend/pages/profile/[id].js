
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { api } from '@/src/helper';
import Layout from '@/src/components/Layout';
import { Icon } from '@iconify/react';

export default function UserProfile({ setIsAuthCompleted }) {
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the URL
  const authUser = useSelector((state) => state.app.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser) return; 

    const fetchUser = async () => {
      if (!id) return; 

      try {
        const userData = await api(`users/${id}`, 'get', {});
        console.log('User data:', userData);
        setUser(userData);
      } catch (err) {
        console.error('Fetch user error:', err.message, err.stack);
        if (err.message.includes('User not found')) {
          setError('User not found');
        } else {
          setError(err.message || 'Failed to fetch user');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, authUser]);

  return (
    <Layout setIsAuthCompleted={setIsAuthCompleted}>
      <div className="flex flex-col h-full bg-cream p-4">
        {loading ? (
          <p className="text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            {error}
          </p>
        ) : user ? (
          <div className="relative">
            {/* Back Button at Top-Left */}
            <button
              onClick={() => router.back()}
              className="absolute top-0 left-0 text-gray-800 p-2"
            >
              <Icon icon="mdi:arrow-left" className="w-6 h-6" />
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Profile Photo */}
              <div
                className="w-full h-64 rounded-t-lg"
                style={{
                  backgroundImage: user.profile_photo
                    ? `url(${user.profile_photo})`
                    : 'linear-gradient(to bottom, #e5e7eb, #d1d5db)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* User Details */}
              <div className="p-4">
                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>

                {/* Type with Icon */}
                <div className="flex items-center mt-1">
                  <Icon icon="mdi:account" className="w-4 h-4 text-gray-600 mr-1" />
                  <p className="text-sm text-gray-600">{user.type}</p>
                </div>

                {/* Location with Icon */}
                <div className="flex items-center mt-1">
                  <Icon icon="mdi:map-marker" className="w-4 h-4 text-gray-600 mr-1" />
                  <p className="text-sm text-gray-600">{user.location || 'No location'}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-2">
                  {user.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center">User not found.</p>
        )}
      </div>
    </Layout>
  );
}