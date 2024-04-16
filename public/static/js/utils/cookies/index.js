export function deleteCookie(name) { setCookie({ name, secure: true, days: -1 }) }

export function setCookie({ name, value = '', days = 0, secure = false }) {
    var a = 86400 * days;   
    var d = new Date;
    d.setTime(d.getTime() + 24*60*60*1000*days);
    document.cookie = `${secure ? '__Secure-' : ''}${name}=${value};path=/;expires=${d.toGMTString()};max-age=${a}`;
}
