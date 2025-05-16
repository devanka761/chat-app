export function setbadge(n=null) {
  const badge = document.createElement('i');
  badge.classList.add('B');

  if(n === 1) {
    badge.classList.add('dev');
    badge.title = 'DEVELOPER';
  }
  if(n === 2) {
    badge.classList.add('staff');
    badge.title = 'STAFF';
  }
  if(n === 3) {
    badge.classList.add('mod');
    badge.title = 'MODERATOR';
  }
  if(n === 4) {
    badge.classList.add('donator');
    badge.title = 'DONATOR';
  }
  if(n === 5) {
    badge.classList.add('verified');
    badge.title = 'VERIFIED';
  }

  return badge;
}