import React from "react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

interface LayoutProps {
  children: ReactJSXElement;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <div>{children}</div>
    </>
  );
};

export default Layout;
