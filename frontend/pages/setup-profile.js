import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { auth, storage } from '@/src/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { api } from '@/src/helper';
import { setUser } from '@/src/redux/reducer';
import Layout from '@/src/components/Layout';

export default function SetupProfile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location || !description) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let profilePhotoUrl = null;
      if (photo) {
        const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}/${photo.name}`);
        await uploadBytes(storageRef, photo);
        profilePhotoUrl = await getDownloadURL(storageRef);
      }

      const profileData = {
        name,
        location,
        description,
        profile_photo: profilePhotoUrl,
      };
      const updatedUser = await api('users', 'put', profileData, setLoading);
      dispatch(setUser({
        ...updatedUser,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        token: await auth.currentUser.getIdToken(),
      }));
      router.push('/');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-bold text-charcoal mb-6">Set Up Your Profile</h2>
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Enter your location"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Tell us about yourself"
              rows={4}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-coral text-black py-2 rounded-md hover:bg-coral-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </Layout>
  );
}