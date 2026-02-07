document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 실시간 D-Day 카운트다운 (초 단위 포함)
    const dDayElement = document.getElementById('d-day-count');
    
    // 목표 날짜 (본인 예식일로 변경)
    const weddingDate = new Date('2026-09-05T12:00:00'); 

    function updateCountdown() {
        const now = new Date();
        const diff = weddingDate - now;

        // 시간이 지났다면?
        if (diff <= 0) {
            dDayElement.innerText = "❤️ 저희 결혼했습니다 ❤️";
            clearInterval(timerInterval);
            return;
        }

        // 시간 계산
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // ▼ 숫자 앞에 0 붙이기 (예: 5분 -> 05분)
        const formatTime = (time) => String(time).padStart(2, '0');

        // 화면에 표시 (멘트까지 여기서 한 번에 처리)
        dDayElement.innerText = 
            `결혼식까지 ${days}일 ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} 남음`;
    }

    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
});

// 3. 우클릭 및 꾹 누르기(컨텍스트 메뉴) 방지
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// 4. 이미지 드래그 방지
document.addEventListener('dragstart', function(event) {
    event.preventDefault();
});

/* --- 이미지 팝업 기능 --- */
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.close-btn');
    
    // 1. 모든 갤러리 이미지에 클릭 이벤트 추가
    const galleryImages = document.querySelectorAll('.gallery-item');
    
    galleryImages.forEach(function(img) {
        img.addEventListener('click', function() {
            modal.style.display = 'flex'; // 팝업 보이기
            modalImg.src = this.src;      // 클릭한 이미지 주소를 가져옴
        });
    });

    // 2. X 버튼 누르면 닫기
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 3. 사진 바깥(검은 배경)을 눌러도 닫기 (편의성)
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});