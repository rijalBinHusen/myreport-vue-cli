import { auth } from "../firebase/firebaseApp";
// import { signInWithEmailAndPassword } from "@firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";

export default async function (details) {
  const { email, password } = details;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    switch (error.code) {
      case "auth/user-not-found":
        alert("User not found");
        break;
      case "auth/wrong-password":
        alert("Wrong password");
        break;
      default:
        alert(`Something went wrong`);
    }
    return;
  }
  console.log("Success login");
}
