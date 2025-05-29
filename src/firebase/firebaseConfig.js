import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdQt7iIejTgI-KYkqK7QmhjTzIR6bMW9c",
  authDomain: "quanlybangiay-d9ee8.firebaseapp.com",
  projectId: "quanlybangiay-d9ee8",
  storageBucket: "quanlybangiay-d9ee8.appspot.com", // sửa lỗi tên domain
  messagingSenderId: "892966570000",
  appId: "1:892966570000:web:4879bb49e0986b93702295",
  measurementId: "G-HY5NSR2LEM"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

