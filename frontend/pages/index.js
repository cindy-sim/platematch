import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { api } from "@/src/helper";
import Layout from "@/src/components/Layout";
import TinderCard from "react-tinder-card";
import { Icon } from "@iconify/react";

export default function Home({ setIsAuthCompleted }) {
  const router = useRouter();
  const authUser = useSelector((state) => state.app.user);
  const [users, setUsers] = useState([]); 
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [liking, setLiking] = useState(false);
  const [imageLoading, setImageLoading] = useState({}); 
  const tinderCardRef = useRef([]); 
  const tinderCardRefsById = useRef({});
  const topCardId = useRef(null); 
  const lastSwipeDirection = useRef(null);
  const swipedUserIds = useRef(new Set());
  const isSwiping = useRef(false); 

  console.log("authUser:", authUser);

  useEffect(() => {
    if (displayedUsers.length > 0) {
      topCardId.current = displayedUsers[displayedUsers.length - 1].id;
      console.log("Updated topCardId (last card in list):", topCardId.current);
    } else {
      topCardId.current = null;
      console.log("No users left; topCardId set to null");
    }
  }, [displayedUsers]);

  useEffect(() => {
    if (!authUser) return;

    if (!authUser?.type) {
      console.log("No user type");
      router.push("/setup-profile");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching all users from API for type:", authUser.type);
        const response = await api("users", "get", {}, setLoading);
        console.log("API response:", response);

        const { users: newUsers, totalCount } = response;

        setTotalUsers(totalCount);
        console.log("Total users available:", totalCount);

        const filteredUsers = newUsers.filter((user) => !swipedUserIds.current.has(user.id));
        setUsers(filteredUsers);
        setDisplayedUsers(filteredUsers); 
        setImageLoading(
          Object.fromEntries(filteredUsers.map((user) => [user.id, true]))
        ); 
      } catch (err) {
        console.error("Fetch users error:", err.message, err.stack);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser, router]);

  const handleSwipe = (direction, user) => {
    console.log(`Swiped ${direction} on user:`, user.name, user.type);
    lastSwipeDirection.current = direction;
    isSwiping.current = true;
  };

  const handleLike = async (userId, retries = 3) => {
    console.log("RUNNING LIKES");
    setLiking(true);
    for (let i = 0; i < retries; i++) {
      try {
        const response = await api("likes", "post", { liked_user_id: userId });
        console.log("Like recorded:", response);
        if (response.mutual) {
          console.log("Mutual like detected with user ID:", userId);
        }
        break;
      } catch (err) {
        if (i === retries - 1) {
          console.error("Like error after retries:", {
            message: err.message,
            stack: err.stack,
            response: err.response
              ? {
                  status: err.response.status,
                  data: err.response.data,
                }
              : "No response data",
          });
        } else {
          console.log(`Retrying like (${i + 1}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        setLiking(false);
      }
    }
  };

  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedHandleLike = debounce(handleLike, 300);

  const removeCard = (userId) => {
    swipedUserIds.current.add(userId);

    // Update users state without affecting displayedUsers immediately
    setUsers((prevUsers) => {
      const newUsers = prevUsers.filter((user) => user.id !== userId);
      console.log("Updated users after swipe:", newUsers);
      return newUsers;
    });

    // Delay the removal of the card from the displayed stack until animation completes
    setTimeout(() => {
      setDisplayedUsers((prev) => {
        const newDisplayedUsers = prev.filter((user) => user.id !== userId);
        console.log("Updated displayed users after swipe:", newDisplayedUsers);

        // Clean up the ref for the removed card
        delete tinderCardRefsById.current[userId];
        console.log("Updated tinderCardRefsById:", tinderCardRefsById.current);

        return [...newDisplayedUsers];
      });

      if (lastSwipeDirection.current === "right") {
        debouncedHandleLike(userId);
      }
      lastSwipeDirection.current = null;
      isSwiping.current = false;
    }, 300); // Match the animation duration of react-tinder-card
  };

  const swipe = (direction) => {
    // Use topCardId to find and swipe the topmost card (last card in the list)
    if (topCardId.current && tinderCardRefsById.current[topCardId.current] && !isSwiping.current) {
      const topCardName = displayedUsers.find((user) => user.id === topCardId.current)?.name || "Unknown";
      console.log(`Swiping top card (ID: ${topCardId.current}, Name: ${topCardName}) in direction: ${direction}`);
      lastSwipeDirection.current = direction;
      tinderCardRefsById.current[topCardId.current].swipe(direction);
    } else {
      console.warn(
        "Cannot swipe: No top card, ref not found, or swipe in progress",
        {
          topCardId: topCardId.current,
          refExists: !!tinderCardRefsById.current[topCardId.current],
          isSwiping: isSwiping.current,
        }
      );
    }
  };

  const handleImageLoad = (userId) => {
    setImageLoading((prev) => ({ ...prev, [userId]: false }));
  };

  const handleImageError = (userId, event) => {
    console.log(`Failed to load image for user ID ${userId}`);
    event.target.src = "/default-profile.jpg";
    setImageLoading((prev) => ({ ...prev, [userId]: false }));
  };

  return (
    <Layout setIsAuthCompleted={setIsAuthCompleted}>
      <div className="flex flex-col h-full items-center bg-cream relative">
        {loading && displayedUsers.length === 0 ? (
          <p className="text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            {error}
          </p>
        ) : displayedUsers.length > 0 ? (
          <>
            <div className="w-full h-full flex justify-center items-center relative">
              {displayedUsers.map((user, index) => (
                <TinderCard
                  key={user.id}
                  ref={(el) => {
                    tinderCardRef.current[index] = el;
                    tinderCardRefsById.current[user.id] = el; 
                  }}
                  onSwipe={(dir) => handleSwipe(dir, user)}
                  onCardLeftScreen={() => {
                    console.log(`${user.name} left the screen`);
                    removeCard(user.id);
                  }}
                  className="absolute swipe-card"
                  style={{ zIndex: displayedUsers.length - index }}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="position"
                  swipeThreshold={150}
                >
                  <div
                    className="relative w-full h-full rounded-2xl shadow-lg flex flex-col overflow-hidden"
                    style={{
                      backgroundColor: "#e5e7eb",
                    }}
                  >
                    <img
                      src={user.profile_photo || "/default-profile.jpg"}
                      alt={`${user.name}'s profile`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{
                        transition: "filter 0.3s ease",
                      }}
                      onLoad={() => handleImageLoad(user.id)}
                      onError={(e) => handleImageError(user.id, e)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                      <h3 className="text-2xl font-bold truncate">{user.name}</h3>
                      <p className="text-sm">{user.type}</p>
                      <p className="text-sm">{user.location || "No location"}</p>
                      <p className="text-sm mt-1 line-clamp-2">{user.description || "No description"}</p>
                    </div>
                  </div>
                </TinderCard>
              ))}
            </div>
            <div className="absolute bottom-16 flex justify-center gap-4 w-full z-50">
              <button
                onClick={() => swipe("left")}
                className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md"
                disabled={liking || isSwiping.current}
              >
                <Icon icon="mdi:close" className="text-red-500 text-2xl" />
              </button>
              <button
                onClick={() => swipe("right")}
                className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md"
                disabled={liking || isSwiping.current}
              >
                {liking ? (
                  <span className="text-blue-500 text-2xl">...</span>
                ) : (
                  <Icon icon="mdi:heart" className="text-blue-500 text-2xl" />
                )}
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            No users found.
          </p>
        )}
      </div>
    </Layout>
  );
}