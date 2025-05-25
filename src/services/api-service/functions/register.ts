import axios from "axios";

export const register = async (
  email: string,
  password: string,
  full_name: string
) => {
  const response = await axios.post(`/api/signup`, {
    data: {
      email,
      password,
      full_name,
    },
  });

  return response.data;
};
