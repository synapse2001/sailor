// src/context/ImageCacheContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB } from 'idb';

const ImageCacheContext = createContext();

const dbPromise = openDB('firebase-images', 1, {
  upgrade(db) {
    db.createObjectStore('images');
  },
});

const getCachedImage = async (url) => {
  const db = await dbPromise;
  return db.get('images', url);
};

// Fetch all images from IndexedDB
const getAllCachedImages = async () => {
  const db = await dbPromise;
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  const allKeys = await store.getAllKeys();
  const allValues = await store.getAll();

  const imageMap = {};
  allKeys.forEach((key, index) => {
    imageMap[key] = URL.createObjectURL(allValues[index]);
  });
  return imageMap;
};

const cacheImage = async (url, blob) => {
  const db = await dbPromise;
  await db.put('images', blob, url);
};

const fetchAndCacheImage = async (url) => {
  const cachedImage = await getCachedImage(url);
  if (cachedImage) {
    return URL.createObjectURL(cachedImage);
  }
  const response = await fetch(url);
  const blob = await response.blob();
  await cacheImage(url, blob);
  return URL.createObjectURL(blob);
};

export const ImageCacheProvider = ({ children }) => {
  const [images, setImages] = useState({});

  // Load images from IndexedDB on initialization
  useEffect(() => {
    const loadInitialImages = async () => {
      const cachedImages = await getAllCachedImages();
      setImages(cachedImages);
    };
    loadInitialImages();
  }, []);

  const loadImage = async (url) => {
    if (!images[url]) {
      const imageUrl = await fetchAndCacheImage(url);
      setImages((prevImages) => ({ ...prevImages, [url]: imageUrl }));
    }
  };

  return (
    <ImageCacheContext.Provider value={{ images, loadImage }}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  return useContext(ImageCacheContext);
};
