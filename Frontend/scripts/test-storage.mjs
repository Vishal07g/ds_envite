import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDdyT6WFoVteh72mhM6UOj35TPOG-tqI6A",
  authDomain: "digital-invitation-e906f.firebaseapp.com",
  databaseURL: "https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digital-invitation-e906f",
  storageBucket: "digital-invitation-e906f.firebasestorage.app",
  messagingSenderId: "419246546637",
  appId: "1:419246546637:web:fbcf127d56ef5cce05d384"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testFirebaseStorage() {
  console.log("Testing Firebase storage upload...");
  const dummyData = Buffer.from("hello world test");
  const fileRef = ref(storage, "test/hello.txt");
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Storage Timeout after 5s")), 5000));
    const upload = uploadBytes(fileRef, dummyData, { contentType: "text/plain" });
    const snap = await Promise.race([upload, timeout]);
    console.log("Uploaded successfully!", snap);
    const url = await getDownloadURL(fileRef);
    console.log("Download URL:", url);
  } catch (err) {
    console.error("Firebase Storage failed:", err.message);
  }
}

testFirebaseStorage();
