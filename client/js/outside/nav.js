function waittime(ms = 495) {
  return new Promise(resolve => {setTimeout(resolve, ms)});
}

async function openClose(nav, btnNav) {
  nav.classList.add('out');
  await waittime();
  if(nav.classList.contains('opened')) {
    btnNav.innerHTML = '<i class="fa-solid fa-bars"></i> MENU';
    nav.classList.remove('opened');
  } else {
    btnNav.innerHTML = '<i class="fa-solid fa-circle-x"></i>';
    nav.classList.add('opened');
  }
  nav.classList.remove('out');
}

export default function() {
  const nav = document.querySelector('.nav');
  const btnNav = nav.querySelector('.btn-menu');
  btnNav.onclick = () => openClose(nav, btnNav);

  const bars = nav.querySelectorAll('.nav-list a');
  bars.forEach(bar => {
    const link = bar.getAttribute('href');
    const isRedirect = bar.getAttribute('data-r');

    bar.onclick = async(e) => {
      e.preventDefault();
      if(isRedirect) {
        openClose(nav, btnNav);
        if(bar.getAttribute('target')) {
          window.open(link);
          return;
        }
        window.location.href = link;
        return;
      } else {
        document.querySelector(link).scrollIntoView();
        openClose(nav, btnNav);
      }
    }
  });
}