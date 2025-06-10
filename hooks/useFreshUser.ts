// import { useUser } from "@clerk/clerk-expo";
// import { useEffect, useState } from "react";
// import { getUser } from "@clerk/clerk-expo"; // or from "@clerk/clerk-expo"

// const useFreshUser = () => {
//   const { user } = useUser();
//   const [freshUser, setFreshUser] = useState(user);
//   const [loading, setLoading] = useState(false);

//   const refreshUser = async () => {
//     if (!user?.id) return;
//     setLoading(true);
//     try {
//       const updatedUser = await getUser(user.id); // fetch latest user data
//       setFreshUser(updatedUser);
//     } catch (error) {
//       console.error("Failed to refresh user", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshUser();
//   }, []);

//   return { freshUser, refreshUser, loading };
// };

// export default useFreshUser;
