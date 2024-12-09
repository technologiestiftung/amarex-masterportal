/**
 * Fetches data from Rabimo API asynchronously
 * @param {Object} payload - data to send
 * @returns {Promise} - a promise that resolves to the response data
 */
async function getMultiblockDeltaW(payload) {
  try {
    const response = await fetch(
      `${process.env.API_URL}/calculate_multiblock_delta_w`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Rabimo API:", error);
    throw error;
  }
}

export default { getMultiblockDeltaW };

