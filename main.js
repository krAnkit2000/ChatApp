// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// import firebaseConfig from './firebase.js';

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// let currentUser = "";
// let currentChatId = "";
// let replyToMessage = null; // Reply track karne ke liye
// let localMessages = {}; // Local storage taaki DB se delete hone ke baad bhi dikhe

// // DOM Elements
// const setupScreen = document.getElementById('setup-screen');
// const chatScreen = document.getElementById('chat-screen');
// const usernameInput = document.getElementById('username');
// const chatIdInput = document.getElementById('chat-id-input');
// const displayChatId = document.getElementById('display-chat-id');
// const messagesContainer = document.getElementById('messages-container');
// const messageInput = document.getElementById('message-input');
// const generateIdBtn = document.getElementById('generate-id-btn');

// // --- Functions ---

// function generateRandomRoomId(length = 6) {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
// }

// generateIdBtn.addEventListener('click', () => {
//     chatIdInput.value = generateRandomRoomId();
// });

// document.getElementById('join-btn').addEventListener('click', () => {
//     const name = usernameInput.value.trim();
//     const chatRoomId = chatIdInput.value.trim().toUpperCase();
//     if (!name || !chatRoomId) return alert("Details bhariye!");
    
//     currentUser = name;
//     currentChatId = chatRoomId;
//     setupScreen.classList.add('hidden');
//     chatScreen.classList.remove('hidden');
//     displayChatId.innerText = currentChatId;
//     loadMessages();
// });

// // --- WhatsApp Style REPLY & SEND ---
// document.getElementById('send-btn').addEventListener('click', async () => {
//     const text = messageInput.value.trim();
//     if (!text) return;
    
//     messageInput.value = ''; 
    
//     try {
//         const messagesRef = ref(db, 'messages/' + currentChatId);
//         const newMessageRef = push(messagesRef);
//         await set(newMessageRef, {
//             user: currentUser,
//             text: text,
//             createdAt: Date.now() 
//         });
//     } catch (error) {
//         console.error("Message send fail: ", error);
//         alert("It didn`t Connect to Firebase .");
//     }
// });
// messageInput.addEventListener('keydown', (e) => {
//     // Check karein ki Enter dabaya gaya hai (lekin Shift+Enter nahi)
//     if (e.key === 'Enter' && !e.shiftKey) {
//         e.preventDefault(); // Default behavior (new line) ko rokne ke liye
        
//         const text = messageInput.value.trim();
//         if (text) {
//             document.getElementById('send-btn').click(); // Send button ko trigger karein
//         }
//     }
// });





// // --- LOAD MESSAGES (Improved for Persistence) ---

// function loadMessages() {
//     const messagesRef = ref(db, 'messages/' + currentChatId);
    
//     onValue(messagesRef, (snapshot) => {
//         if (snapshot.exists()) {
//             snapshot.forEach((childSnapshot) => {
//                 const data = childSnapshot.val();
//                 const msgKey = childSnapshot.key;
                
//                 // Agar msg naya hai, toh local state mein daalo
//                 if (!localMessages[msgKey]) {
//                     localMessages[msgKey] = data;
//                     renderAllMessages(); // Re-render everything
                    
//                     // 30 Sec baad DB se delete, par UI mein rahega
//                     setTimeout(() => {
//                         remove(ref(db, `messages/${currentChatId}/${msgKey}`));
//                     }, 30000);
//                 }
//             });
//         }
//     });
// }

// function renderAllMessages() {
//     messagesContainer.innerHTML = '';
//     Object.keys(localMessages).forEach(key => {
//         renderMessage(localMessages[key], key);
//     });
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }

// // --- MESSAGE DESIGN (With Reply & Delete Icons) ---

// function renderMessage(data, msgKey) {
//     const isMine = data.user === currentUser;
//     const msgDiv = document.createElement('div');
//     msgDiv.className = `message ${isMine ? 'mine' : 'other'}`;
//     msgDiv.id = `msg-${msgKey}`;

//     let replyHTML = data.replyTo ? `<div class="reply-content">↳ ${data.replyTo.text}</div>` : "";

//     msgDiv.innerHTML = `
//         ${replyHTML}
//         <strong>${isMine ? 'You' : data.user}</strong>
//         <p>${data.text}</p>
//         <div class="msg-actions">
//             <span onclick="setReply('${msgKey}')" title="Reply">↩️</span>
//             ${isMine ? `<span onclick="manualDelete('${msgKey}')" title="Delete">🗑️</span>` : ""}
//         </div>
//     `;
//     messagesContainer.appendChild(msgDiv);
// }

// // Global functions for actions
// window.setReply = (key) => {
//     const msg = localMessages[key];
//     replyToMessage = { user: msg.user, text: msg.text };
//     messageInput.placeholder = `Replying to ${msg.user}...`;
//     messageInput.focus();
// };

// window.manualDelete = (key) => {
//     if(confirm("Do you want delete This msg")) {
//         delete localMessages[key]; // Local se hatao
//         renderAllMessages();
//     }
// };

// function cancelReply() {
//     replyToMessage = null;
//     messageInput.placeholder = "Type a message...";
// }





import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import firebaseConfig from './firebase.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = "";
let currentChatId = "";
let replyToMessage = null; 
let localMessages = {}; 

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username');
const chatIdInput = document.getElementById('chat-id-input');
const displayChatId = document.getElementById('display-chat-id');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const generateIdBtn = document.getElementById('generate-id-btn');

// --- Helper Functions ---

function generateRandomRoomId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

generateIdBtn.addEventListener('click', () => {
    chatIdInput.value = generateRandomRoomId();
});

document.getElementById('join-btn').addEventListener('click', () => {
    const name = usernameInput.value.trim();
    const chatRoomId = chatIdInput.value.trim().toUpperCase();
    if (!name || !chatRoomId) return alert("Details bhariye!");
    
    currentUser = name;
    currentChatId = chatRoomId;
    setupScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    displayChatId.innerText = currentChatId;
    loadMessages();
});

// --- WhatsApp Style REPLY & SEND (FIXED ✅) ---

document.getElementById('send-btn').addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;
    
    try {
        const messagesRef = ref(db, 'messages/' + currentChatId);
        const newMessageRef = push(messagesRef);
        
        // YAHAN FIX: replyTo data ko Firebase bhejna zaroori hai
        await set(newMessageRef, {
            user: currentUser,
            text: text,
            createdAt: Date.now(),
            replyTo: replyToMessage // Agar null hai toh kuch nahi jayega, agar data hai toh jayega
        });

        // Clear input and reply status
        messageInput.value = ''; 
        cancelReply(); 
    } catch (error) {
        console.error("Message send fail: ", error);
    }
});

// Enter key se send (FIXED ✅)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('send-btn').click();
    }
});

// --- LOAD & RENDER MESSAGES ---

function loadMessages() {
    const messagesRef = ref(db, 'messages/' + currentChatId);
    onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const msgKey = childSnapshot.key;
                
                if (!localMessages[msgKey]) {
                    localMessages[msgKey] = data;
                    renderAllMessages(); 
                    
                    setTimeout(() => {
                        remove(ref(db, `messages/${currentChatId}/${msgKey}`));
                    }, 30000);
                }
            });
        }
    });
}

function renderAllMessages() {
    messagesContainer.innerHTML = '';
    Object.keys(localMessages).forEach(key => {
        renderMessage(localMessages[key], key);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessage(data, msgKey) {
    const isMine = data.user === currentUser;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMine ? 'mine' : 'other'}`;
    msgDiv.id = `msg-${msgKey}`;

    // Reply Box design inside message
    let replyHTML = data.replyTo ? 
        `<div class="reply-content">
            <small>↳ ${data.replyTo.user}</small>
            <p>${data.replyTo.text}</p>
        </div>` : "";

    msgDiv.innerHTML = `
        ${replyHTML}
        <strong>${isMine ? 'You' : data.user}</strong>
        <p>${data.text}</p>
        <div class="msg-actions">
            <span onclick="setReply('${msgKey}')">↩️ Reply</span>
            ${isMine ? `<span onclick="manualDelete('${msgKey}')">🗑️ Delete</span>` : ""}
        </div>
    `;

    // --- Slide to Reply Logic (For Mobile) ---
    let startX = 0;
    msgDiv.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, {passive: true});
    msgDiv.addEventListener('touchmove', (e) => {
        let diff = e.touches[0].clientX - startX;
        if (diff > 0 && diff < 70) msgDiv.style.transform = `translateX(${diff}px)`;
    }, {passive: true});
    msgDiv.addEventListener('touchend', (e) => {
        let diff = e.changedTouches[0].clientX - startX;
        if (diff > 50) window.setReply(msgKey);
        msgDiv.style.transform = `translateX(0px)`;
    });

    messagesContainer.appendChild(msgDiv);
}

// --- Global Actions ---

window.setReply = (key) => {
    const msg = localMessages[key];
    replyToMessage = { user: msg.user, text: msg.text };
    
    // UI Visual Hint
    messageInput.style.borderTop = "3px solid #00c6ff";
    messageInput.placeholder = `Replying to ${msg.user}...`;
    messageInput.focus();
};

window.manualDelete = (key) => {
    if(confirm("Do you want to delete this message?")) {
        delete localMessages[key];
        renderAllMessages();
    }
};

function cancelReply() {
    replyToMessage = null;
    messageInput.style.borderTop = "none";
    messageInput.placeholder = "Type a message...";
}

// LEAVE CHAT
document.getElementById('leave-btn').addEventListener('click', () => {
    window.location.reload(); 
});