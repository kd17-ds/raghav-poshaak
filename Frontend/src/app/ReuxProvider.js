"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { useEffect } from "react";
import { fetchMe } from "../features/auth/authSlice";

export default function ReuxProvider({ children }) {
  useEffect(() => {
    store.dispatch(fetchMe());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
