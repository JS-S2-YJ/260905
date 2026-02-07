import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    
// --- [1] D-Day 카운트다운 (멘트는 10초마다 변경) ---
    const dDayElement = document.getElementById('d-day-count');
    const weddingDate = new Date('2026-02-08T12:00:00+09:00'); // 예식일

    // 1. 사용할 멘트 목록
    const wittyPhrases = [
        // 👋 유쾌 & 위트 (친구용)
        "유부 월드 입장까지",
        "다이어트 마감까지",
        "자유 이용권 만료까지",
        "품절남녀 되기까지",
        "현실 부부 되기까지",
        
        // 💕 로맨틱 & 감성 (신랑신부용)
        "평생 짝꿍 만나기까지",
        "두 손 꼭 잡기까지",
        "꽃길 걷기 시작까지",
        "한 지붕 아래 살기까지",
        "매일 아침 함께하기까지",
        "서로의 빛이 되기까지",

        // 🙇‍♂️ 정중 & 기대 (어르신/하객용)
        "귀한 발걸음 하시기까지",
        "새로운 출발을 하기까지",
        "아름다운 약속의 날까지",
        "가장 행복한 날까지",
        "반가운 얼굴 뵙기까지",
        "사랑의 결실을 맺기까지",
        "따뜻한 격려 받기까지",
        "맛있는 식사 드시기까지"
    ];

    // 2. 현재 보여줄 멘트 (처음엔 랜덤으로 하나 뽑아둠)
    let currentPhrase = wittyPhrases[Math.floor(Math.random() * wittyPhrases.length)];

    // 3. 멘트만 바꾸는 타이머 (10초마다 실행)
    setInterval(() => {
        currentPhrase = wittyPhrases[Math.floor(Math.random() * wittyPhrases.length)];
        // 멘트가 바뀌었으니 화면도 바로 갱신!
        updateCountdown(); 
    }, 5_000); // 10000ms = 10초

    // 4. 시계 가는 함수 (1초마다 실행)
    function updateCountdown() {
        const now = new Date();
        const diff = weddingDate - now;

        if (diff <= 0) {
            dDayElement.innerText = "❤️ 저희 결혼했습니다 ❤️";
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const formatTime = (time) => String(time).padStart(2, '0');

        // 여기서 'currentPhrase' 변수를 갖다 씁니다 (10초 동안은 똑같은 멘트 유지됨)
        // ▼ [수정] innerText -> innerHTML로 바꾸고 <br> 추가!
        // ▼ [수정] 각각 <span> 태그로 감싸서 클래스 이름을 붙여줌!
        dDayElement.innerHTML = `
            <span class="dd-phrase">${currentPhrase}</span>
            <span class="dd-time">D-${days}일 ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}</span>
        `;
    }

    // 5. 시계 타이머 시작
    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    // 2. 이미지 저장 및 롱클릭 방지 (강력한 전역 설정)
    // 우클릭 및 꾹 누르기(컨텍스트 메뉴) 무조건 차단
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        return false;
    }, { passive: false });

    // 드래그 앤 드롭 차단
    document.addEventListener('dragstart', function(event) {
        event.preventDefault();
        return false;
    }, { passive: false });

    // 3. 이미지 팝업 (모달) 기능
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.close-btn');
    
    // [수정] 래퍼(Wrapper)에 클릭 이벤트를 걸어야 함 (이미지는 pointer-events: none 이므로)
    const galleryWrappers = document.querySelectorAll('.gallery-item-wrapper, .map-image-wrapper');
    
    galleryWrappers.forEach(function(wrapper) {
        wrapper.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                modal.style.display = 'flex';
                modalImg.src = img.src;
            }
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 4. 꽃가루 효과 (Confetti)
    const weddingColors = ['#90caf9', '#64b5f6', '#e3f2fd', '#ffffff'];

    function shootConfetti() {
        confetti({
            particleCount: 600,
            spread: 60,
            origin: { y: 0.6 },
            colors: weddingColors,
            disableForReducedMotion: true
        });
    }

    // 초기 로딩 후 발사
    setTimeout(shootConfetti, 500);

    /* --- [추가] 방명록 플레이스홀더(안내 문구) 랜덤 변경 --- */
    
    // 1. 랜덤 문구 목록 (20개)
    const guestPlaceholders = [
        // 👋 정중하고 따뜻한 덕담 (어르신/직장동료용)
        "축하의 말을 남겨주세요 🙏",
        "두 사람의 앞날을 축복해 주세요 ✨",
        "따뜻한 축하의 한마디 부탁드려요 :)",
        "행복하게 잘 살라는 응원 메시지!",
        "서로 아껴주며 살라는 덕담 한마디 💌",
        "귀한 발걸음 감사합니다. 축하 글 남겨주세요.",
        "가장 기억에 남는 축하 메시지를 적어주세요.",
        "사랑스러운 신랑신부에게 한마디!",
        "꽃길만 걸으라는 따뜻한 말 한마디 🌸",
        "오늘의 기쁨을 함께 나누어 주세요.",
        "짧아도 좋습니다. 마음을 전해주세요 💕",

        // 😄 유쾌하고 센스 있는 멘트 (친구용)
        "센스 있는 축하 멘트 기대할게요 😉",
        "꿀 떨어지는 덕담 부탁드립니다 🍯",
        "결혼 선배님의 피가 되고 살이 되는 조언!",
        "첫 부부싸움은 칼로 물 베기라고 전해주세요 ⚔️",
        "검은 머리 파뿌리 될 때까지 행복하라고...",
        "솔로 탈출 축하 메시지 대환영! 🎉",
        "밥 맛있게 드시고 축하도 많이 해주세요! 🍚",
        "신랑신부 미모 칭찬은 언제나 환영입니다!",
        "사랑의 유효기간은 '평생'이라고 적어주세요 ❤️"
    ];

    // 2. 입력창(textarea) 가져오기
    const msgInputArea = document.getElementById('guest-message');

    // 3. 랜덤으로 하나 뽑아서 넣기
    if (msgInputArea) {
        const randomPlaceholder = guestPlaceholders[Math.floor(Math.random() * guestPlaceholders.length)];
        msgInputArea.placeholder = randomPlaceholder;
    }

    const submitPhrases = [
        "전송하기 ✈️",
        "축하해주기 💕",
        "메시지 슝~ 🚀",
        "소중한 글 등록 ✨",
        "신랑신부에게 💌",
        "덕담 남기기 🍀",
        "사랑을 담아 전송 ❤️"
    ];

    // [수정] 메인 사진 클릭 시 발사 (래퍼 기준)
    // [추가] 방명록 버튼 활성화 애니메이션 로직
    const guestNameInput = document.getElementById('guest-name');
    const guestMsgInput = document.getElementById('guest-message');
    const guestSubmitBtn = document.querySelector('.guestbook-form button');

    function checkGuestbookInput() {
        // 둘 다 입력되었는지 확인
        const isFilled = guestNameInput.value.trim() !== "" && guestMsgInput.value.trim() !== "";

        if (isFilled) {
            // ★ 중요: 버튼이 '비활성' -> '활성'으로 바뀔 때만 멘트를 변경함
            // (이 조건이 없으면 글자 칠 때마다 버튼 멘트가 계속 바뀝니다 ㅋㅋ)
            if (!guestSubmitBtn.classList.contains('btn-active')) {
                const randomText = submitPhrases[Math.floor(Math.random() * submitPhrases.length)];
                guestSubmitBtn.innerText = randomText;
                guestSubmitBtn.classList.add('btn-active');
            }
        } else {
            // 입력하다 지워서 다시 빈칸이 되면 원상복구
            guestSubmitBtn.classList.remove('btn-active');
            guestSubmitBtn.innerText = "등록하기"; // 기본 멘트
        }
    }

    if (guestNameInput && guestMsgInput) {
        guestNameInput.addEventListener('input', checkGuestbookInput);
        guestMsgInput.addEventListener('input', checkGuestbookInput);
    }
});

const firebaseConfig = {
  apiKey: "AIzaSyBV2BF5OORqW42zQAv8BAunXFnHbTD1l8k",
  authDomain: "wedding-guestbook-c8238.firebaseapp.com",
  projectId: "wedding-guestbook-c8238",
  storageBucket: "wedding-guestbook-c8238.firebasestorage.app",
  messagingSenderId: "216248864330",
  appId: "1:216248864330:web:339891de4f5a92659860b3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// 1. 방명록 쓰기 기능
window.writeGuestbook = async function() {
    const name = document.getElementById('guest-name').value;
    const msg = document.getElementById('guest-message').value;

    if (!name || !msg) {
        alert("이름과 내용을 모두 입력해주세요!");
        return;
    }

    try {
        await addDoc(collection(db, "guestbook"), {
            name: name,
            message: msg,
            date: new Date().toISOString() // 날짜 저장
        });
        alert("메시지가 등록되었습니다! 🎉");
        document.getElementById('guest-name').value = ""; // 입력창 비우기
        document.getElementById('guest-message').value = "";
        
        // [추가] 버튼 상태 초기화
        const btn = document.querySelector('.guestbook-form button');
        btn.classList.remove('btn-active');
        btn.innerText = "등록하기";
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("등록에 실패했습니다 ㅠㅠ");
    }
}

// 2. 방명록 읽기 기능 (실시간)
const q = query(collection(db, "guestbook"), orderBy("date", "desc"));
onSnapshot(q, (snapshot) => {
    const list = document.getElementById('guestbook-list');
    list.innerHTML = ""; // 기존 목록 초기화

    snapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.date).toLocaleDateString();
        
        const html = `
            <div class="msg-card">
                <div class="msg-name">${data.name}</div>
                <div class="msg-text">${data.message}</div>
                <div class="msg-date">${date}</div>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
    });
});

/* ==========================================================================
   🎵 유튜브 BGM 플레이어 (Play/Pause 방식)
   ========================================================================== */

let player;
let isMusicPlaying = false; // 현재 재생 중인지 체크

// 1. 유튜브 API 스크립트 로드
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. 플레이어 설정
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'QM8UMOERycA', // 🔴 영상 ID
        playerVars: {
            'autoplay': 0,      // ★ 자동재생 끔 (버튼 눌러야 시작)
            'controls': 0,      // 컨트롤러 숨김
            'rel': 0, 
            'playsinline': 1, 
            'loop': 1, 
            'playlist': 'QM8UMOERycA', // 반복 필수
            'mute': 0           // ★ 소리 켠 상태로 대기 (클릭으로 시작하니까 가능!)
        },
        events: {
            'onReady': onPlayerReady
        }
    });
};

function onPlayerReady(event) {
    // 준비돼도 바로 재생 안 함 (대기)
    console.log("영상 준비 완료 (대기 중)");
}

// 3. 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const musicBtn = document.getElementById('music-btn');
    
    if (musicBtn) {
        musicBtn.addEventListener('click', function() {
            if (!player || typeof player.playVideo !== 'function') return;

            const btnIcon = musicBtn.querySelector('.icon');
            const btnText = musicBtn.querySelector('.text');

            if (isMusicPlaying) {
                // [재생 중 -> 멈춤 (Pause)]
                player.pauseVideo(); // ★ 영상 멈춤
                
                btnIcon.innerText = "🔇";
                btnText.innerText = "BGM 켜기";
                musicBtn.classList.remove('playing');
                musicBtn.style.background = "rgba(255, 255, 255, 0.9)";
                
                isMusicPlaying = false;
            } else {
                // [멈춤 -> 재생 (Play)]
                player.playVideo(); // ★ 영상 시작 (소리도 같이 나옴)
                
                btnIcon.innerText = "🎵";
                btnText.innerText = "BGM 끄기";
                musicBtn.classList.add('playing');
                musicBtn.style.background = "rgba(255, 233, 236, 0.95)";
                
                isMusicPlaying = true;
            }
        });
    }
});