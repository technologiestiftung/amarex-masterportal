let requestData = {
  layout: "report",
  attributes: {
    datasource: [
      {
        features: {
          features: {
            features: [
              {
                geometry: {
                  coordinates: [
                    [
                      [-8235000, 4982000],
                      [-8234000, 4982000],
                      [-8234000, 4983000],
                      [-8235000, 4983000],
                      [-8235000, 4982000],
                    ],
                  ],
                  type: "Polygon",
                },
                type: "Feature",
                properties: { type: "parcel" },
              },
              {
                geometry: {
                  coordinates: [-8234500, 4982500],
                  type: "Point",
                },
                type: "Feature",
                properties: { type: "click" },
              },
            ],
            type: "FeatureCollection",
          },
        },
      },
      {
        features: {
          features: {
            features: [
              {
                geometry: {
                  coordinates: [
                    [
                      [-8235200, 4982200],
                      [-8234200, 4982200],
                      [-8234200, 4983200],
                      [-8235200, 4983200],
                      [-8235200, 4982200],
                    ],
                  ],
                  type: "Polygon",
                },
                type: "Feature",
                properties: { type: "parcel" },
              },
              {
                geometry: {
                  coordinates: [-8234700, 4982700],
                  type: "Point",
                },
                type: "Feature",
                properties: { type: "click" },
              },
            ],
            type: "FeatureCollection",
          },
        },
      },
    ],
    title: "Hello",
  },
};

const CONFIG = {
  API_BASE: "http://localhost:8080",
  APP_ID: "test",
  FORMAT: "pdf",
};

async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function createPrintJob(payload) {
  const url = `${CONFIG.API_BASE}/print/${CONFIG.APP_ID}/report.${CONFIG.FORMAT}`;
  const response = await fetchWithErrorHandling(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

async function monitorJobStatus(statusURL) {
  while (true) {
    const response = await fetchWithErrorHandling(
      `${CONFIG.API_BASE}${statusURL}`,
    );
    const statusData = await response.json();

    console.log(
      `Status: ${statusData.status}, Zeit: ${statusData.elapsedTime}ms`,
    );

    if (statusData.done) {
      if (statusData.status !== "finished") {
        throw new Error(`Druckjob fehlgeschlagen: ${statusData.status}`);
      }
      return statusData;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function downloadReport(downloadURL) {
  const response = await fetchWithErrorHandling(
    `${CONFIG.API_BASE}${downloadURL}`,
  );
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "report.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return blob;
}

async function getReport(payload) {
  payload = requestData;

  try {
    // 1. create print job
    const { ref, statusURL, downloadURL } = await createPrintJob(payload);
    console.log("Druckjob erstellt:", { ref, statusURL, downloadURL });

    // 2. watch status
    await monitorJobStatus(statusURL);
    console.log("Druckjob abgeschlossen");

    // 3. download report
    await downloadReport(downloadURL);
    console.log("Bericht erfolgreich heruntergeladen");
  } catch (error) {
    console.error("Fehler bei der Berichtserstellung:", error);
    throw error;
  }
}

export default getReport;

