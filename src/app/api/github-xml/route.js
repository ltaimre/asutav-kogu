// API route XML failide laadimiseks GitHubist
import { NextResponse } from "next/server";

const GITHUB_REPO = "Rahvusarhiiv2/pp-asutav-kogu";
const GITHUB_BRANCH = "main";
const FOLDER_PATH = "tokyo_nyydne";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  // Kontrolli kas token on olemas
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      {
        error:
          "GitHub token puudub. Lisa GITHUB_TOKEN oma .env.local faili. Repo on privaatne ja vajab autentimist.",
      },
      { status: 401 }
    );
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  try {
    if (fileName) {
      const fileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FOLDER_PATH}/${fileName}?ref=${GITHUB_BRANCH}`;
      const response = await fetch(fileUrl, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch file: ${response.statusText}. ${
            errorData.message || ""
          }`
        );
      }

      // GitHub API tagastab base64 encoded sisu
      const data = await response.json();
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return NextResponse.json({ content });
    }

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FOLDER_PATH}?ref=${GITHUB_BRANCH}`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    const xmlFiles = data
      .filter((item) => item.type === "file" && item.name.endsWith(".xml"))
      .map((file) => ({
        name: file.name,
        size: file.size,
        downloadUrl: file.download_url,
        htmlUrl: file.html_url,
      }));

    return NextResponse.json({ files: xmlFiles });
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
