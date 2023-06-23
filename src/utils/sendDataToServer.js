import { getJWTToken } from "./cookie";
import { append } from "../myfunction"

const hostURL =  "http://localhost/api-prod/myreport/";

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
    fetch(hostURL + endpoint, { 
        signal,
        method: "POST",
        body: bodyContent,
        headers: headersList,
    })
    .then(async response => {
      const res = await response.json();
        if (res.success === true) {
          resolve(response);
        } else {
          append({
            store: "errorsync",
            obj: { endpoint, operation: "POST", dataToSend, errorMessage: res?.message }
          });
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


export function putData(endpoint, dataToSend) {
    
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
    fetch(hostURL + endpoint, { 
        signal,
        method: "PUT",
        body: bodyContent,
        headers: headersList,
    })
    .then(async response => {
      const res = await response.json();
        if (res.success === true) {
          resolve(response);
        } else {
          append({
            store: "errorsync",
            obj: { endpoint, operation: 'PUT', dataToSend, errorMessage: res?.message }
          });
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


export function deleteData(endpoint) {
    
  let token = getJWTToken();
  
  let headersList = {
      "Accept": "application/json",
      "JWT-Authorization": token,
      "Content-Type": "application/json"
  }

  const controller = new AbortController();
  const signal = controller.signal;

  return new Promise((resolve, reject) => {
    fetch(hostURL + endpoint, { 
        signal,
        method: "DELETE",
        headers: headersList,
    })
    .then(async response => {
      const res = await response.json();
        if (res.success === true) {
          resolve(response);
        } else {
          append({
            store: "errorsync",
            obj: { endpoint, operation: 'DELETE', errorMessage: res?.message }
          });
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