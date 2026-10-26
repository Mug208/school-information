// Toast obavestenja u uglu ekrana, najvise tri odjednom.
'use strict';
function prikaziToast(poruka, tip = 'uspeh') {
    const kont = document.getElementById('toastKontejner');
    if (!kont) return;

    while (kont.children.length >= 3) kont.firstElementChild.remove();

    const el = document.createElement('div');
    const klasa = tip === 'greska' ? 'toast-greska' : tip === 'info' ? 'toast-info' : 'toast-uspesno';
    el.className = 'toast ' + klasa;

    el.textContent = poruka;
    kont.appendChild(el);

    setTimeout(() => {
        el.classList.add('izlazi');
        setTimeout(() => el.remove(), 260);
    }, 3200);
}
