/**
 * Fetches data from Rabimo API asynchronously
 * @param {Object} payload - data to send
 * @returns {Promise} - a promise that resolves to the response data
 */

function getApiUrl(instanceId) {
  if (instanceId === "berlin") {
    return process.env.API_URL_BERLIN;
  } else if (instanceId === "cologne") {
    return process.env.API_URL_COLOGNE;
  } else {
    return process.env.API_URL;
  }
}
async function getMultiblockDeltaW(payload, instanceId) {
  let API_URL = getApiUrl(instanceId);
  try {
    const response = await fetch(`${API_URL}/calculate_multiblock_delta_w`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Rabimo API:", error);
    throw error;
  }
}

export default { getMultiblockDeltaW };

