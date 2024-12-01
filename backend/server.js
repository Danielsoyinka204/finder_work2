import OpenAI from "openai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import axios from "axios"; // Axios to make API requests
import job from "./cron/cron.js";

dotenv.config();

const app = express();
job.start();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.resolve();
app.use(express.json());
app.use(cors());

// Helper function to check URL validity
const isValidUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(url);
};

// Helper function to fetch business details from Google Places API
async function fetchBusinessDetailsFromGoogle(domain, address) {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json`, {
      params: {
        input: address,
        inputtype: 'textquery',
        key: process.env.GOOGLE_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching from Google Places API:', error.message);
    return null;
  }
}

// Helper function to fetch domain info from WHOIS API
async function fetchWhoisData(domain) {
  try {
    const response = await axios.get(`https://www.whoisxmlapi.com/whoisserver/WhoisService`, {
      params: {
        apiKey: process.env.WHOIS_API_KEY,
        domainName: domain,
        outputFormat: 'JSON',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching from WHOIS API:', error.message);
    return null;
  }
}

app.post("/analyze", async (req, res) => {
  console.log("Endpoint hit");
  try {
    const {
      businessName,
      domain,
      email,
      phone,
      address,
      facebookUrl,
      instagramUrl,
      hashtags,
    } = req.body;

    // Fetch data from Google Places and WHOIS
    const googleDetails = await fetchBusinessDetailsFromGoogle(domain, address);
    const whoisData = await fetchWhoisData(domain);

    const prompt = `
    Assess the credibility of a business using a deep analysis approach based on the following details:
    Business Name: ${businessName}
    Domain: ${domain}
    Email: ${email}
    Phone: ${phone}
    Address: ${address}
    Facebook URL: ${facebookUrl}
    Instagram URL: ${instagramUrl}
    Hashtags: ${hashtags}
    
    Google Places Data: ${JSON.stringify(googleDetails)}
    WHOIS Data: ${JSON.stringify(whoisData)}

    Please assign a credibility score between 1 and 100 to evaluate the trustworthiness of the provided business information. Use the scoring system below to categorize the business:
    0–20: Likely a scam.
    20–40: Be cautious; potential red flags exist.
    40–60: Neutral; insufficient evidence to strongly support or discredit.
    60–80: Likely trustworthy with some room for improvement.
    80–100: Fully legitimate and credible.
    
    Perform a deep analysis to derive this score by thoroughly researching and considering the following factors:

    - Website Analysis (using WHOIS data)
    - Social Media Presence (Facebook, Instagram)
    - Online Reviews (Google Places)
    - Business Details Validation (using WHOIS & Google Places)

    Output:
    Assign a credibility score between 1 and 100.
    Provide a detailed explanation (max 50 words) describing the reasoning for the score, citing specific findings.
    Include relevant business reviews or comments (max 30 words) to support the score.
    Ensure the analysis is thorough using publicly available data.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (response && response.choices && response.choices.length > 0) {
      const analysis = response.choices[0].message.content;

      const credibilityScore = extractScore(analysis) || 0;

      let legitimacy = "Fully legitimate and credible.";
      if (credibilityScore < 20) {
        legitimacy = "scam";
      } else if (credibilityScore < 40) {
        legitimacy = "Be cautious, potential Scam";
      } else if (credibilityScore < 60) {
        legitimacy = "Neutral, insufficient evidence to strongly support or discredit";
      } else if (credibilityScore < 80) {
        legitimacy = "Likely trustworthy with some room for improvement.";
      }

      const updatedAnalysis = `${analysis}\n\nScore: ${credibilityScore}\nCredibility Status: ${legitimacy}`;

      res.json({
        score: credibilityScore,
        analysis: updatedAnalysis,
        legitimacy,
      });
    } else {
      throw new Error("OpenAI API returned an unexpected response structure.");
    }
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
    res.status(500).json({ error: "An error occurred during the analysis." });
  }
});

function extractScore(analysis) {
  const match = analysis.match(/credibility score[:\s]*?(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

if (process.env.ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
