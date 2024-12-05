// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
// import { Provider } from "react-redux";
import rootReducer from "./ConfigureStore";
import appMiddleware from "./middlewares/appMiddelware";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(appMiddleware),
});
const persistor = persistStore(store);

export { store, persistor };