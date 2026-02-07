document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 실시간 D-Day 카운트다운
    const dDayElement = document.getElementById('d-day-count');
    const weddingDate = new Date('2026-09-05T12:00:00'); 

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

        dDayElement.innerText = 
            `결혼식까지 ${days}일 ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} 남음`;
    }

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

    // 선택 차단 (더블클릭 등으로 선택되는 것 방지)
    document.addEventListener('selectstart', function(event) {
        // 입력창(input, textarea)이 아니면 선택 금지
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
        }
    });

    // 3. 이미지 팝업 (모달) 기능
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.close-btn');
    const galleryImages = document.querySelectorAll('.gallery-item, .map-image');
    
    galleryImages.forEach(function(img) {
        img.addEventListener('click', function() {
            modal.style.display = 'flex';
            modalImg.src = this.src;
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
    const weddingColors = ['#ffccd5', '#ffb7b2', '#ffe9ec', '#ffffff'];

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

    // 메인 사진 클릭 시 발사
    const mainPhoto = document.querySelector('.main-photo');
    if (mainPhoto) {
        mainPhoto.addEventListener('click', function() {
            shootConfetti();
        });
    }
});