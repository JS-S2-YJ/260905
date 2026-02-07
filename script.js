document.addEventListener('DOMContentLoaded', function() {
    
    // 1. D-Day 계산 로직
    const weddingDate = new Date('2024-12-25'); // 결혼식 날짜 수정
    const today = new Date();
    const diff = weddingDate - today;
    const diffDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const dDayElement = document.getElementById('d-day-count');

    if (diffDay > 0) {
        dDayElement.innerText = diffDay;
    } else if (diffDay === 0) {
        dDayElement.innerText = "Day";
    } else {
        dDayElement.innerText = "+" + Math.abs(diffDay);
    }

    // 2. 스크롤 애니메이션 (등장 효과)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 애니메이션 적용 대상 설정
    const sections = document.querySelectorAll('.main-header, .calendar-section, footer');
    sections.forEach(section => {
        section.classList.add('fade-in-section'); // 숨김 클래스 추가
        observer.observe(section); // 관찰 시작
    });
});

// 3. 우클릭 및 꾹 누르기(컨텍스트 메뉴) 방지
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// 4. 이미지 드래그 방지
document.addEventListener('dragstart', function(event) {
    event.preventDefault();
});