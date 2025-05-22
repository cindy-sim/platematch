import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { auth, storage } from '@/src/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { api } from '@/src/helper';
import { setUser } from '@/src/redux/reducer';
import Layout from '@/src/components/Layout';

export default function Profile({ setIsAuthCompleted }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.app.user);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('authUser:', authUser);

  useEffect(() => {
    if (!authUser) return; // Wait for authUser to be set by Layout

    if (!authUser.type) {
      console.log('No user type, redirecting to setup-profile');
      router.push('/setup-profile');
      return;
    }

    // Initialize form fields from Redux
    setName(authUser.name || '');
    setLocation(authUser.location || '');
    setDescription(authUser.description || '');
  }, [authUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Submitting profile update:', { name, location, description, photo });

    try {
      let profilePhotoUrl = authUser.profile_photo || null;
      if (photo) {
        console.log('Uploading photo to Firebase Storage');
        const storageRef = ref(storage, `profile_photos/${authUser.uid}/${photo.name}`);
        await uploadBytes(storageRef, photo);
        profilePhotoUrl = await getDownloadURL(storageRef);
        console.log('Photo uploaded, URL:', profilePhotoUrl);
      }

      const profileData = {
        name,
        location,
        description,
        profile_photo: profilePhotoUrl,
      };
      console.log('Sending profile data to backend:', profileData);
      const updatedUser = await api('users', 'put', profileData, setLoading);
      console.log('Updated user:', updatedUser);
      dispatch(setUser({
        ...updatedUser,
        uid: authUser.uid,
        email: authUser.email,
        token: authUser.token,
      }));
      router.push('/');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout setIsAuthCompleted={setIsAuthCompleted}>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-charcoal mb-4">Update Profile</h2>
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
              onChange={(e) => {
                console.log('Selected photo:', e.target.files[0]);
                setPhoto(e.target.files[0]);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-coral text-black py-2 rounded-md hover:bg-coral-dark disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </Layout>
  );
}