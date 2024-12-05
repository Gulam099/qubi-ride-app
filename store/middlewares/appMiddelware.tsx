import { Middleware, MiddlewareAPI, Dispatch } from "@reduxjs/toolkit";

// Centralized app handlers
const appHandlers: Record<
  string,
  (storeAPI: MiddlewareAPI<Dispatch<any>>, action: any) => boolean | void
> = {
  "user/login": (storeAPI, action) => {
    const { isAuthenticated } = storeAPI.getState().user;
    if (isAuthenticated) {
      console.warn("User is already logged in.");
      return false; // Block the action
    }
    console.log("Logging in user:", action.payload);
    return true; // Allow the action
  },
  "user/updateRole": (storeAPI, action) => {
    const validRoles = ["patient", "specialist", "admin", "default"];
    if (!validRoles.includes(action.payload)) {
      console.error("Invalid role:", action.payload);
      return false; // Block the action
    }
    console.log("Updating role to:", action.payload);
    return true; // Allow the action
  },
  "user/logout": (storeAPI) => {
    console.log("Logging out user.");
    return true; // Allow the action
  },
  // Add more handlers as needed
};

// Middleware implementation
const appMiddleware: Middleware<{}> = (storeAPI) => (next) => (action: any) => {
  const handler = appHandlers[action.type];

  if (handler) {
    try {
      const proceed = handler(storeAPI, action);
      if (proceed === false) {
        console.warn(`Action ${action.type} was blocked by middleware.`);
        return; // Block the action
      }

      // Here, we will dispatch an action to trigger redirection in a component
      const { isAuthenticated } = storeAPI.getState().user;

      if (!isAuthenticated) {
        // Dispatch a custom action to trigger redirection in your components
      } else {
        storeAPI.dispatch({ type: "REDIRECT_TO_HOME" });
      }

    } catch (error) {
      console.error(`Error in handler for action ${action.type}:`, error);
      return; // Block the action if an error occurs
    }
  }

  // Proceed with the action if no handler blocks it
  return next(action);
};

export default appMiddleware;
