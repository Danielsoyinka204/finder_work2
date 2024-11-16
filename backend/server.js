import OpenAI from "openai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
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

    Please assign a credibility score between 1 and 100 to evaluate the trustworthiness of the provided business information. Use the scoring system below to categorize the business:

0–20: Likely a scam.
20–40: Be cautious; potential red flags exist.
40–60: Neutral; insufficient evidence to strongly support or discredit.
60–80: Likely trustworthy with some room for improvement.
80–100: Fully legitimate and credible.
Perform a deep analysis to derive this score by thoroughly researching and considering the following factors:

Website Analysis:

Check for SSL certification, professional design, and accurate contact information.
Use WHOIS or similar tools to evaluate domain age and registration details.
Social Media Presence:

Verify active and consistent social media profiles.
Assess engagement quality and follower authenticity.
Online Reviews and Reputation:

Search trusted platforms (e.g., Google, Yelp, Trustpilot) for reviews.
Highlight any recurring positive or negative themes from customer feedback.
General Online Presence:

Check for mentions of the business in news articles, forums, and blogs.
Investigate for any association with scams, fraud, or negative press.
Additional Verification:

Compare business details across directories (e.g., Google My Business, LinkedIn).
Check for legal registration information, if applicable.
Output:

Assign a credibility score between 1 and 100 based on the scoring system.
Provide a detailed explanation (max 50 words) describing the reasoning for the score, citing specific findings.
Include relevant business reviews or comments (max 30 words) to support the score.
Ensure the analysis is thorough, using publicly available data to produce a well-supported and valid assessment.

Output should be simple , well detailed , detailed anaylysis and formated to avoid # or * , it should be clean
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
      }else if(credibilityScore < 40){
        legitimacy = "Be cautious, potential red flags exist"
      }else if(credibilityScore < 60){
        legitimacy = "Neutral, insufficient evidence to strongly support or discredit"
      }else if(credibilityScore < 80){
        legitimacy = "Likely trustworthy with some room for improvement."
      }

      const updatedAnalysis = `${analysis}\n\nScore: ${credibilityScore}\nCredibility Score: ${credibilityScore}\nCredibility Status: ${legitimacy}`;

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
