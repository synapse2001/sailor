import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useFirebase,auth } from "../context/Firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const firebase = useFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);

      } else {
        console.log("You are logged out");
        setUser(null);
      }
    });
    return () => {
      unsubscribe();
    };

  }, []);

  return { user };
}


export function newUser(){
    

}