import https from "https";

async function loadSourceData(dataURL: string) {
  return new Promise((resolve, reject) => {
    https
      .get(dataURL, async (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          resolve(body);
        });
      })
      .on("error", (error) => {
        console.error(error.message);
      });
  });
}

export { loadSourceData };
