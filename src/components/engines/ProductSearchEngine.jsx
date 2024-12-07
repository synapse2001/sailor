import { useFirebase } from '../../context/Firebase';
import { useState } from 'react';
import Fuse from 'fuse.js';

const useProductSearchEngine = () => {
  const firebase = useFirebase();
  const [productList, setProductList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = async (query, field) => {
    setLoading(true);
    setError(null);
    try {
      const productsData = await firebase.fetchProducts();
      const productsArray = Object.values(productsData);

      if (field === 'name' || field === 'brand') {
        if(field === 'brand'){
          field = 'ogBrandName';
        }
        const fuse = new Fuse(productsArray, {
          keys: [field, 'aliasName'],
          threshold: 0.3, // Adjust the threshold as needed
        });
        const result = fuse.search(query);
        setProductList(result.map(({ item }) => item));
      } else {
        const queryLower = query.toLowerCase();

        // Separate products into those that start with the query and those that contain it
        const startingMatches = [];
        const containingMatches = [];

        productsArray.forEach(product => {
          const fieldValue = product[field].toLowerCase();
          if (field === 'partNo' && fieldValue.startsWith(queryLower)) {
            startingMatches.unshift(product); // Push starting matches to the front
          } else if (fieldValue.includes(queryLower)) {
            containingMatches.push(product); // Push containing matches to the end
          }
        });

        // Combine starting matches and containing matches
        const filteredProducts = [...startingMatches, ...containingMatches];
        setProductList(filteredProducts);
      }
    } catch (err) {
      setError('Error fetching products');
    }
    setLoading(false);
  };

  return { productList, searchProducts, loading, error };
};

export default useProductSearchEngine;