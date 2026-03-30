import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


import firebaseConfig from './firebase.js';
// Initialize Firebase Realtime Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables
let currentUser = "";
let currentChatId = "";

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username');
const chatIdInput = document.getElementById('chat-id-input');
const displayChatId = document.getElementById('display-chat-id');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const generateIdBtn = document.getElementById('generate-id-btn'); // 🌟 NAYA ELEMENT 🌟

// 🌟 LOGIC: 6-character Alphanumeric ID banana (A-Z, 1-9) 🌟
function generateRandomRoomId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 🌟 EVENT: Generate Button click karne par input fill ho 🌟
generateIdBtn.addEventListener('click', () => {
    const newId = generateRandomRoomId();
    chatIdInput.value = newId;
    // alert(`Chat Id Generated: ${newId}.`);
});

// STEP 1 & 2: JOIN CHAT BUTTON CLICK (Slightly updated flow)
document.getElementById('join-btn').addEventListener('click', () => {
    const name = usernameInput.value.trim();
    const chatRoomId = chatIdInput.value.trim().toUpperCase();

    if (!name) return alert("Please Enter Your Name 🙂!");
    if (!chatRoomId) return alert("Please Enter Your Chat ID  ☺️!");
    
    // Values set karein aur chat mein enter karein
    currentUser = name;
    currentChatId = chatRoomId;
    
    // UI Change
 setupScreen.classList.add('hidden');
chatScreen.classList.remove('hidden');
    displayChatId.innerText = currentChatId;
    // Messages load karna shuru karein
    loadMessages();
});

// LEAVE CHAT
document.getElementById('leave-btn').addEventListener('click', () => {
    window.location.reload(); 
});

// SEND MESSAGE TO FIREBASE
document.getElementById('send-btn').addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;
    
    messageInput.value = ''; 
    
    try {
        const messagesRef = ref(db, 'messages/' + currentChatId);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
            user: currentUser,
            text: text,
            createdAt: Date.now() 
        });
    } catch (error) {
        console.error("Message send fail: ", error);
        alert("It didn`t Connect to Firebase .");
    }
});

// ENTER KEY SE MESSAGE BHEJEIN
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('send-btn').click();
});

// LOAD MESSAGES & 30-SEC AUTO DELETE
function loadMessages() {
    const messagesRef = ref(db, 'messages/' + currentChatId);
    
    // onValue lagatar database ko dekhta rehta hai (Real-time sync)
    onValue(messagesRef, (snapshot) => {
        messagesContainer.innerHTML = ''; // Purane messages clear karein
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const msgKey = childSnapshot.key;
                
                const now = Date.now();
                const msgTime = data.createdAt;
                const ageInSeconds = (now - msgTime) / 1000;

                // Agar message 30 sec se purana hai, toh Firebase se delete kar do
                if (ageInSeconds >= 30) {
                    remove(ref(db, `messages/${currentChatId}/${msgKey}`)).catch(e => console.log(e));
                } else {
                    // Agar naya hai, toh screen par dikhao
                    renderMessage(data, ageInSeconds);
                    
                    // Aur bache hue time ke baad Firebase se delete karne ka timer laga do
                    const timeLeftMs = 30000 - (now - msgTime);
                    setTimeout(() => {
                        remove(ref(db, `messages/${currentChatId}/${msgKey}`)).catch(e => console.log(e));
                    }, timeLeftMs);
                }
            });
        }
        
        // Auto scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// MESSAGES KO SCREEN PAR DESIGN KARNA
function renderMessage(data, ageInSeconds) {
    const isMine = data.user === currentUser;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMine ? 'mine' : 'other'}`;
    
    const timeLeft = Math.floor(30 - ageInSeconds);
    
    msgDiv.innerHTML = `
        <strong>${isMine ? 'You' : data.user}</strong>
        ${data.text}
        <span class="delete-timer">Deletes in ~${timeLeft}s</span>
    `;
    messagesContainer.appendChild(msgDiv);
}