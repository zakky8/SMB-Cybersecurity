import axios from "axios";

const GOOGLE_API_BASE = "https://www.googleapis.com";

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  status: string;
}

export async function getGoogleAccessToken(): Promise<string> {
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return response.data.access_token;
}

export async function listGoogleUsers(
  accessToken: string
): Promise<GoogleUser[]> {
  const response = await axios.get(
    `${GOOGLE_API_BASE}/admin/directory/v1/users`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        customer: "my_customer",
        maxResults: 500,
      },
    }
  );

  return (
    response.data.users?.map((user: any) => ({
      id: user.id,
      email: user.primaryEmail,
      name: user.name.fullName,
      status: user.suspended ? "inactive" : "active",
    })) || []
  );
}

export async function enableGoogleMFA(accessToken: string, userId: string): Promise<void> {
  await axios.post(
    `${GOOGLE_API_BASE}/admin/directory/v1/users/${userId}`,
    {
      changePasswordAtNextLogin: false,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function getGoogleSecurityReport(accessToken: string) {
  const response = await axios.get(
    `${GOOGLE_API_BASE}/admin/reports/v1/activity`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        userKey: "all",
        applicationName: "login",
      },
    }
  );

  return response.data;
}
