import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { api } from "@/src/helper";
import Layout from "@/src/components/Layout";
import { Icon } from "@iconify/react";

export default function Matches({ setIsAuthCompleted }) {
  const router = useRouter();
  const authUser = useSelector((state) => state.app.user);
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [givenLikes, setGivenLikes] = useState([]);
  const [mutualLikes, setMutualLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Likes");
  const [activeSubTab, setActiveSubTab] = useState("Received"); 

  useEffect(() => {
    if (!authUser) return; 

    if (!authUser?.type) {
      console.log("No user type");
      router.push("/setup-profile");
      setLoading(false);
      return;
    }

    fetchLikes();
  }, [authUser, router]);

  const fetchLikes = async () => {
    try {
      // Fetch mutual likes
      const mutualData = await api("likes/mutual", "get", {});
      console.log("Mutual likes:", mutualData);
      setMutualLikes(mutualData);

      // Fetch incoming likes
      const receivedData = await api("likes/received", "get", {});
      console.log("Received likes:", receivedData);
      setReceivedLikes(receivedData);

      // Fetch outgoing likes
      const givenData = await api("likes/sent", "get", {});
      console.log("Given likes:", givenData);
      setGivenLikes(givenData);
    } catch (err) {
      console.error("Fetch likes error:", err.message, err.stack);
      setError(err.message || "Failed to fetch likes");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (userId) => {
    console.log("Navigating to profile with userId:", userId);
    router.push(`/profile/${userId}`);
  };

  return (
    <Layout setIsAuthCompleted={setIsAuthCompleted}>
      <div className="flex flex-col h-full bg-cream">
        {/* Tabs: Matches and Likes */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("Matches")}
            className={`flex-1 py-3 text-center font-semibold text-lg ${
              activeTab === "Matches"
                ? "bg-red-500 text-white"
                : "text-gray-500"
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab("Likes")}
            className={`flex-1 py-3 text-center font-semibold text-lg ${
              activeTab === "Likes" ? "bg-red-500 text-white" : "text-gray-500"
            }`}
          >
            Likes
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            {error}
          </p>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === "Matches" ? (
              // Matches Tab: Display mutual likes
              <div>
                {mutualLikes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {mutualLikes.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => handleCardClick(user.id)}
                      >
                        <div
                          className="w-24 h-24 rounded-lg mb-2"
                          style={{
                            backgroundImage: user.profile_photo
                              ? `url(${user.profile_photo})`
                              : "linear-gradient(to bottom, #e5e7eb, #d1d5db)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <p className="text-sm text-gray-800 truncate">
                          {user.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">
                    No mutual likes yet.
                  </p>
                )}
              </div>
            ) : (
              // Likes Tab: Display Received and Sent sub-tabs
              <div>
                {/* Sub-Tabs: Received and Sent */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveSubTab("Received")}
                    className={`flex-1 py-2 text-center font-medium text-gray-800 ${
                      activeSubTab === "Received"
                        ? "border-b-2 border-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    Received ({receivedLikes.length})
                  </button>
                  <button
                    onClick={() => setActiveSubTab("Sent")}
                    className={`flex-1 py-2 text-center font-medium text-gray-800 ${
                      activeSubTab === "Sent"
                        ? "border-b-2 border-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    Sent ({givenLikes.length})
                  </button>
                </div>

                {/* Sub-Tab Content */}
                {activeSubTab === "Received" ? (
                  <div>
                    {receivedLikes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {receivedLikes.map((user) => (
                          <div
                            key={user.id}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => handleCardClick(user.id)}
                          >
                            <div
                              className="w-24 h-24 rounded-lg mb-2"
                              style={{
                                backgroundImage: user.profile_photo
                                  ? `url(${user.profile_photo})`
                                  : "linear-gradient(to bottom, #e5e7eb, #d1d5db)",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <p className="text-sm text-gray-800 truncate">
                              {user.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center">
                        No likes received yet.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {givenLikes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {givenLikes.map((user) => (
                          <div
                            key={user.id}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => handleCardClick(user.id)}
                          >
                            <div
                              className="w-24 h-24 rounded-lg mb-2"
                              style={{
                                backgroundImage: user.profile_photo
                                  ? `url(${user.profile_photo})`
                                  : "linear-gradient(to bottom, #e5e7eb, #d1d5db)",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <p className="text-sm text-gray-800 truncate">
                              {user.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center">
                        You haven’t liked anyone yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
