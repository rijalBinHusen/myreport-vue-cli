import { ref } from "vue";
import { auth } from "../firebase/firebaseApp";

const error = ref(null);

const logout = async () => {
  // reset the error
  error.value = null;
  try {
    await auth.signOut();
  } catch (err) {
    console.log(err);
    error.value = err.message;
  }
};

const userLogout = () => {
  return { logout, error };
};

export default userLogout;
