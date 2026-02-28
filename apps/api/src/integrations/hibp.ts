import axios from "axios";

const HIBP_API = "https://haveibeenpwned.com/api/v3";
const apiKey = process.env.HIBP_API_KEY;

interface BreachData {
  Name: string;
  Title: string;
  BreachDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
}

export async function checkBreaches(email: string): Promise<BreachData[] | null> {
  try {
    const response = await axios.get(`${HIBP_API}/breachedaccount/${email}`, {
      headers: {
        "User-Agent": "ShieldDesk",
        "x-api-key": apiKey,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // No breaches found
      return null;
    }
    if (error.response?.status === 429) {
      // Rate limited
      console.warn("HIBP API rate limited");
      return null;
    }
    console.error("HIBP API error:", error.message);
    return null;
  }
}

export async function getBreachSites(): Promise<any[]> {
  try {
    const response = await axios.get(`${HIBP_API}/breaches`, {
      headers: {
        "User-Agent": "ShieldDesk",
        "x-api-key": apiKey,
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error("HIBP breaches list error:", error);
    return [];
  }
}

export async function checkPassword(password: string): Promise<boolean> {
  try {
    // This would use the Pwned Passwords API
    // For now, return a simple check
    const response = await axios.get(`https://api.pwnedpasswords.com/range/hash`, {
      params: {
        hash: password, // In production, hash the password with SHA-1
      },
    });

    return response.data && response.data.length > 0;
  } catch (error) {
    console.error("Password check error:", error);
    return false;
  }
}
