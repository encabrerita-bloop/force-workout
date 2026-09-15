exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "encabrerita-bloop/force-workout";
  const FILE = "progress.json";

  if (!TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Token not configured" }) };
  }

  try {
    const data = JSON.parse(event.body);
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    // Obtener SHA del archivo actual si existe
    let sha = "";
    try {
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
        headers: { "Authorization": `token ${TOKEN}`, "Accept": "application/vnd.github.v3+json" }
      });
      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha || "";
      }
    } catch(e) {}

    // Subir el archivo
    const body = {
      message: `FORCE progress — ${new Date().toISOString().split("T")[0]}`,
      content,
      ...(sha ? { sha } : {})
    };

    const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: true })
      };
    } else {
      const err = await putRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: err }) };
    }
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
