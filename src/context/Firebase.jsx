import { createContext, useContext, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set,push, update,get,child,remove} from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useImageCache } from "./ImageCacheContext";
import { getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    // signInWithRedirect,
    signInWithPopup,
    signOut
} from "firebase/auth";

// import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID,
    databaseURL : process.env.REACT_APP_DATABASEURL,
    gstorageURL : process.env.REACT_APP_GSTORAGEURL
};

const firebaseapp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseapp);
const database = getDatabase(firebaseapp);
const storage = getStorage(firebaseapp);
const googleProvider = new GoogleAuthProvider();

const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);


export const FirebaseProvider = (props) => {
    const { images, loadImage } = useImageCache();
    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }; 
    const putData = (key,data) => {
        return update(ref(database, key),data);
    };


    const fetchData = async (key) => {
        const snapshot = await get(child(ref(database), key));
        // setpodData(snapshot.val());
        console.log("data is fetched",snapshot.val());
        return (snapshot.val());
      };
      
      

    const signinUser = (email2, password2) => {
        return signInWithEmailAndPassword(auth, email2, password2)
    };
    const signinwithGoogle = () =>{
        // return signInWithRedirect(auth, googleProvider);
        return signInWithPopup(auth, googleProvider);
    }
    const getUserRole = async (userId) => {
        const snapshot = await get(child(ref(database), `users/${userId}/role`));
        return snapshot.val();
      };
      const deleteData = async (key) => {
        return remove(ref(database, key));
    };
    const uploadImage = async (file, storagePath) => {
        const storageReference = storageRef(storage, storagePath);
        await uploadBytes(storageReference, file);
        return getDownloadURL(storageReference);
    };

    const deleteImage = async (storagePath) => {
        const storageReference = storageRef(storage, storagePath);
        await deleteObject(storageReference);
    };
    // const NodeCache = require('node-cache');
    // const productCache = new NodeCache({ stdTTL: 2 * 24 * 60 * 60 });
    
    // const fetchProducts = async (forceRefresh = false) => {
    //   const cacheKey = 'products';
    
    //   // Check if the products are in the cache and if forceRefresh is not requested
    //   if (!forceRefresh) {
    //     const cachedProducts = productCache.get(cacheKey);
    //     if (cachedProducts) {
    //       console.log("Returning cached product data", cachedProducts);
    //       return cachedProducts;
    //     }
    //   }
    
    //   // Fetch products from the database
    //   const snapshot = await get(child(ref(database), '/products'));
    //   const products = snapshot.val();
    
    //   // Update the cache
    //   productCache.set(cacheKey, products);
    
    //   console.log("Product data is fetched", products);
    //   return products;
    // };
    
    const updateProductTimestamp = async () => {
        const timestamp = new Date().toISOString();
        await update(ref(database, 'states'), {
            lastProductUpdate: timestamp
        });
        // localStorage.setItem('lastProductUpdate', timestamp);
        return timestamp;
    };

    const getLastProductUpdate = async () => {
        const snapshot = await get(child(ref(database), 'states/lastProductUpdate'));
        return snapshot.val();
    };

    const fetchProducts = async (forceRefresh = false) => {
        const cacheKey = 'products';
        const maxLife = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

        // Get the latest update timestamp from Firebase
        const firebaseTimestamp = await getLastProductUpdate();
        const localTimestamp = localStorage.getItem('lastProductUpdate');

        // Force refresh if timestamps don't match or if forceRefresh is true
        const shouldRefresh = forceRefresh || 
                            !localTimestamp || 
                            firebaseTimestamp !== localTimestamp;

        if (!shouldRefresh) {
            const cachedProducts = localStorage.getItem(cacheKey);
            if (cachedProducts) {
                console.log("Returning cached product data", JSON.parse(cachedProducts));
                return JSON.parse(cachedProducts);
            }
        }

        // Fetch products from the database
        const snapshot = await get(child(ref(database), '/products'));
        const products = snapshot.val();

        // Transform products to include the id key
        const transformedProducts = Object.keys(products).map(key => ({
            ...products[key],
            id: key
        }));

        // Update localStorage with transformed products and latest timestamp
        localStorage.setItem(cacheKey, JSON.stringify(transformedProducts));
        localStorage.setItem('lastProductUpdate', firebaseTimestamp);

        transformedProducts.forEach(product => {
            product.images.forEach(image =>{  
                if (!images[image]){
                    loadImage(image)
                }
            }
            );
        });

        console.log("Product data is fetched", transformedProducts);
        return transformedProducts;
    };


    // const fetchProducts = async (forceRefresh = false) => {
    //     const cacheKey = 'products';
    //     const cacheExpiryKey = `${cacheKey}_expiry`;
    //     const maxLife = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    
    //     // Check if the products are in localStorage and if forceRefresh is not requested
    //     if (!forceRefresh) {
    //         const cachedProducts = localStorage.getItem(cacheKey);
    //         const cachedExpiry = localStorage.getItem(cacheExpiryKey);
    //         const now = new Date().getTime();
    
    //         if (cachedProducts && cachedExpiry && now < parseInt(cachedExpiry, 10)) {
    //             console.log("Returning cached product data", JSON.parse(cachedProducts));
    //             return JSON.parse(cachedProducts);
    //         }
    //     }
    
    //     // Fetch products from the database
    //     const snapshot = await get(child(ref(database), '/products'));
    //     const products = snapshot.val();
    
    //     // Transform products to include the id key
    //     const transformedProducts = Object.keys(products).map(key => ({
    //         ...products[key],
    //         id: key
    //     }));
    
    //     // Update localStorage with transformed products and expiry time
    //     const expiryTime = new Date().getTime() + maxLife;
    //     localStorage.setItem(cacheKey, JSON.stringify(transformedProducts));
    //     localStorage.setItem(cacheExpiryKey, expiryTime.toString());
    
    //     console.log("Product data is fetched", transformedProducts);
    //     return transformedProducts;
    // };

    const updateProducts = async () => {
        // await update(ref(database, 'products'), productData);
        await updateProductTimestamp(); // Update the timestamp after successful product update
        // return fetchProducts(true); // Force refresh the products
    };

    const logOut = (auth) => {
        return signOut(auth);
    }

    return (
        <FirebaseContext.Provider value ={{createUser, putData, signinUser,signinwithGoogle,fetchData,getUserRole,deleteData,uploadImage,deleteImage,fetchProducts,updateProducts,logOut}}>
            {props.children}
        </FirebaseContext.Provider>
    )
}