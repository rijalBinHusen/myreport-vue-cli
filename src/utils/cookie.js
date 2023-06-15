export function setCookie(cookieName, cookieValue) {

    const cookie = {
      name: cookieName,
      value: cookieValue,
      httpOnly: true,
    };
  
    document.cookie = cookie;
  }

export function getCookie(cookieName) {

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
    const parts = cookie.split('=');

        if (parts[0] === cookieName) {
            return parts[1];
        }
    }
}

export function setJWTToken(token) {
  setCookie('auth-token', token);
}

export function getJWTToken() {
  let res = getCookie('auth-token');

  return res;
}