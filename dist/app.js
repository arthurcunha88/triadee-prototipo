'use strict';
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const form = document.querySelector('#lead-form');
if (form) {
    const whatsapp = 'https://wa.me/5571992390037?text=';
    form.addEventListener('submit', e => {
        e.preventDefault();
        const fields = new FormData(form);
        const product = fields.get('produto');
        const room = String(fields.get('ambiente') || '').trim();
        const interest = product === 'Quero orientação' ? 'Preciso de orientação para escolher os materiais.' : 'Tenho interesse em ' + product.toLowerCase() + '.';
        const message = 'Olá, equipe Tríadee! Meu nome é ' + String(fields.get('nome')).trim() + '. Vi os projetos no site e gostaria de solicitar um orçamento. ' + interest + (room ? ' O ambiente é: ' + room + '.' : '') + ' Podemos conversar?';
        window.open(whatsapp + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    });
    document.querySelectorAll('[data-product]').forEach(a => a.addEventListener('click', () => {
        form.querySelectorAll('input[name="produto"]').forEach(r => r.checked = r.value === a.dataset.product);
    }));
}
if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    }), { threshold: .15 });
    document.querySelectorAll('.case,.process li,.showroom-copy').forEach(node => observer.observe(node));
}
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#nav-principal');
const mobileNav = matchMedia('(max-width: 1200px)');
function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mainNav.classList.toggle('is-open', open);
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') === 'false'));
mainNav.addEventListener('click', event => { if (event.target.closest('a')) {
    setMenu(false);
    if (mobileNav.matches)
        menuToggle.focus({ preventScroll: true });
} });
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
    }
});
mobileNav.addEventListener('change', () => setMenu(false));
document.querySelector('.masthead').classList.add('menu-ready');
const caseDialog = document.querySelector('#case-dialog');
if (typeof caseDialog?.showModal === 'function') {
    const closeCase = caseDialog.querySelector('.case-close');
    const casePhoto = caseDialog.querySelector('.case-dialog-photo');
    const caseCopy = caseDialog.querySelector('.case-dialog-copy');
    let activeCase = null;
    document.querySelectorAll('[data-case]').forEach(link => {
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                return;
            event.preventDefault();
            const sourcePhoto = link.querySelector('img');
            const template = document.getElementById('case-' + link.dataset.case);
            caseCopy.replaceChildren(template.content.cloneNode(true));
            casePhoto.src = sourcePhoto.currentSrc || sourcePhoto.src;
            casePhoto.alt = sourcePhoto.alt;
            activeCase = link;
            caseDialog.showModal();
            closeCase.focus();
        });
    });
    closeCase.addEventListener('click', () => caseDialog.close());
    caseDialog.addEventListener('click', event => {
        if (event.target !== caseDialog)
            return;
        const box = caseDialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
            caseDialog.close();
    });
    caseDialog.addEventListener('close', () => activeCase?.focus({ preventScroll: true }));
}
