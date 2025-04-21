// store/ConfigureStore.js
import { combineReducers } from "@reduxjs/toolkit";
import { documentDirectory, EncodingType } from "expo-file-system";
import { createExpoFileSystemStorage } from "redux-persist-expo-file-system-storage";

import AppStateReducer from "./appState/appState"
import { persistReducer } from "redux-persist";
export const expoFileSystemStorage = createExpoFileSystemStorage({
  storagePath: `${documentDirectory}Baserti/`,
  encoding: EncodingType.UTF8,
  debug: true,
});
const persist = (key, reducer) =>
  persistReducer(
    {
      key,
      storage: expoFileSystemStorage,
    },
    reducer
  );

const combinePersistReducers = (keys) =>
  Object.keys(keys).reduce(
    (obj, key) => ({
      ...obj,
      [key]: persist(key, keys[key]),
    }),
    {}
  );

const reducers = combineReducers({
  ...combinePersistReducers({
    appState : AppStateReducer,
  }),
});

export default reducers;
