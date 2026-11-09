import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyDdyT6WFoVteh72mhM6UOj35TPOG-tqI6A",
  authDomain: "digital-invitation-e906f.firebaseapp.com",
  databaseURL: "https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digital-invitation-e906f",
  storageBucket: "digital-invitation-e906f.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  const dummyBuffer = Buffer.from('test video content');
  const storageRef = ref(storage, 'drive_storage/test/test.txt');
  try {
    await uploadBytes(storageRef, dummyBuffer, { contentType: 'text/plain' });
    const url = await getDownloadURL(storageRef);
    console.log('Upload successful! URL:', url);
  } catch(e) {
    console.error('Firebase storage upload failed:', e.code, e.message);
  }
}
testUpload();

