import { getJWTToken } from "./cookie";

export function postData(endpoint, dataToSend) {
    
    let token = getJWTToken();
    
    let headersList = {
        "Accept": "application/json",
        "JWT-Authorization": token,
        "Content-Type": "application/json"
    }
    
   let bodyContent = JSON.stringify(dataToSend);

  const controller = new AbortController();
  const signal = controller.signal;

  return new Promise((resolve, reject) => {
    fetch("http://localhost/rest-php/myreport/" + endpoint, { 
        signal,
        method: "POST",
        body: bodyContent,
        headers: headersList,
    })
    .then(response => {
        if (response.ok) {
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