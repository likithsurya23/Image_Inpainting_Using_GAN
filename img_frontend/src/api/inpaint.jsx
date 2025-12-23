// Simple API
import axios from "axios"
import { config } from "../theme"

const API_URL = config.apiUrl

export async function inpaintImage(originalImageDataUrl, maskDataUrl, iterations) {
  try {
    // 1) Convert data URLs → Blobs
    const imageBlob = await (await fetch(originalImageDataUrl)).blob();
    const maskBlob = await (await fetch(maskDataUrl)).blob();

    const formData = new FormData();
    formData.append("image", imageBlob, "image.png"); // Django expects "image"
    formData.append("mask", maskBlob, "mask.png");    // Django expects "mask"
    formData.append("iterations", iterations);

    // Call API
    const response = await axios.post(
      `${API_URL}/api/inpaint/`,
      formData,
      { responseType: "blob" }
    );

    // 3) Success: image blob back
    const resultBlob = response.data;
    const resultUrl = URL.createObjectURL(resultBlob);

    return {
      result_image: resultUrl,
      job_id: Date.now().toString(),
    };
  } catch (error) {
    console.error("Inpaint API error:", error);

    if (error.message === "Network Error") {
      throw new Error("Cannot reach backend (network/CORS). Is Django running?");
    }

    if (error.response && error.response.data) {
      try {
        const text = await error.response.data.text();
        throw new Error(`Backend error (${error.response.status}): ${text}`);
      } catch {
        throw new Error(`Backend error (${error.response.status})`);
      }
    }

    throw error;
  }
}
