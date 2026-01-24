// src/context/UserContext.js
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [healthConditions, setHealthConditions] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setHealthConditions([]);
    setShelf([]);
    setGeneratedRecipes([]);
  };

  const addHealthCondition = (condition) => {
    setHealthConditions([...healthConditions, condition]);
  };

  const removeHealthCondition = (conditionId) => {
    setHealthConditions(healthConditions.filter(c => c.id !== conditionId));
  };

  const addToShelf = (product) => {
    // Add unique ID if not present
    const productWithId = {
      ...product,
      id: product.id || `product_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setShelf([...shelf, productWithId]);
  };

  const removeFromShelf = (productId) => {
    setShelf(shelf.filter(p => p.id !== productId));
  };

  const clearShelf = () => {
    setShelf([]);
  };

  return (
    <UserContext.Provider value={{
      user,
      healthConditions,
      shelf,
      generatedRecipes,
      login,
      logout,
      addHealthCondition,
      removeHealthCondition,
      addToShelf,
      removeFromShelf,
      clearShelf,
      setHealthConditions,
      setGeneratedRecipes,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);