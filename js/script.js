// слайдер

new Swiper('.hero__slider', {
    slidesPerView: 2,
    spaceBetween: 10,
    loop: true,
    navigation: {
        prevEl: '.hero__slider-btn-prev',
        nextEl: '.hero__slider-btn-next'
    },
    autoplay: {
        delay: 3000,
    },
    speed: 600,
    breakpoints: {
        320: {
            slidesPerView: 1,
        },
        560: {
            spaceBetween: 8,
        }
    }

});


// калькулятор

const calcForm = document.querySelector('.js-calc-form');
const totalSquare = document.querySelector('.js-square');
const totalPrice = document.querySelector('.js-total-price');
const calcResultWrapper = document.querySelector('.calc__result-wrapper');
const btnSubmit = document.querySelector('.js-submit');
const calcOrder = document.querySelector('.calc__order');

const tariff = {
    economy: 250,
    comfort: 500,
    premium: 750
}

calcForm.addEventListener('input', () => {
    btnSubmit.disabled = !(calcForm.width.value > 0 && calcForm.length.value > 0);
        
    // if (calcForm.width.value > 0 && calcForm.length.value > 0) {
    //     btnSubmit.disabled = false;
    // } else {
    //     btnSubmit.disabled = true;
    // }
});

calcForm.addEventListener('submit', (event) => { 
    event.preventDefault();

    if (calcForm.width.value > 0 && calcForm.length.value > 0) {
        const square = calcForm.width.value * calcForm.length.value;
        const price = square * tariff[calcForm.tariff.value];

        // calcResultWrapper.style.display = 'block';
        // calcResultWrapper.style.opacity = '1';
        calcResultWrapper.classList.add('calc__result-wrapper_show');
        calcOrder.classList.add('calc__order_show');

        totalSquare.textContent = `${square} кв м`;
        totalPrice.textContent = `${price} грн`;
    }
});


// Модальное окно
// запрет скрола
const scrollController = {
    scrollPosition: 0,
    disabledScroll() {
        scrollController.scrollPosition = window.scrollY;
        document.body.style.cssText = `
            overflow: hidden;
            position: fixed;
            top: -${scrollController.scrollPosition}px;
            left: 0;
            height: 100vh;
            width: 100vw;
            padding-right: ${window.innerWidth - document.body.offsetWidth}px
        `;
        document.documentElement.style.scrollBehavior = 'unset';
    },
    enabledScroll() {
        document.body.style.cssText = '';
        window.scroll({top: scrollController.scrollPosition})
        document.documentElement.style.scrollBehavior = '';
    },
}

// модальное окно
const modalController = ({modal, btnOpen, btnClose, time = 300}) => {
    const buttonElems = document.querySelectorAll(btnOpen);
    const modalElem = document.querySelector(modal);

    modalElem.style.cssText = `
        display: flex;
        visibility: hidden;
        opacity: 0;
        transition: opacity ${time}ms ease-in-out;
    `;

    const closeModal = event => {
        const target = event.target;

        if (
            target === modalElem ||
            (btnClose && target.closest(btnClose)) ||
            event.code === 'Escape'
            ) {
            
            modalElem.style.opacity = 0;
    
            setTimeout(() => {
                modalElem.style.visibility = 'hidden';
                scrollController.enabledScroll();
            }, time);
    
            window.removeEventListener('keydown', closeModal);
        }
    }

    const openModal = () => {
        modalElem.style.visibility = 'visible';
        modalElem.style.opacity = 1;
        window.addEventListener('keydown', closeModal);
        scrollController.disabledScroll();

        // document.querySelectorAll(".calc__input-number").forEach(function (item) {
        //     item.value = "";
        // });
    };

    buttonElems.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    modalElem.addEventListener('click', closeModal);
};

modalController({
    modal: '.modal',
    btnOpen: '.js-order',
    btnClose: '.modal__close',
});


// Маска
const phone = document.querySelector('#phone');
const imPhone = new Inputmask('+38(999)999-99-99');

imPhone.mask(phone);


// Валидация
const validator = new JustValidate('.modal__form', {
    errorLabelCssClass: 'modal__input-error',
    errorLabelStyle: {
        color: '#FF5D32',
    },
});

validator.addField('#name', [
    {
        rule: 'required',
        errorMessage: 'Укажите ваше имя',
    },
    {
        rule: 'minLength',
        value: 3,
        errorMessage: 'Не менее 3х символов',
    },
    {
        rule: 'maxLength',
        value: 30,
        errorMessage: 'Не более 30ти символов',
    }
]);
    
validator.addField('#phone', [
    {
        rule: 'required',
        errorMessage: 'Укажите ваш телефон',
    },
    {
        validator: value => {
            const number = phone.inputmask.unmaskedvalue();
            return number.length === 10;
        },
        errorMessage: 'Телефон не корректный',
    }
]);


validator.onSuccess((event) => {
    const form = event.currentTarget;

    const popupThx = document.querySelector('.popup__thx');
    // const modalElem = document.querySelector('.modal');
    const popupThxText = document.querySelector('.popup__thx-text');
    
    fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
        body: JSON.stringify({
        title: form.title.value,
        name: form.name.value,
        phone: form.phone.value
    }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
    })
    .then((response) => response.json())
    .then((data) => {
        form.reset();
        // alert(`Спасибо, мы перезвоним вам в течении 10 минут. Ваша заявка № ${data.id}`);
        popupThx.classList.add('active');
        popupThxText.textContent = `Ваша заявка № ${data.id}`;
        // modalElem.style.display = 'none';
        modalController({
            modal: '.modal',
            btnOpen: '.js-order',
            btnClose: '.modal__close',
        });

        calcResultWrapper.classList.remove('calc__result-wrapper_show');
        calcOrder.classList.remove('calc__order_show');

        totalSquare.textContent = ``;
        totalPrice.textContent = ``;
    });

    setTimeout(function () {
        popupThx.classList.remove('active');
        scrollController.enabledScroll();
    }, 3000);
});