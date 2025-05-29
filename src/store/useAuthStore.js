import { create } from "zustand";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../lib/common";

export const useAuthStore = create((set) => ({
  user: getLocalStorage("user"),
  token: getLocalStorage("access_token") || null,

  setUser: (user) => {
    if (user) {
      setLocalStorage("user", user);
    } else {
      removeLocalStorage("user");
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      setLocalStorage("access_token", token);
    } else {
      removeLocalStorage("access_token");
    }
    set({ token });
  },

  logout: () => {
    removeLocalStorage("access_token");
    removeLocalStorage("user");
    set({ user: null, token: null });
  },
}));
