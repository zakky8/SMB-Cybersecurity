import axios from "axios";

const SAFE_BROWSING_API = "https://safebrowsing.googleapis.com/v4";
const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

export async function checkURLSafety(url: string): Promise<any> {
  try {
    const response = await axios.post(
      `${SAFE_BROWSING_API}/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: "shielddesk",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }
    );

    const matches = response.data.matches || [];
    return {
      url,
      safe: matches.length === 0,
      threats: matches.map((m: any) => m.threatType),
    };
  } catch (error) {
    console.error("Safe Browsing check error:", error);
    return { url, safe: true, error: true };
  }
}

export async function checkDomainReputation(
  domain: string
): Promise<{ safe: boolean; categories: string[] }> {
  try {
    const response = await axios.post(
      `${SAFE_BROWSING_API}/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: "shielddesk",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["DOMAIN"],
          threatEntries: [{ url: domain }],
        },
      }
    );

    const matches = response.data.matches || [];
    return {
      safe: matches.length === 0,
      categories: matches.map((m: any) => m.threatType),
    };
  } catch (error) {
    console.error("Domain reputation check error:", error);
    return { safe: true, categories: [] };
  }
}
