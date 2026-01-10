
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env");
    return;
  }

  console.log("Using API Key starting with:", apiKey.substring(0, 8));

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      const names = data.models.map(m => m.name);
      console.log(JSON.stringify(names, null, 2));
    } else {
      console.log("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
