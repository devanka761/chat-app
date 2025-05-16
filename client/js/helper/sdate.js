import userState from "../manager/userState.js";

export default {
  sameday(t1, t2) {
    t1 = new Date(t1);
    t2 = new Date(t2);
    return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate();
  },
  time(ts) {
    return new Date(ts).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
  },
  date(ts) {
    return new Date(ts).toLocaleDateString(navigator.language, { year: '2-digit', month: '2-digit', day: '2-digit' })
  },
  datetime(ts, pq = null) {
    return this.date(ts) + (pq ? ' ' + pq + ' ' : ' ') + this.time(ts);
  },
  timeago(ts, islong=false) {
    const lang = userState.langs[userState.lang];
    const seconds = Math.floor((new Date() - new Date(ts)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} ${lang.SDATE_YEARS}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} ${lang.SDATE_MONTHS}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 604800);
    if (interval >= 1) return `${interval} ${lang.SDATE_WEEKS}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ${lang.SDATE_DAYS}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} ${lang.SDATE_HOURS}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} ${lang.SDATE_MINUTES}${islong?' '+lang.SDATE_AGO:''}`;

    interval = Math.floor(seconds / 1);
    if (interval >= 1) return `${seconds} ${lang.SDATE_SECONDS}${islong?' '+lang.SDATE_AGO:''}`;

    return `${lang.SDATE_JUSTNOW}`;
  },
  durrTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const lang = userState.langs[userState.lang];

    let result = "";
    if(hours > 0) {
      result += `${hours}${lang.SDATE_sHOURS} `;
    }
    if(minutes > 0) {
      result += `${minutes}${lang.SDATE_sMINUTES} `;
    }
    if(seconds > 0 || result === "") {
      result += `${seconds}${lang.SDATE_sSECONDS}`;
    }
    return result.trim();
  }
}