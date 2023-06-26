import { getJWTToken } from "./cookie";
import { append } from "../myfunction"

const hostURL = process.env.NODE_ENV === 'development' ? "http://localhost/rest-php/myreport/" : "http://localhost/api-prod/myreport/";
const timeOutRequest = 5000;

async function errorSyncMessage (endpoint, operation, dataToSend, errorMessage) {
  const now = new Date();
  const utcOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const utcPlus7 = new Date(now.getTime() + utcOffset);

  return append({
    store: "errorsync",
    obj: { time: utcPlus7.toISOString(), endpoint, operation, dataToSend, errorMessage }
  });

}

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
          reject(new Error(`Request failed with message: ${res.message}`));
        }
      })
      .catch(error => {

        errorSyncMessage(endpoint, "POST", dataToSend, error)
        reject(error);

      });

    setTimeout(() => {
      
      errorSyncMessage(endpoint, "POST", dataToSend, `Request timeout after ${timeOutRequest} second`);
      controller.abort();
      reject(new Error(`Request timed out after ${timeOutRequest}ms`));

    }, timeOutRequest);
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

        errorSyncMessage(endpoint, "PUT", dataToSend, error)
        reject(error);

      });

    setTimeout(() => {

      errorSyncMessage(endpoint, "PUT", dataToSend, `Request timeout after ${timeOutRequest} second`);
      controller.abort();
      reject(new Error(`Request timed out after ${timeOutRequest}ms`));

    }, timeOutRequest);
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

        errorSyncMessage(endpoint, "POST", dataToSend, error)
        reject(error);
        
      });

    setTimeout(() => {

      errorSyncMessage(endpoint, "DELETE", dataToSend, `Request timeout after ${timeOutRequest} second`);
      controller.abort();
      reject(new Error(`Request timed out after ${timeOutRequest}ms`));

    }, timeOutRequest);
  });
}