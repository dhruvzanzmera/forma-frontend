import { useState } from "react";

export function useNotice() {
  const [notice, setNotice] = useState("");
  const show = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  };
  return [notice, show];
}
