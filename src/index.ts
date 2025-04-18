import fs from "node:fs";
import path from "node:path";
import prompts from "prompts";
import cliProgress from "cli-progress";
import chalk from "chalk";

import blogs from "./blogs";
import createEpub from "./utils/converters/epub";
import { Article } from "./utils/types";
import createPDF from "./utils/converters/pdf";
import createHTML from "./utils/converters/html";

(async () => {
  const response = await prompts([
    {
      name: "blogs",
      type: "multiselect",
      message:
        "choice one or more blogs to export (اختر مدونة أو أكثر للتصدير)",
      choices: blogs.map((blog) => ({ title: blog.name })),
    },
    {
      name: "exportType",
      type: "select",
      message: "Choose export type (اختر نوع التصدير)",
      choices: [
        { title: "JSON", value: "json" },
        { title: "EPUB", value: "epub" },
        { title: "PDF", value: "pdf" },
        { title: "HTML", value: "html" },
        // { title: "DOCX", value: "docx" },
      ],
    },
  ]);
  if (response.blogs.length === 0) {
    console.log(
      chalk.bgYellowBright.black("Warn:"),
      chalk.yellow("No blogs have been choiced, leaving.")
    );
    return;
  }
  for (const index of response.blogs as number[]) {
    const blog = blogs[index];
    const Blogger = new blog.class();
    console.log(chalk.bgCyanBright.black("blog name:"), chalk.cyan(blog.name));
    const progress = new cliProgress.SingleBar(
      { hideCursor: true, clearOnComplete: true },
      cliProgress.Presets.shades_classic
    );
    const articles = await Blogger.fetchFullArticles(
      {
        full: true,
      },
      (data) => {
        if (data.type === "fetch_articles") {
          console.log(
            chalk.bgGreenBright.black("INFO:"),
            chalk.green("Fetching"),
            chalk.yellow(data.articlesCount),
            chalk.green("article.")
          );
          progress.start(data.articlesCount, 0);
        } else {
          progress.update(Math.trunc(data.progress * progress.getTotal()));
        }
      }
    );
    progress.stop();
    if (articles.length <= 0) {
      console.log(
        chalk.bgYellowBright.black("WARN:"),
        chalk.yellow("couldn't find any article in this blog.")
      );
      continue;
    }
    console.log(
      chalk.bgGreenBright.black("SUCCESS:"),
      chalk.green(
        `articles scrapped Successfully, exporting them with '${response.exportType}', please choice direction.`
      )
    );
    const { exportPath } = await prompts([
      {
        name: "exportPath",
        type: "text",
        message: "specifiy file path.",
        validate: (value) => {
          const dir = path.dirname(value);
          if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory())
            return true;
          return "must be a valid directory";
        },
        initial: path.join(
          process.cwd(),
          `${blog.name}.${response.exportType}`
        ),
      },
    ]);
    if (fs.existsSync(exportPath)) {
      const { willContinue } = await prompts([
        {
          name: "willContinue",
          type: "toggle",
          initial: true,
          active: "yes",
          inactive: "no",
          message: `the file already exists "${path.basename(
            exportPath
          )}", do you want to continue?`,
        },
      ]);
      if (!willContinue) {
        console.log("ok, as you wish, i'll leave now.");
        return;
      }
    }
    if (response.exportType === "json") {
      await fs.promises.writeFile(
        exportPath,
        JSON.stringify(articles, null, 2)
      );
    } else if (response.exportType === "epub") {
      const epubFile = await createEpub(blog.name, articles as Array<Article>);
      await fs.promises.writeFile(exportPath, epubFile);
    } else if (response.exportType === "pdf") {
      console.log(
        chalk.bgCyanBright.black("INFO:"),
        chalk.cyan("creating pdf...")
      );
      try {
        await createPDF(articles as Array<Article>, exportPath);
      } catch (error) {
        console.log(
          chalk.bgRedBright.black("ERROR:"),
          chalk.red(
            "error in creating pdf, please check if you have wkhtmltopdf installed or specify the path to it."
          )
        );
        const { customWkToHtmlPath } = await prompts({
          name: "customWkToHtmlPath",
          type: "text",
          validate: (value) =>
            (fs.existsSync(value) && fs.lstatSync(value).isFile()) ||
            value === "" ||
            "must be a valid file",
          message: "please specify the path to wkhtmltopdf.",
        });
        if (!customWkToHtmlPath) {
          console.log(
            chalk.bgRedBright.black("ERROR:"),
            chalk.red("exiting...")
          );
          return;
        }
        try {
          await createPDF(
            articles as Array<Article>,
            exportPath,
            customWkToHtmlPath
          );
        } catch (error) {
          console.log(
            chalk.bgRedBright.black("ERROR:"),
            chalk.red("error in creating pdf, trying to save it as html.")
          );
          const html = await createHTML(articles as Array<Article>);
          await fs.promises.writeFile(
            exportPath.replace(path.extname(exportPath), ".html"),
            html
          );
          return;
        }
      }
    } else if (response.exportType === "html") {
      console.log(
        chalk.bgCyanBright.black("INFO:"),
        chalk.cyan("creating html...")
      );
      const html = await createHTML(articles as Array<Article>);
      await fs.promises.writeFile(exportPath, html);
    } else if (response.exportType === "docx") {
      // TODO: create it.
    }

    console.log(
      chalk.bgGreenBright.black("SUCCESS:"),
      chalk.green("exporting finished successfully.")
    );
  }
})();
