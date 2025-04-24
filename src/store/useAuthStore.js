import { create } from "zustand";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../lib/common";

export const useAuthStore = create((set) => ({
  user: getLocalStorage("user") || null, // object
  token: getLocalStorage("access_token") || null, // chuỗi

  setUser: (user) => {
    if (user) {
      setLocalStorage("user", user); // lưu object
    } else {
      removeLocalStorage("user");
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      setLocalStorage("access_token", token); // lưu chuỗi
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
