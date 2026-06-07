import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const file = fs.createWriteStream("modelList.txt", { flags: "w" });
process.stdout.write = file.write.bind(file);

// Automatically loads your API key from the GEMINI_API_KEY environment variable
const ai = new GoogleGenAI({});

async function run() {
  try {
    // This fetches all authorized active models for your client
    const response = await ai.models.list({});
    let itemNum = 1;
    for (const model of response.page) {
      console.log(`[${itemNum}]: ${model.displayName}`);
      console.log(`Model ID: ${model.name.split("/")[1]}`);
      console.log(`Desc : ${model.description}`);
      console.log(`Supported Actions: ${model.supportedActions.join(", ")}`);
      console.log("-------------------------------------------------------------");
      itemNum++;
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

await run();

file.close();
