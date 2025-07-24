// utils/firebaseConfig.ts
import firebase from "@react-native-firebase/app";

console.log("Firebase initialized:", firebase.apps.length > 0);

const firebaseConfig: any = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize only if no app is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
