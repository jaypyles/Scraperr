import { useUser } from "@/store/hooks";
import axios from "axios";
import Cookies from "js-cookie";

export const useAuth = () => {
  const { setUserState, clearUserState } = useUser();

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await axios.post(`/api/token`, params);
    const isSecure = window.location.protocol === "https:";

    Cookies.set("token", response.data.access_token, {
      expires: 7,
      path: "/",
      secure: isSecure,
      sameSite: "Lax",
    });

    const userResponse = await axios.get(`/api/me`, {
      headers: { Authorization: `Bearer ${response.data.access_token}` },
    });

    setUserState(userResponse.data);
  };

  const logout = () => {
    Cookies.remove("token");
    clearUserState();
  };

  return { login, logout };
};
