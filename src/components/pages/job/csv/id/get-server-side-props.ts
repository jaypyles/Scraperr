import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, params } = context;
  const id = params?.id;

  const cookies = parseCookies({ req });
  const token = cookies.token;
  let csv = null;

  try {
    const csvResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/job/${id}/convert-to-csv`,
      {
        
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    csv = await csvResponse.json();
  } catch (error) {
    console.error("Error fetching job:", error);
  }

  return {
    props: {
      csv,
    },
  };
};
