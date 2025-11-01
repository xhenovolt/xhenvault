import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full text-center py-4 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-950 dark:to-purple-950 dark:via-blue-950 text-gray-900 dark:text-gray-300 border-t border-gray-800 dark:border-gray-300">
      © {year} XhenVolt | XhenVault™
    </footer>
  );
};

export default Footer;