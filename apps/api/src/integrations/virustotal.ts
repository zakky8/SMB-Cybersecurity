import axios from "axios";

const VT_API_BASE = "https://www.virustotal.com/api/v3";
const apiKey = process.env.VIRUSTOTAL_API_KEY;

export async function scanURLReputation(url: string): Promise<any> {
  try {
    const response = await axios.get(`${VT_API_BASE}/urls`, {
      headers: {
        "x-apikey": apiKey,
      },
      params: {
        filter: `url:${url}`,
      },
    });

    if (response.data.data && response.data.data.length > 0) {
      const result = response.data.data[0];
      return {
        url,
        malicious: result.attributes.last_analysis_stats.malicious > 0,
        suspicious: result.attributes.last_analysis_stats.suspicious > 0,
        stats: result.attributes.last_analysis_stats,
        lastAnalysis: result.attributes.last_analysis_date,
      };
    }

    return { url, malicious: false, suspicious: false };
  } catch (error) {
    console.error("VirusTotal scan error:", error);
    return { url, malicious: false, suspicious: false, error: true };
  }
}

export async function scanFileReputation(hash: string): Promise<any> {
  try {
    const response = await axios.get(`${VT_API_BASE}/files/${hash}`, {
      headers: {
        "x-apikey": apiKey,
      },
    });

    const result = response.data.data;
    return {
      hash,
      malicious: result.attributes.last_analysis_stats.malicious > 0,
      suspicious: result.attributes.last_analysis_stats.suspicious > 0,
      detectionNames: Object.keys(result.attributes.last_analysis_results)
        .filter(
          (engine) =>
            result.attributes.last_analysis_results[engine].category === "malware"
        )
        .map((engine) => result.attributes.last_analysis_results[engine].result),
      stats: result.attributes.last_analysis_stats,
      lastAnalysis: result.attributes.last_analysis_date,
    };
  } catch (error) {
    console.error("VirusTotal file scan error:", error);
    return { hash, malicious: false, suspicious: false, error: true };
  }
}

export async function submitURLForAnalysis(url: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("url", url);

    const response = await axios.post(`${VT_API_BASE}/urls`, formData, {
      headers: {
        "x-apikey": apiKey,
      },
    });

    return response.data.data.id;
  } catch (error) {
    console.error("VirusTotal submit error:", error);
    throw error;
  }
}

export async function getAnalysisResults(analysisId: string): Promise<any> {
  try {
    const response = await axios.get(`${VT_API_BASE}/analyses/${analysisId}`, {
      headers: {
        "x-apikey": apiKey,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("VirusTotal results error:", error);
    return null;
  }
}
