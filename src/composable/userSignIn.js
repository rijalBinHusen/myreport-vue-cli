/* eslint-disable */
import { ref } from "vue";
import { auth } from "../firebase/firebaseApp";
import { signInWithEmailAndPassword } from "firebase/auth";

const error = ref(null);

const signin = async (email, password) => {
  error.value = null;
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (!res) {
      throw new Error("Could not complete the signin");
    }
    error.value = null;
    console.log(res);
    return res;
  } catch (err) {
    switch (err.code) {
      case "auth/user-not-found":
        error.value = "User not found";
        break;
      case "auth/wrong-password":
        error.value = "Wrong password";
        break;
      default:
        error.value = `Something went wrong`;
    }
    return;
  }
};

const userSignin = () => {
  return { error, signin };
};

export default userSignin;
