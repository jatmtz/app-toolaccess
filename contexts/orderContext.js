// contexts/OrderContext.js
import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState({
    tools: [],
    justification: '',
    timeRequested: '',
  });

  const addToolToOrder = (tool) => {
    setCurrentOrder(prev => {
      const existingToolIndex = prev.tools.findIndex(t => t.id === tool.id);
      
      if (existingToolIndex >= 0) {
        const updatedTools = [...prev.tools];
        updatedTools[existingToolIndex] = {
          ...updatedTools[existingToolIndex],
          quantity: updatedTools[existingToolIndex].quantity + 1
        };
        return { ...prev, tools: updatedTools };
      } else {
        return { 
          ...prev, 
          tools: [
            ...prev.tools, 
            {
              id: tool.id,
              name: tool.nombre,
              description: tool.descripcion,
              image: tool.foto_url,
              quantity: 1,
              replacementValue: tool.valor_reposicion,
              subcategory: tool.subcategoria_id
            }
          ] 
        };
      }
    });
  };

  const removeToolFromOrder = (toolId) => {
    setCurrentOrder(prev => ({
      ...prev,
      tools: prev.tools.filter(tool => tool.id !== toolId)
    }));
  };

  const updateToolQuantity = (toolId, newQuantity) => {
    if (newQuantity < 1) return;

    setCurrentOrder(prev => {
      const updatedTools = prev.tools.map(tool => 
        tool.id === toolId ? { ...tool, quantity: newQuantity } : tool
      );
      return { ...prev, tools: updatedTools };
    });
  };

  const updateOrderDetails = (justification, timeRequested) => {
    setCurrentOrder(prev => ({
      ...prev,
      justification,
      timeRequested
    }));
  };

  const clearOrder = () => {
    setCurrentOrder({
      tools: [],
      justification: '',
      timeRequested: '',
    });
  };

  return (
    <OrderContext.Provider 
      value={{ 
        currentOrder, 
        addToolToOrder, 
        removeToolFromOrder, 
        updateToolQuantity,
        updateOrderDetails,
        clearOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);