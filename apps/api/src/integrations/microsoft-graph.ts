import axios from "axios";

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";

interface MicrosoftUser {
  id: string;
  email: string;
  name: string;
  status: string;
}

export async function getMicrosoftAccessToken(): Promise<string> {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }
  );

  return response.data.access_token;
}

export async function listMicrosoftUsers(
  accessToken: string
): Promise<MicrosoftUser[]> {
  const response = await axios.get(`${GRAPH_API_BASE}/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      $select: "id,userPrincipalName,displayName,accountEnabled",
    },
  });

  return (
    response.data.value?.map((user: any) => ({
      id: user.id,
      email: user.userPrincipalName,
      name: user.displayName,
      status: user.accountEnabled ? "active" : "inactive",
    })) || []
  );
}

export async function checkMicrosoftMFA(accessToken: string): Promise<any> {
  const response = await axios.get(
    `${GRAPH_API_BASE}/users/delta?$select=id,userPrincipalName`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export async function getRiskyUsers(accessToken: string): Promise<any> {
  const response = await axios.get(`${GRAPH_API_BASE}/identityProtection/riskyUsers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function getSecurityScore(accessToken: string): Promise<any> {
  const response = await axios.get(
    `${GRAPH_API_BASE}/security/secureScores?$top=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.value?.[0] || {};
}
