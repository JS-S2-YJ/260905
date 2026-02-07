import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/**
 * ==============================================================================
 *  Wedding App Configuration & Logic
 *  (Refactored for modularity and cleanliness)
 * ==============================================================================
 */

const CONFIG = {
    weddingDate: new Date('2026-02-08T15:30:00+09:00'), // 테스트용 오늘 날짜
    firebase: {
        apiKey: "AIzaSyBV2BF5OORqW42zQAv8BAunXFnHbTD1l8k",
        authDomain: "wedding-guestbook-c8238.firebaseapp.com",
        projectId: "wedding-guestbook-c8238",
        storageBucket: "wedding-guestbook-c8238.firebasestorage.app",
        messagingSenderId: "216248864330",
        appId: "1:216248864330:web:339891de4f5a92659860b3"
    },
    youtube: {
        videoId: 'QM8UMOERycA'
    },
    colors: ['#90caf9', '#64b5f6', '#e3f2fd', '#ffffff'] // Confetti colors
};

// ==============================================================================
//  Module: App Core
// ==============================================================================

const App = (() => {
    let db; // Firestore instance
    let player; // Youtube Player instance
    let isMusicPlaying = false;

    // --- 1. Firebase Initialization ---
    const initFirebase = () => {
        try {
            const app = initializeApp(CONFIG.firebase);
            db = getFirestore(app);
            // console.log("Firebase initialized");
        } catch (error) {
            console.error("Firebase init error:", error);
        }
    };

    // --- 2. D-Day Counter ---
    const initDday = () => {
        const phrases = [
            "유부 월드 입장까지", "다이어트 마감까지", "자유 이용권 만료까지", "품절남녀 되기까지",
            "현실 부부 되기까지", "평생 짝꿍 만나기까지", "두 손 꼭 잡기까지", "꽃길 걷기 시작까지",
            "한 지붕 아래 살기까지", "매일 아침 함께하기까지", "서로의 빛이 되기까지", "귀한 발걸음 하시기까지",
            "새로운 출발을 하기까지", "아름다운 약속의 날까지", "가장 행복한 날까지", "반가운 얼굴 뵙기까지",
            "사랑의 결실을 맺기까지", "따뜻한 격려 받기까지", "맛있는 식사 드시기까지"
        ];
        
        const phraseEl = document.getElementById('d-day-phrase');
        const timeEl = document.getElementById('d-day-time');
        
        let currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];

        // 10초마다 멘트 변경
        setInterval(() => {
            currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            updateView();
        }, 10000);

        const updateView = () => {
            const now = new Date();
            const diff = CONFIG.weddingDate - now;

            if (diff <= 0) {
                if (phraseEl) phraseEl.innerText = "❤️ 저희 결혼했습니다 ❤️";
                if (timeEl) timeEl.innerText = "";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const fmt = (n) => String(n).padStart(2, '0');
            const dayText = days === 0 ? "D-DAY" : `D-${days}일`;

            if (phraseEl) phraseEl.textContent = currentPhrase;
            if (timeEl) timeEl.textContent = `${dayText} ${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`;
        };

        setInterval(updateView, 1000);
        updateView();
    };

    // --- 3. Guestbook (Logic + UI) ---
    const initGuestbook = () => {
        const inputEl = document.getElementById('guest-message');
        const submitBtn = document.querySelector('.guestbook-form button');
        const listEl = document.getElementById('guestbook-list');

        // Placeholder randomization
        const placeholders = [
            "축하의 말을 남겨주세요 🙏", "두 사람의 앞날을 축복해 주세요 ✨", "따뜻한 축하의 한마디 부탁드려요 :)",
            "행복하게 잘 살라는 응원 메시지!", "서로 아껴주며 살라는 덕담 한마디 💌", "귀한 발걸음 감사합니다.",
            "가장 기억에 남는 축하 메시지를 적어주세요.", "사랑스러운 신랑신부에게 한마디!", "꽃길만 걸으라는 따뜻한 말 한마디 🌸",
            "오늘의 기쁨을 함께 나누어 주세요.", "짧아도 좋습니다. 마음을 전해주세요 💕", "센스 있는 축하 멘트 기대할게요 😉",
            "꿀 떨어지는 덕담 부탁드립니다 🍯", "결혼 선배님의 피가 되고 살이 되는 조언!", "첫 부부싸움은 칼로 물 베기라고 전해주세요 ⚔️",
            "검은 머리 파뿌리 될 때까지 행복하라고...", "솔로 탈출 축하 메시지 대환영! 🎉", "밥 맛있게 드시고 축하도 많이 해주세요! 🍚",
            "신랑신부 미모 칭찬은 언제나 환영입니다!", "사랑의 유효기간은 '평생'이라고 적어주세요 ❤️"
        ];
        if (inputEl) inputEl.placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

        // Button Animation Logic
        const submitPhrases = ["전송하기 ✈️", "축하해주기 💕", "메시지 슝~ 🚀", "소중한 글 등록 ✨", "신랑신부에게 💌", "덕담 남기기 🍀", "사랑을 담아 전송 ❤️"];
        
        if (inputEl && submitBtn) {
            inputEl.addEventListener('input', () => {
                if (inputEl.value.trim() !== "") {
                    if (!submitBtn.classList.contains('btn-active')) {
                        submitBtn.innerText = submitPhrases[Math.floor(Math.random() * submitPhrases.length)];
                        submitBtn.classList.add('btn-active');
                    }
                } else {
                    submitBtn.classList.remove('btn-active');
                    submitBtn.innerText = "등록하기";
                }
            });
        }

        // Real-time List Listener
        const q = query(collection(db, "guestbook"), orderBy("date", "desc"));
        onSnapshot(q, (snapshot) => {
            if (!listEl) return;
            listEl.innerHTML = "";
            let idx = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                const sideClass = idx % 2 === 0 ? 'msg-left' : 'msg-right';
                const html = `
                    <div class="msg-row ${sideClass}">
                        <div class="msg-bubble">${data.message}</div>
                    </div>`;
                listEl.insertAdjacentHTML('beforeend', html);
                idx++;
            });
        });

        // Submit Handler (Exposed globally for HTML onclick)
        window.writeGuestbook = async () => {
            if (!inputEl) return;
            const msg = inputEl.value;
            if (!msg) {
                alert("내용을 입력해주세요!");
                return;
            }
            try {
                await addDoc(collection(db, "guestbook"), {
                    message: msg,
                    date: new Date().toISOString()
                });
                inputEl.value = "";
                submitBtn.classList.remove('btn-active');
                submitBtn.innerText = "등록하기";
                // alert("메시지가 등록되었습니다! 🎉"); // Optional: Too many alerts can be annoying
            } catch (e) {
                console.error("Write error:", e);
                alert("등록 실패 ㅠㅠ");
            }
        };
    };

    // --- 4. YouTube Music Player ---
    const initMusic = () => {
        // Load API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(tag, firstScript);
        }

        // Define callback globally
        window.onYouTubeIframeAPIReady = () => {
            player = new YT.Player('player', {
                height: '100%', width: '100%',
                videoId: CONFIG.youtube.videoId,
                playerVars: {
                    'autoplay': 0, 'controls': 0, 'rel': 0, 
                    'playsinline': 1, 'loop': 1, 
                    'playlist': CONFIG.youtube.videoId, 'mute': 0
                },
                events: {
                    'onReady': () => { /* Ready */ }
                }
            });
        };

        // Button Controller
        const btn = document.getElementById('music-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (!player || typeof player.playVideo !== 'function') return;
                
                const icon = btn.querySelector('.icon');
                const text = btn.querySelector('.text');

                if (isMusicPlaying) {
                    player.pauseVideo();
                    icon.innerText = "🔇"; text.innerText = "BGM 켜기";
                    btn.classList.remove('playing');
                    btn.style.background = "rgba(255, 255, 255, 0.9)";
                    isMusicPlaying = false;
                } else {
                    player.playVideo();
                    icon.innerText = "🎵"; text.innerText = "BGM 끄기";
                    btn.classList.add('playing');
                    btn.style.background = "rgba(255, 233, 236, 0.95)";
                    isMusicPlaying = true;
                }
            });
        }
    };

    // --- 5. UI Effects (Modal, Protection, Confetti) ---
    const initUI = () => {
        // Image Protection
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('dragstart', e => e.preventDefault());

        // Modal
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const closeBtn = document.querySelector('.close-btn');
        const wrappers = document.querySelectorAll('.gallery-item-wrapper, .map-image-wrapper');

        wrappers.forEach(wrapper => {
            wrapper.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img && modal) {
                    modal.style.display = 'flex';
                    modalImg.src = img.src;
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Confetti
        setTimeout(() => {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 600, spread: 60, origin: { y: 0.8 },
                    colors: CONFIG.colors, disableForReducedMotion: true
                });
            }
        }, 500);
    };

    // --- Init Sequence ---
    const init = () => {
        initFirebase();
        initDday();
        initMusic();
        initGuestbook();
        initUI();
    };

    return { init };
})();

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);