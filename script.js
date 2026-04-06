import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, getDocs, startAfter, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/**
 * ==============================================================================
 *  Wedding App Configuration & Logic
 *  (Refactored for modularity and cleanliness)
 * ==============================================================================
 */

const CONFIG = {
    weddingDate: new Date('2026-09-05T12:00:00+09:00'),
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
            const fmt = (n) => String(n).padStart(2, '0');

            if (diff <= 0) {
                const absDiff = Math.abs(diff);
                const passedDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                const passedHours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const passedMinutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
                const passedSeconds = Math.floor((absDiff % (1000 * 60)) / 1000);

                if (phraseEl) phraseEl.innerHTML = "❤️ 저희 결혼했습니다 ❤️<br>행복하게 잘 살겠습니다";
                if (timeEl) timeEl.textContent = `함께한 지 +${passedDays}일 ${fmt(passedHours)}:${fmt(passedMinutes)}:${fmt(passedSeconds)}`;
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
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

        let lastVisible = null;
        let isLoading = false;
        let isEnd = false;
        const PAGE_SIZE = 5;
        const loadMoreBtn = document.getElementById('load-more-btn');

        // 쿨다운 (도배 방지)
        const COOLDOWN_SECONDS = 30;
        const COOLDOWN_KEY = 'guestbook_cooldown_until';

        // 관리자 모드
        const ADMIN_PW_HASH = 'c9aae1ce021698a4ea4c1c5243c2a6dd80d090395086c545244121753b89291d'; // SHA-256 해시
        const ADMIN_KEY = 'guestbook_admin';
        let isAdmin = localStorage.getItem(ADMIN_KEY) === 'true';
        if (isAdmin) document.body.classList.add('admin-mode');

        const hashPassword = async (pw) => {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const animalEmojis = [
            "🐶", "🐱", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", 
            "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🦋", "🐌", "🐞", "🐜", "🦗", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", 
            "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", 
            "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🐈", "🐓", "🦃", "🦚", " Parrot", "🦢", "🦩", "🕊️", 
            "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲", "🌵", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", 
            "🍀", "🎍", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚", "⭐", "🌟", "✨"
        ];

        const escapeHtml = (str) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

        const createMsgHtml = (data, docId) => {
            const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
            return `
                <div class="guest-speech-bubble-wrapper" data-doc-id="${docId || ''}">
                    <div class="guest-animal-avatar">${randomEmoji}</div>
                    <div class="guest-speech-bubble">
                        <div class="guest-msg-text">${escapeHtml(data.message)}</div>
                        <button class="admin-delete-btn" onclick="deleteMessage('${docId}')">삭제</button>
                    </div>
                </div>`;
        };

        // 쿨다운 타이머
        const runCooldownTimer = () => {
            const until = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0');
            const remaining = Math.ceil((until - Date.now()) / 1000);
            if (remaining <= 0) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-cooldown');
                    submitBtn.innerText = "등록하기";
                }
                return;
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-cooldown');
                submitBtn.classList.remove('btn-active');
                submitBtn.innerText = `${remaining}초 후 등록 가능`;
            }
            setTimeout(runCooldownTimer, 1000);
        };

        const startCooldown = () => {
            localStorage.setItem(COOLDOWN_KEY, Date.now() + COOLDOWN_SECONDS * 1000);
            runCooldownTimer();
        };

        // 페이지 로드 시 쿨다운 복원
        if (parseInt(localStorage.getItem(COOLDOWN_KEY) || '0') > Date.now()) {
            runCooldownTimer();
        }

        // 관리자 토글
        window.toggleAdmin = async () => {
            if (isAdmin) {
                isAdmin = false;
                localStorage.removeItem(ADMIN_KEY);
                document.body.classList.remove('admin-mode');
                location.reload();
                return;
            }
            const pw = prompt("관리자 비밀번호를 입력하세요");
            if (pw === null) return;
            const hash = await hashPassword(pw);
            if (hash === ADMIN_PW_HASH) {
                isAdmin = true;
                localStorage.setItem(ADMIN_KEY, 'true');
                document.body.classList.add('admin-mode');
                location.reload();
            } else {
                alert("비밀번호가 틀렸습니다");
            }
        };

        // 메시지 삭제 (soft delete)
        window.deleteMessage = async (docId) => {
            if (!isAdmin || !docId) return;
            if (!confirm("이 메시지를 숨기겠습니까?")) return;
            try {
                await updateDoc(doc(db, "guestbook", docId), { hidden: true });
                const el = document.querySelector(`[data-doc-id="${docId}"]`);
                if (el) el.remove();
            } catch (e) {
                console.error("Delete error:", e);
                alert("삭제 실패. Firestore 규칙을 확인해주세요.");
            }
        };

        const qInitial = query(collection(db, "guestbook"), orderBy("date", "desc"), limit(PAGE_SIZE));
        onSnapshot(qInitial, (snapshot) => {
            if (!listEl) return;

            const liveDocs = [];
            snapshot.forEach(docSnap => {
                if (!docSnap.data().hidden) liveDocs.push({ data: docSnap.data(), id: docSnap.id });
            });

            const currentItemsCount = listEl.querySelectorAll('.guest-speech-bubble-wrapper').length;
            if (currentItemsCount <= PAGE_SIZE) {
                listEl.innerHTML = liveDocs.map(({ data, id }) => createMsgHtml(data, id)).join('');
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }
            
            if (snapshot.docs.length < PAGE_SIZE) {
                isEnd = true;
                if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            } else if (!isEnd) {
                if (loadMoreBtn) loadMoreBtn.classList.remove('hidden');
            }
        });

        const loadMore = async () => {
            if (isLoading || isEnd || !lastVisible) return;
            isLoading = true;
            if (loadMoreBtn) loadMoreBtn.innerText = "불러오는 중...";
            try {
                const nextQ = query(collection(db, "guestbook"), orderBy("date", "desc"), startAfter(lastVisible), limit(PAGE_SIZE));
                const snapshot = await getDocs(nextQ);
                if (snapshot.empty) {
                    isEnd = true;
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                    return;
                }
                snapshot.forEach((docSnap) => {
                    if (!docSnap.data().hidden) {
                        listEl.insertAdjacentHTML('beforeend', createMsgHtml(docSnap.data(), docSnap.id));
                    }
                });
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
                if (snapshot.docs.length < PAGE_SIZE) {
                    isEnd = true;
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                } else {
                    if (loadMoreBtn) loadMoreBtn.innerText = "축하 메시지 더보기 ▾";
                }
            } catch (e) {
                console.error("Load more error:", e);
            } finally {
                isLoading = false;
            }
        };

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMore);
        }

        // Submit Handler (Exposed globally for HTML onclick)
        window.writeGuestbook = async () => {
            if (!inputEl) return;
            const cooldownUntil = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0');
            if (cooldownUntil > Date.now()) return;
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
                startCooldown();
            } catch (e) {
                console.error("Write error:", e);
                alert("등록 실패 ㅠㅠ");
            }
        };

        // Account Copy Function
        window.copyAccount = (accountNumber) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(accountNumber).then(() => {
                    alert("계좌번호가 복사되었습니다. 🎉");
                }).catch(err => {
                    console.error("Copy failed:", err);
                    // Fallback
                    const textArea = document.createElement("textarea");
                    textArea.value = accountNumber;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    alert("계좌번호가 복사되었습니다. 🎉");
                });
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = accountNumber;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                alert("계좌번호가 복사되었습니다. 🎉");
            }
        };

        // Accordion Toggle Function
        window.toggleAccordion = (header) => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other accordion items
            document.querySelectorAll('.accordion-item').forEach(el => {
                el.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
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
                    icon.innerText = "🎵"; text.innerText = "BGM 켜기";
                    btn.classList.remove('playing');
                    isMusicPlaying = false;
                } else {
                    player.playVideo();
                    icon.innerText = "🔇"; text.innerText = "BGM 끄기";
                    btn.classList.add('playing');
                    isMusicPlaying = true;
                }
            });
        }
    };

    // --- 5. UI Effects (Modal, Protection, Confetti) ---
    const initUI = () => {
        // Image Protection
        document.addEventListener('contextmenu', e => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });
        document.addEventListener('dragstart', e => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });

        // 추가적인 롱터치 방어 (일부 모바일 대응)
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) e.preventDefault(); // 다중 터치 방지
            }, { passive: true });
        });

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

        // D-Day Box Click & Long-press Confetti (Scroll-safe)
        const dDayBox = document.querySelector('.d-day-box');
        if (dDayBox) {
            let confettiInterval = null;
            let isMoving = false;

            const startConfetti = (e) => {
                isMoving = false; // 이동 상태 초기화
                if (confettiInterval) return;

                // 즉시 한 번 터뜨림 (스크롤 시작일 수도 있으므로 일단 한 번만)
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 80, spread: 70, origin: { y: 0.6 },
                        colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365']
                    });
                }

                // 150ms 간격으로 더 빠르게 연사
                confettiInterval = setInterval(() => {
                    if (!isMoving && typeof confetti === 'function') {
                        confetti({
                            particleCount: 60, spread: 80, origin: { y: 0.65 },
                            colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365']
                        });
                    }
                }, 150);
            };

            const stopConfetti = () => {
                if (confettiInterval) {
                    clearInterval(confettiInterval);
                    confettiInterval = null;
                }
            };

            const handleMove = () => {
                isMoving = true; // 움직임 발생 시 연사 중단
                stopConfetti();
            };

            // 마우스 이벤트
            dDayBox.addEventListener('mousedown', startConfetti);
            window.addEventListener('mouseup', stopConfetti);
            dDayBox.addEventListener('mouseleave', stopConfetti);

            // 터치 이벤트 (스크롤 친화적)
            dDayBox.addEventListener('touchstart', startConfetti, { passive: true });
            dDayBox.addEventListener('touchmove', handleMove, { passive: true });
            window.addEventListener('touchend', stopConfetti);
            window.addEventListener('touchcancel', stopConfetti);
        }

        // Main Photo Click Confetti
        const mainPhoto = document.querySelector('.main-photo-wrapper');
        if (mainPhoto) {
            mainPhoto.style.cursor = 'pointer'; // 클릭 가능 표시
            mainPhoto.addEventListener('click', () => {
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150, spread: 80, origin: { y: 0.7 },
                        colors: CONFIG.colors
                    });
                }
            });
        }
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

// --- Zoom Blur Protection ---
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        const scale = window.visualViewport.scale;
        document.body.style.filter = scale > 1.05 ? `blur(${(scale - 1) * 8}px)` : '';
    });
}