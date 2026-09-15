exports.handler = async function(event) {
  const TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "encabrerita-bloop/force-workout";
  const FILE = "progress.json";

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: {
        "Authorization": `token ${TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });
    if (!res.ok) return { statusCode: 404, body: "{}" };
    const d = await res.json();
    const content = JSON.parse(Buffer.from(d.content, "base64").toString("utf-8"));
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(content)
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
