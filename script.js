import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    
// --- [1] D-Day 카운트다운 (멘트는 10초마다 변경) ---
    const dDayElement = document.getElementById('d-day-count');
    const weddingDate = new Date('2026-09-05T13:00:00'); // 예식일

    // 1. 사용할 멘트 목록
    const wittyPhrases = [
        "유부 월드 입장까지",
        "다이어트 마감까지",
        "떨리는 그날까지",
        "우리끼리 파티까지",
        "축의금 수금까지(?)"
    ];

    // 2. 현재 보여줄 멘트 (처음엔 랜덤으로 하나 뽑아둠)
    let currentPhrase = wittyPhrases[Math.floor(Math.random() * wittyPhrases.length)];

    // 3. 멘트만 바꾸는 타이머 (10초마다 실행)
    setInterval(() => {
        currentPhrase = wittyPhrases[Math.floor(Math.random() * wittyPhrases.length)];
        // 멘트가 바뀌었으니 화면도 바로 갱신!
        updateCountdown(); 
    }, 10000); // 10000ms = 10초

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
        dDayElement.innerText = 
            `${currentPhrase} ${days}일 ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
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
            particleCount: 300,
            spread: 120,
            origin: { y: 0.6 },
            colors: weddingColors,
            disableForReducedMotion: true
        });
    }

    // 초기 로딩 후 발사
    setTimeout(shootConfetti, 500);

    // [수정] 메인 사진 클릭 시 발사 (래퍼 기준)
    const mainPhotoWrapper = document.querySelector('.main-photo-wrapper');
    if (mainPhotoWrapper) {
        mainPhotoWrapper.addEventListener('click', function() {
            shootConfetti();
        });
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