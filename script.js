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
    colors: ['#90caf9', '#64b5f6', '#e3f2fd', '#ffffff'] // Confetti colors
};

// ==============================================================================
//  Module: App Core
// ==============================================================================

const App = (() => {
    let db; // Firestore instance
    let hasCelebrated = false; // 실시간 D-Day 달성 축하 여부 플래그

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
        
        let hasCelebrated = false;
        // 이미 날짜가 지났다면 축하 효과는 생략
        if (CONFIG.weddingDate - new Date() <= 0) {
            hasCelebrated = true;
        }

        let currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];

        const updateView = () => {
            const now = new Date();
            const diff = CONFIG.weddingDate - now;

            if (diff <= 0) {
                const elapsedDays = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24)) + 1;
                if (phraseEl) phraseEl.innerText = "❤️ 저희 결혼했습니다 ❤️";
                if (timeEl) timeEl.innerText = `결혼한 지 ${elapsedDays}일째`;

                // 실시간으로 0이 되는 걸 본 사람에게만 축하 콘페티 연사 (10초)
                if (!hasCelebrated) {
                    hasCelebrated = true;
                    const celebrationInterval = setInterval(() => {
                        if (fireConfetti) {
                            fireConfetti({
                                particleCount: 60, spread: 80, origin: { y: 0.65 },
                                colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365'],
                                disableForReducedMotion: true
                            });
                        }
                    }, 150);
                    setTimeout(() => clearInterval(celebrationInterval), 10000);
                }
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

        // 10초마다 멘트 변경
        setInterval(() => {
            currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            updateView();
        }, 10000);

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
        const submitPhrases = ["전송하기 💌", "축하해주기 💕", "메시지 슝~ 🚀", "소중한 글 등록 ✨", "신랑신부에게 💌", "덕담 남기기 🍀", "사랑을 담아 전송 ❤️"];
        
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
        let isAdmin = sessionStorage.getItem(ADMIN_KEY) === 'true';
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
                sessionStorage.removeItem(ADMIN_KEY);
                document.body.classList.remove('admin-mode');
                location.reload();
                return;
            }
            const pw = prompt("관리자 비밀번호를 입력하세요");
            if (pw === null) return;
            const hash = await hashPassword(pw);
            if (hash === ADMIN_PW_HASH) {
                isAdmin = true;
                sessionStorage.setItem(ADMIN_KEY, 'true');
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

        // Toast Function
        const showToast = (msg) => {
            let toast = document.getElementById('copy-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'copy-toast';
                toast.className = 'toast';
                toast.innerHTML = '<span class="toast-icon">✅</span><span>' + msg + '</span>';
                document.body.appendChild(toast);
            }
            toast.querySelector('span:last-child').textContent = msg;
            toast.classList.add('show');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
        };

        // Account Copy Function
        window.copyAccount = (accountNumber) => {
            const cleaned = accountNumber.replace(/-/g, '');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(cleaned).then(() => {
                    showToast("계좌번호가 복사되었습니다.");
                }).catch(err => {
                    console.error("Copy failed:", err);
                    // Fallback
                    const textArea = document.createElement("textarea");
                    textArea.value = cleaned;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    showToast("계좌번호가 복사되었습니다.");
                });
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = cleaned;
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

        // Share Functions
        if (window.Kakao && !Kakao.isInitialized()) {
            Kakao.init('fb1460645c1f12b6d4d57e705b5b188c');
        }

        window.shareKakao = () => {
            if (!window.Kakao || !Kakao.isInitialized()) {
                showToast("카카오 공유를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
                return;
            }
            Kakao.Share.sendCustom({
                templateId: 131991,
                templateArgs: {
                    title: '이재석 ❤️ 신예진의 청첩장',
                    description: '2026년 9월 5일 오후 12시 더베뉴지서울',
                },
            });
        };

        window.copyLink = () => {
            const url = window.location.href;
            const onSuccess = () => showToast("청첩장 주소가 복사되었습니다.");
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(onSuccess).catch(() => {
                    const textArea = document.createElement("textarea");
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    onSuccess();
                });
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                onSuccess();
            }
        };
    };

    // --- 4. Gallery Dynamic Loading ---
    const initGallery = async () => {
        const container = document.querySelector('.gallery-container');
        if (!container) return;

        const tryLoad = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });

        let i = 1;
        while (true) {
            const src = `images/photos/gallery${i}.jpeg`;
            const ok = await tryLoad(src);
            if (!ok) break;

            const wrapper = document.createElement('div');
            wrapper.className = 'gallery-item-wrapper';
            const img = document.createElement('img');
            img.src = src;
            img.alt = `웨딩사진${i}`;
            img.className = 'gallery-item';
            img.loading = 'lazy';
            img.draggable = false;
            wrapper.appendChild(img);
            container.appendChild(wrapper);
            i++;
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
        const modalPrev = document.getElementById('modal-prev');
        const modalNext = document.getElementById('modal-next');
        const modalDotsEl = document.getElementById('modal-dots');
        const modalCounterText = document.getElementById('modal-counter-text');
        const modalFooter = document.getElementById('modal-footer');

        // 갤러리 이미지만 네비게이션 대상
        const galleryImages = Array.from(document.querySelectorAll('.gallery-item-wrapper img'));
        let currentModalIndex = 0;
        let isGalleryModal = false;

        // 닷 생성
        galleryImages.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'modal-dot';
            dot.addEventListener('click', (e) => { e.stopPropagation(); goToImage(i); });
            modalDotsEl.appendChild(dot);
        });

        function updateModalIndicators() {
            modalDotsEl.querySelectorAll('.modal-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentModalIndex);
            });
            modalCounterText.textContent = `${currentModalIndex + 1} / ${galleryImages.length}`;
        }

        function goToImage(index) {
            if (index < 0) index = galleryImages.length - 1;
            if (index >= galleryImages.length) index = 0;
            currentModalIndex = index;
            modalImg.src = galleryImages[currentModalIndex].src;
            updateModalIndicators();
        }

        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportNoZoom = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        const viewportZoom = 'width=device-width, initial-scale=1.0';

        // 스크롤 이벤트 핸들러
        const preventScroll = (e) => {
            // 약도 모달(map mode)일 때는 패닝 허용
            if (!isGalleryModal) return;
            // 핀치 줌(두 손가락 이상)일 때는 막지 않음
            if (e.touches && e.touches.length > 1) return;
            if (e.cancelable) e.preventDefault();
        };

        function openModal(src, index, isGallery) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            modalImg.src = src;
            modalImg.style.opacity = '1';
            isGalleryModal = isGallery;
            currentModalIndex = index;
            if (modalFooter) modalFooter.style.display = isGallery ? 'flex' : 'none';
            if (isGallery) updateModalIndicators();
            // 지도 모달일 때는 블러 보호 제외, 아이보리 배경 적용
            modal.classList.toggle('map-mode', !isGallery);
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) modalContent.classList.toggle('no-blur', !isGallery);
            
            // 모달 활성화 시 배경 스크롤 차단
            document.body.addEventListener('touchmove', preventScroll, { passive: false });
            document.body.style.overflow = 'hidden';

            // 약도 모달일 때 핀치줌 허용
            if (!isGallery && viewportMeta) viewportMeta.setAttribute('content', viewportZoom);

            // 뒤로가기 제어: 히스토리 추가
            history.pushState({ modal: 'open' }, '');
        }

        function closeModal() {
            // 약도 모달이었으면 핀치줌 다시 잠금
            if (!isGalleryModal && viewportMeta) viewportMeta.setAttribute('content', viewportNoZoom);

            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            
            // 모달 닫을 시 스크롤 차단 해제
            document.body.removeEventListener('touchmove', preventScroll);
            document.body.style.overflow = '';

            // 뒤로가기 제어: 히스토리 상태가 있다면 되돌리기
            if (history.state && history.state.modal === 'open') {
                history.back();
            }
        }

        // 브라우저 뒤로가기 이벤트 감지
        window.addEventListener('popstate', (event) => {
            if (modal.style.display === 'flex') {
                // 약도 모달이었으면 핀치줌 다시 잠금
                if (!isGalleryModal && viewportMeta) viewportMeta.setAttribute('content', viewportNoZoom);
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });

        // 갤러리 클릭
        document.querySelectorAll('.gallery-item-wrapper').forEach((wrapper, i) => {
            wrapper.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) openModal(img.src, i, true);
            });
        });

        // 지도 이미지 클릭 (네비게이션 없음)
        document.querySelectorAll('.map-image-wrapper').forEach(wrapper => {
            wrapper.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) openModal(img.src, 0, false);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (modalPrev) modalPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            goToImage(currentModalIndex - 1);
        });
        if (modalNext) modalNext.addEventListener('click', (e) => {
            e.stopPropagation();
            goToImage(currentModalIndex + 1);
        });

        // 키보드 네비게이션
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'none') return;
            if (e.key === 'ArrowLeft' && isGalleryModal) goToImage(currentModalIndex - 1);
            if (e.key === 'ArrowRight' && isGalleryModal) goToImage(currentModalIndex + 1);
            if (e.key === 'Escape') closeModal();
        });

        // 터치 스와이프
        let swipeTouchStartX = 0;
        let swipeTouchStartY = 0;
        modal.addEventListener('touchstart', (e) => {
            swipeTouchStartX = e.touches[0].clientX;
            swipeTouchStartY = e.touches[0].clientY;
        }, { passive: true });
        modal.addEventListener('touchend', (e) => {
            if (!isGalleryModal) return;
            const dx = e.changedTouches[0].clientX - swipeTouchStartX;
            const dy = e.changedTouches[0].clientY - swipeTouchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                if (dx < 0) goToImage(currentModalIndex + 1);
                else goToImage(currentModalIndex - 1);
            }
        }, { passive: true });

        // Confetti
        setTimeout(() => {
            if (fireConfetti) {
                fireConfetti({
                    particleCount: 600, spread: 60, origin: { y: 0.8 },
                    colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365'],
                    disableForReducedMotion: true
                });
            }
        }, 500);

        // D-Day Box Click & Long-press Confetti (Scroll-safe)
        const dDayBox = document.querySelector('.d-day-box');
        if (dDayBox) {
            let confettiInterval = null;
            let isMoving = false;

            const startConfetti = () => {
                isMoving = false; // 이동 상태 초기화
                if (confettiInterval) return;

                // 즉시 한 번 터뜨림 (스크롤 시작일 수도 있으므로 일단 한 번만)
                if (fireConfetti) {
                    fireConfetti({
                        particleCount: 80, spread: 70, origin: { y: 0.6 },
                        colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365']
                    });
                }

                // 150ms 간격으로 더 빠르게 연사
                confettiInterval = setInterval(() => {
                    if (!isMoving && fireConfetti) {
                        fireConfetti({
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

        // Main Photo
        const mainPhoto = document.querySelector('.main-photo-wrapper');
        if (mainPhoto) {
            mainPhoto.style.cursor = 'pointer';
            mainPhoto.addEventListener('click', () => {
                if (fireConfetti) {
                    fireConfetti({
                        particleCount: 80, spread: 70, origin: { y: 0.6 },
                        colors: ['#90caf9', '#ff8a80', '#ffffff', '#f6d365']
                    });
                }
            });
        }

        // --- Scroll Reveal (IntersectionObserver) ---
        const revealTargets = document.querySelectorAll(
            '.main-header, .calendar-section, .contact-section, ' +
            '.gallery-section, .map-section, .account-section, ' +
            '.guestbook-section, .share-section'
        );
        revealTargets.forEach(el => el.classList.add('scroll-reveal'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target); // 한 번만 실행
                }
            });
        }, { 
            threshold: 0.25, // 25% 이상 보일 때 시작 (더 늦게 등장)
            rootMargin: '0px 0px -30px 0px' // 하단에서 30px 더 올라왔을 때 감지
        });

        revealTargets.forEach(el => revealObserver.observe(el));
    };

    // --- Init Sequence ---
    const init = async () => {
        initFirebase();
        initDday();
        initGuestbook();
        await initGallery();
        initUI();
    };

    return { init };
})();

// 전용 confetti 캔버스 인스턴스
// useWorker:false → OffscreenCanvas 미사용, 모바일 백그라운드 복귀 시 흰 화면 방지
// 캔버스 미리 생성 → 첫 호출 시 생성/표시 타이밍 플래시 없음
let fireConfetti;
document.addEventListener('DOMContentLoaded', () => {
    if (typeof confetti === 'function') {
        const confettiCanvas = document.createElement('canvas');
        confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999999;background:transparent;';
        document.body.appendChild(confettiCanvas);
        fireConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: false });
    }
    App.init();
});

// 다른 앱 복귀 시 confetti 파티클 초기화 (캔버스는 유지)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && fireConfetti) {
        fireConfetti.reset();
    }
});

// --- Font Size Control ---
const FONT_SIZES = [13, 14, 15, 16, 18]; // 1~5단계 (px) - 기존 대비 축소
const FONT_SIZE_KEY = 'wedding_font_size';
let currentFontLevel = parseInt(localStorage.getItem(FONT_SIZE_KEY) || '1'); // 기본값 1단계로 변경

const applyFontSize = (level) => {
    currentFontLevel = level;
    document.documentElement.style.fontSize = FONT_SIZES[level - 1] + 'px';
    const label = document.getElementById('font-size-label');
    if (label) label.textContent = level + '/5';
    localStorage.setItem(FONT_SIZE_KEY, String(level));
};

window.cycleFontSize = () => {
    applyFontSize(currentFontLevel >= 5 ? 1 : currentFontLevel + 1);
};

// 페이지 로드 시 저장된 크기 적용
applyFontSize(currentFontLevel);

// --- Zoom Blur Protection ---
const blurTargetSelectors = ['.main-photo', '.gallery-item', '.modal-content'];

function applyZoomBlur(scale) {
    const blurValue = scale > 1.05 ? `blur(${(scale - 1) * 8}px)` : '';
    blurTargetSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.classList.contains('no-blur')) return;
            el.style.filter = blurValue;
        });
    });
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        applyZoomBlur(window.visualViewport.scale);
    });
}

// --- Main Photo Ver Select (임시) ---
const _mainPhotos = ['images/photos/main_t1.jpeg', 'images/photos/main_t2.jpeg'];
window.setMainPhoto = function(idx) {
    const img = document.getElementById('main-photo-img');
    if (img) img.src = _mainPhotos[idx];
    document.getElementById('ver-btn-1').classList.toggle('active', idx === 0);
    document.getElementById('ver-btn-2').classList.toggle('active', idx === 1);
};
// 최초 랜덤 선택
(function() {
    const randIdx = Math.floor(Math.random() * _mainPhotos.length);
    document.addEventListener('DOMContentLoaded', function() { setMainPhoto(randIdx); });
})();
