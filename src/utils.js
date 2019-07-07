export const getCookie = () => {
  const cookies = document.cookie.split('; ');
  let user = {
    isAdmin: false,
    isSignedIn: false,
    md5: null,
    name: null
  };

  cookies.forEach(cookie => {
    const parts = cookie.split('=');
    const key   = parts[0];
    const value = parts[1];

    if (key === 'user' && value !== '') {
      user = JSON.parse(decodeURIComponent(value));

      setCookie('user', JSON.stringify(user));
    }
  });

  return user;
}

export const getNullableBoolean = input => {
  let output = null;

  if (input === '1') {
    output = true;
  } else if (input === '0') {
    output = false;
  }

  return output;
};

export const setCookie = (name, value, expirationDate, path = '/') => {
  if (typeof expirationDate === 'undefined') {
    expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
  }

  document.cookie = `${name}=${value}; expires=${expirationDate}; path=${path}`;
}
