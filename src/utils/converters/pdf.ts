import childProcess from "node:child_process";
import { Article } from "../types";
import createHTML from "./html";

export default async function createPDF(
  articles: Array<Article>,
  outputPath: string,
  customWkToHtmlPath?: string
) {
  const html = await createHTML(articles);

  return await new Promise<void>((resolve, reject) => {
    const execution = childProcess.execFile(
      customWkToHtmlPath || "wkhtmltopdf",
      ["--read-args-from-stdin", "-", outputPath],
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
    execution.stdin?.write(html);
    execution.stdin?.end();
  });
}

function IsWkHTMLTOPDFExists() {
  return childProcess.execSync("which wkhtmltopdf").toString().trim() !== "";
}
