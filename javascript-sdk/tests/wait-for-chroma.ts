import fetch from 'node-fetch';
import { getEnvironmentVariable } from "./helpers.js";

const chroma_url = getEnvironmentVariable("CHROMA_URL");

// Delay function to wait for a specified time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkFor404() {
  const timeout = Date.now() + 5 * 60 * 1000; // 5 minutes
  while (Date.now() < timeout) {
    try {
      const response = await fetch(chroma_url);
      
      // Chroma does not have a healthcheck endpoint, so we call the base URL and when it returns a 404, we know
      // that Chroma is running.
      if (response.status === 404) {
        console.log('Received a 404 response. Chroma is running.');
        return;
      }

      console.log(`Status ${response.status} received. Retrying...`);
    } catch (error) {
      console.error('Error:', error);
    }

    await delay(1000);
  }
  throw new Error("Timeout reached while waiting for Chroma to be ready.");
}

checkFor404();
