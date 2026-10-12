import React from "react";
import { renderToString } from "react-dom/server";
import App from "./app";

export function render(pathname: string): string {
  return renderToString(
    <React.StrictMode>
      <App pathname={pathname} />
    </React.StrictMode>,
  );
}
