
const hostURL = process.env.NODE_ENV === 'development' ? "http://localhost/rest-php/" : "http://localhost/api-prod/";

export function loginToServer(email, password) {
    
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    }
    
   let bodyContent = JSON.stringify({ email, password });

  const controller = new AbortController();
  const signal = controller.signal;

  return new Promise((resolve, reject) => {
    fetch(`${hostURL}user/login`, { 
        signal,
        method: "POST",
        body: bodyContent,
        headers: headersList
    })
    .then(response => {
        if (response.status === 200) {
          
          resolve(response);

        } else {
          reject(new Error(`Request failed with status code ${response.status}`));
        }
      })
      .catch(error => {
        reject(error);
      });

    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${2000}ms`));
    }, 2000);
  });
}