/**
 * Fetches data from Rabimo API asynchronously
 * @param {Object} payload - data to send
 * @returns {Promise} - a promise that resolves to the response data
 */
async function getMultiblock(payload) {

  // todo: remove this console.log
  console.log("[getRabimo] process.env.API_URL::", process.env.API_URL);

  console.log("Build Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
  });

  try {
    const response = await fetch(
      `${process.env.API_URL}/calculate_multiblock`,
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
/**
 * Tests Rabimo API
 * @param {*} endpoint
 */
async function getTest() {
  try {
    const response = await fetch(`${process.env.API_URL}/calculate_all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Rabimo API:", error);
    throw error;
  }
}

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

export default { getMultiblock, getTest, getMultiblockDeltaW };



