import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8">
      {children}
      </main>
    </div>
  );
};

export default Layout;
