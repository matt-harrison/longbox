export const condenseNumbers = numbers => {
  let output = '';
  let range;

  numbers.forEach((number, index) => {
    let previous = numbers[index - 1];
    let next     = numbers[index + 1];

    if (number - 1 !== previous && number + 1 !== next) {
      output += next ? `${number}, ` : number;
    }

    if (number - 1 !== previous && number + 1 === next) {
      range = `${number}-`;
    }

    if (number - 1 === previous && number + 1 !== next) {
      range += number;
      output += next ? `${range}, ` : range;
    }
  });

  return output;
};

export const condenseTitles = issues => {
  let titles = [];

  issues.forEach(issue => {
    if (!titles[issue.title]) {
      titles[issue.title] = [];
    }

    if (issue.number) {
      titles[issue.title].push(parseInt(issue.number, 10));
    }
  });

  const output = Object.entries(titles).map(title => {
    const name    = title[0];
    const numbers = title[1];

    return {
      name,
      numbers: numbers ? condenseNumbers(numbers) : null
    };
  });

  return output;
};

export const expandNumbers = numbers => {
  let output = [];
  const entries = numbers.replace(/ /g, '').split(',');

  entries.forEach(entry => {
    if (entry.indexOf('-') > -1) {
      const range = entry.split('-');

      for (let index = range[0]; index <= range[1]; index++) {
        const number = parseInt(index, 10);
        output.push(number);
      }
    } else {
      const number = parseInt(entry, 10);
      output.push(number);
    }
  });

  return output;
};

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
