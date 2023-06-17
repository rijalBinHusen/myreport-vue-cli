export function setCookie(cookieName, cookieValue) {

    sessionStorage.setItem(cookieName, cookieValue);
    
  }

export function getCookie(cookieName) {

    return sessionStorage.getItem(cookieName);

}

export function setJWTToken(token) {
  setCookie('auth-token', token);
}

export function getJWTToken() {
  let res = getCookie('auth-token');

  return res;
}