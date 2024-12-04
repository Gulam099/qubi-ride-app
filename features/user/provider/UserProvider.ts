// import React, { createContext, useContext, useState } from "react";

// // Define User type and context type
// type Role = "patient" | "specialist" | "admin";

// interface User {
//   role: Role;
//   phoneNumber: string;
//   country: string;
//   nationalId: string;
//   firstName: string;
//   lastName: string;
//   isAuthenticated: boolean;
//   email?: string;
//   dateOfBirth?: string;
// }

// interface UserContextType {
//   user: User;
//   login: (userData: Partial<User>) => void;
//   logout: () => void;
//   updateUser: (userData: Partial<User>) => void;
// }

// // Define default user
// const defaultUser: User = {
//   role: "patient",
//   phoneNumber: "",
//   country: "",
//   nationalId: "",
//   firstName: "",
//   lastName: "",
//   isAuthenticated: false,
// };

// // Create the UserContext
// const UserContext = createContext<UserContextType | undefined>(undefined);

// // UserProvider Component
// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User>(defaultUser);

//   const login = (userData: Partial<User>) => {
//     setUser((prev) => ({
//       ...prev,
//       ...userData,
//       isAuthenticated: true,
//     }));
//   };

//   const logout = () => {
//     setUser(defaultUser);
//   };

//   const updateUser = (userData: Partial<User>) => {
//     setUser((prev) => ({
//       ...prev,
//       ...userData,
//     }));
//   };

//   return (
//     <UserContext.Provider value={{ user, login, logout, updateUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Hook to use the UserContext
// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };
