import { getJWTToken } from "./cookie";
import { useIdb } from "./localforage";
import { waitFor } from "./piece/waiting";

const hostURL = process.env.NODE_ENV === 'development' ? "http://localhost/rest-php/myreport/" : "https://rijalbinhusen.cloud/myreport/";
const timeOutRequest = 5000;

interface unknownObject {
  [key: string]: number | boolean | string
}

let rateLimitTime = 0;
const resetRateLimitTime = 600000;

export interface errorDb {
  id: string
  time: string
  endpoint: string
  dataToSend: unknownObject
  errorMessage: string
  operation: string
}

interface Response {
  ok: boolean;
  status: number;
  headers: Headers;
  body: any;
  json: any
}

async function errorSyncMessage(endpoint: string, operation: string, dataToSend: unknownObject, errorMessage: string) {
  const now = new Date();
  const utcOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const utcPlus7 = new Date(now.getTime() + utcOffset);

  const db = useIdb("errorsync");
  await db.createItem({ time: utcPlus7.toISOString(), endpoint, operation, dataToSend, errorMessage }, true)

}

export async function postData(endpoint: string, dataToSend: unknownObject): Promise<boolean> {

  let token = getJWTToken();

  if (token === null) return false;

  let headersList = {
    "Accept": "application/json",
    "JWT-Authorization": token,
    "Content-Type": "application/json"
  }

  let bodyContent = JSON.stringify(dataToSend);

  const controller = new AbortController();
  const signal = controller.signal;

  await useRateLimitTime();

  const timeout = setTimeout(() => {

    controller.abort();
    throw new Error(`Request timed out after ${timeOutRequest}ms`);

  }, timeOutRequest);

  return new Promise((resolve, reject) => {
    fetch(hostURL + endpoint, {
      signal,
      method: "POST",
      body: bodyContent,
      headers: headersList,
    })
      .then(async response => {
        const res = await response.json();
        if (res.success == true) {
          resolve(true);
        } else {
          throw new Error(`Request failed with message: ${JSON.stringify(res.message)}`);
        }
      })
      .catch(error => {

        errorSyncMessage(endpoint, "POST", dataToSend, error)
        reject(error);
        resolve(false)

      })
      .finally(() => {

        clearTimeout(timeout);

      })
  });
}

export async function putData(endpoint: string, dataToSend: unknownObject): Promise<boolean> {

  let token = getJWTToken();

  if (token === null) return false;

  let headersList = {
    "Accept": "application/json",
    "JWT-Authorization": token,
    "Content-Type": "application/json"
  }

  let bodyContent = JSON.stringify(dataToSend);

  const controller = new AbortController();
  const signal = controller.signal;

  await useRateLimitTime();

  const timeout = setTimeout(() => {

    controller.abort();
    throw new Error(`Request timed out after ${timeOutRequest}ms`);

  }, timeOutRequest);

  return new Promise((resolve, reject) => {
    fetch(hostURL + endpoint, {
      signal,
      method: "PUT",
      body: bodyContent,
      headers: headersList,
    })
      .then(async response => {
        const res = await response.json();
        if (res.success == true) {
          resolve(true);
        } else {

          throw new Error(`Request failed with message: ${JSON.stringify(res.message)}`);
        }
      })
      .catch(error => {

        errorSyncMessage(endpoint, "PUT", dataToSend, error)
        reject(error);
        resolve(false)

      })
      .finally(() => {
        clearTimeout(timeout);
      });
  });
}

export async function deleteData(endpoint: string): Promise<boolean> {

  let token = getJWTToken();

  if (token === null) return false;

  let headersList = {
    "Accept": "application/json",
    "JWT-Authorization": token,
    "Content-Type": "application/json"
  }

  const controller = new AbortController();
  const signal = controller.signal;

  await useRateLimitTime();

  const timeout = setTimeout(() => {

    controller.abort();
    throw new Error(`Request timed out after ${timeOutRequest}ms`);

  }, timeOutRequest);

  return new Promise((resolve, reject) => {
    fetch(hostURL + endpoint, {
      signal,
      method: "DELETE",
      headers: headersList,
    })
      .then(async response => {
        const res = await response.json();
        if (res.success == true) {
          resolve(true);
        } else {
          throw new Error(`Request failed with message: ${JSON.stringify(res.message)}`);
        }
      })
      .catch(error => {

        errorSyncMessage(endpoint, "DELETE", { no: 'nothing' }, error)
        reject(error);
        resolve(false)

      })
      .finally(() => {
        clearTimeout(timeout);
      });
  });
}

export async function getData(endpoint: string) : Promise<Response|undefined>{

  let token = getJWTToken();

  if (token === null) return;

  let headersList = {
    "Accept": "application/json",
    "JWT-Authorization": token,
    "Content-Type": "application/json"
  }

  const controller = new AbortController();
  const signal = controller.signal;

  await useRateLimitTime();

  const timeout = setTimeout(() => {

    controller.abort();
    throw new Error(`Request timed out after ${timeOutRequest}ms`);

  }, timeOutRequest);

  return new Promise((resolve) => {
    fetch(hostURL + endpoint, {
      signal,
      method: "GET",
      headers: headersList,
    })
      .then(async (response: Response) => {
        

        resolve(response);
        
      })
      .catch((error) => {
        
        resolve(error)
        errorSyncMessage(endpoint, "GET", {  }, error)

      })
      .finally(() => {

        clearTimeout(timeout);

      })
  });
}

async function useRateLimitTime(): Promise<void> {
    rateLimitTime+= 100;
    await waitFor(rateLimitTime);
    if(rateLimitTime === resetRateLimitTime) { rateLimitTime = 100 };
    return;
}
