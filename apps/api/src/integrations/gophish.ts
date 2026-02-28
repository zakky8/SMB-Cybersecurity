import axios from "axios";

const GOPHISH_API = process.env.GOPHISH_BASE_URL || "http://localhost:3333";
const apiKey = process.env.GOPHISH_API_KEY;

interface GoPhishCampaign {
  id: number;
  name: string;
  status: string;
  results: any[];
}

export async function createCampaign(campaignData: {
  name: string;
  description?: string;
  template?: string;
}): Promise<GoPhishCampaign> {
  try {
    const response = await axios.post(
      `${GOPHISH_API}/api/campaigns?api_key=${apiKey}`,
      {
        name: campaignData.name,
        groups: [],
        template: campaignData.template || "Default Template",
        landing_page: "Default Landing Page",
        sending_profile: "Local",
        smtp: {},
        url: `${process.env.FRONTEND_URL}/phish`,
        launch_date: new Date().toISOString(),
      }
    );

    return response.data;
  } catch (error) {
    console.error("GoPhish campaign creation error:", error);
    throw error;
  }
}

export async function sendEmails(
  campaignId: number,
  emails: Array<{ email: string; firstName: string }>
): Promise<void> {
  try {
    // Add targets to campaign
    const targets = emails.map((e) => ({
      email: e.email,
      first_name: e.firstName,
      last_name: "",
      position: "",
    }));

    await axios.post(
      `${GOPHISH_API}/api/campaigns/${campaignId}/emails?api_key=${apiKey}`,
      targets
    );

    // Launch campaign
    await axios.post(
      `${GOPHISH_API}/api/campaigns/${campaignId}/launch?api_key=${apiKey}`
    );
  } catch (error) {
    console.error("GoPhish send emails error:", error);
    throw error;
  }
}

export async function getCampaignResults(
  campaignId: number
): Promise<GoPhishCampaign> {
  try {
    const response = await axios.get(
      `${GOPHISH_API}/api/campaigns/${campaignId}?api_key=${apiKey}`
    );

    return response.data;
  } catch (error) {
    console.error("GoPhish results error:", error);
    throw error;
  }
}

export async function completeCampaign(campaignId: number): Promise<void> {
  try {
    await axios.delete(
      `${GOPHISH_API}/api/campaigns/${campaignId}?api_key=${apiKey}`
    );
  } catch (error) {
    console.error("GoPhish campaign completion error:", error);
    throw error;
  }
}
