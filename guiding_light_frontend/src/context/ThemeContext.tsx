import React from 'react';

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext =
  React.createContext<ThemeContextValue | null>(
    null
  );

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [
    isDarkMode,
    setIsDarkMode
  ] = React.useState(() => {

    return (
      localStorage.getItem(
        'guidingLightTheme'
      ) === 'dark'
    );

  });

  React.useEffect(() => {

    localStorage.setItem(
      'guidingLightTheme',
      isDarkMode
        ? 'dark'
        : 'light'
    );

    document.documentElement.style.colorScheme =
      isDarkMode
        ? 'dark'
        : 'light';

    document.body.style.backgroundColor =
      isDarkMode
        ? '#242c28'
        : '#f7f5f2';

    return () => {

      document.documentElement.style.colorScheme =
        'light';

      document.body.style.backgroundColor =
        '#f7f5f2';

    };

  }, [isDarkMode]);

  const toggleTheme = () => {

    setIsDarkMode(
      current => !current
    );

  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {

  const context =
    React.useContext(
      ThemeContext
    );

  if (!context) {

    throw new Error(
      'useTheme must be used inside ThemeProvider.'
    );

  }

  return context;
}