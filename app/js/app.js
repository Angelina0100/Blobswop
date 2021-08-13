let burger      = document.querySelector('.js-burger');
let menu        = document.querySelector('.js-menu');
let btnsShowMore = document.querySelectorAll('.js-showMore');
let cardText    = document.querySelector('.js-cardText');

burger.addEventListener("click", ()=>{
    burger.classList.toggle('is-crossed');
    menu.classList.toggle('is-active');
})

btnsShowMore.forEach(el => {
    el.addEventListener('click', ()=> {
        el.previousElementSibling.classList.add('is-shown')
        el.classList.add('d-none')
    })
})
