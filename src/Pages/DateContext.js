import React, { createContext, useContext, useMemo } from 'react';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const getFormattedDateTime = useMemo(() => {
    return (date) => {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      };

      return new Intl.DateTimeFormat('id-ID', options).format(date);
    };
  }, []);

  return (
    <DateContext.Provider value={getFormattedDateTime}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  return useContext(DateContext);
};
