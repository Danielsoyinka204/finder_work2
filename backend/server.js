import OpenAI from "openai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import job from "./cron/cron.js";

dotenv.config();

const app = express();

job.start();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.resolve();
app.use(express.json());
app.use(cors());

app.post("/analyze", async (req, res) => {
  try {
    const {
      businessName,
      domain,
      sslStatus,
      email,
      phone,
      address,
      facebookUrl,
      instagramUrl,
      hashtags,
    } = req.body;

    const prompt = `
    Assess the credibility of a business based on these details:
    Business Name: ${businessName}
    Domain: ${domain}
    SSL Status: ${sslStatus}
    Email: ${email}
    Phone: ${phone}
    Address: ${address}
    Facebook URL: ${facebookUrl}
    Instagram URL: ${instagramUrl}
    Hashtags: ${hashtags}

    Please assign a credibility score between 1 and 100 based on the provided information. The score should accurately reflect the overall trustworthiness of the business, considering factors like the professionalism of the website, security (SSL), contact details, and online presence. 
    Provide a clear explanation for the score in a few sentences (max 30 words). Ensure that the score is between 1 and 100 and is the same for both the score and credibility score. 
    Additionally, provide relevant business reviews or comments (max 20 words) to support the score.
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

      // Attempt to extract the score from OpenAI's response
      const credibilityScore = extractScore(analysis) || 0;  // Default to 0 if no valid score is found

      // Determine legitimacy based on credibility score
      let legitimacy = "legitimate";
      if (credibilityScore < 40) {
        legitimacy = "scam";
      }

      // Update the analysis based on the score and legitimacy
      const updatedAnalysis = `${analysis} \n\nScore: ${credibilityScore}\nCredibility Score: ${credibilityScore}\nCredibility Status: ${legitimacy}`;

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

// Helper function to extract credibility score from OpenAI's response
function extractScore(analysis) {
  // Adjust the regex to be more flexible, looking for phrases like "credibility score: 85"
  const match = analysis.match(/credibility score[:\s]*?(\d+)/i);  // Allow for spaces or colons
  return match ? parseInt(match[1], 10) : 0; // Default to 0 if no score found
}

if (process.env.ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));










// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { CohereClientV2 } from "cohere-ai";
// import path from "path";
// import job from "./cron/cron.js";

// dotenv.config();

// const app = express();

// job.start();

// const cohere = new CohereClientV2({
//   token: process.env.COHERE_API_KEY,
// });

// const __dirname = path.resolve();
// app.use(express.json());
// app.use(cors());

// app.post("/analyze", async (req, res) => {
//   try {
//     const {
//       businessName,
//       domain,
//       sslStatus,
//       email,
//       phone,
//       address,
//       facebookUrl,
//       instagramUrl,
//       hashtags,
//     } = req.body;

//     const prompt = `
// Assess the credibility of a business based on these details:
// Business Name: ${businessName}
// Domain: ${domain}
// SSL Status: ${sslStatus}
// Email: ${email}
// Phone: ${phone}
// Address: ${address}
// Facebook URL: ${facebookUrl}
// Instagram URL: ${instagramUrl}
// Hashtags: ${hashtags}

// Please assign a credibility score between 1 and 100 based on the provided information. The score should accurately reflect the overall trustworthiness of the business, considering factors like the professionalism of the website, security (SSL), contact details, and online presence. 
// Provide a clear explanation for the score in a few sentences (max 30 words),score and credibilty score should be same keep in mind this point, with the assigned score. For example:
// - If the score is low (e.g., below 40), explain why, such as missing important security certificates, poor customer reviews, or incomplete business information.
// - If the score is high (e.g., above 80), explain the positive factors such as a secure website, active customer engagement, and a strong online reputation.
// Additionally, provide relevant business reviews or comments (max 20 words) to support the score.
// `;

//     const response = await cohere.chat({
//       model: "command-r-plus",
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     });

//     if (
//       response &&
//       response.message &&
//       response.message.content &&
//       response.message.content.length > 0
//     ) {
//       const analysis = response.message.content[0];
//       const score = Math.floor(Math.random() * 100) + 1;
//       res.json({ score, analysis });
//     } else {
//       throw new Error("Cohere API returned an unexpected response structure.");
//     }
//   } catch (error) {
//     console.error("Error with Cohere API:", error.message);
//     res.status(500).json({ error: "An error occurred during the analysis." });
//   }
// });

// if (process.env.ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
//   );
// }

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
