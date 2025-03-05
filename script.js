import { sort } from "fast-sort";
import { JSDOM } from "jsdom";
import json2md from "json2md";
import fs from "node:fs";
import sortKeys from "sort-keys";

const get = {
  languageName: (languageCode) =>
    ({ en: "English", ru: "Русский" }[languageCode]),
  readMeFileName: (languageCode) =>
    ({ en: "readme.md" }[languageCode] ?? `readme.${languageCode}.md`),
};

// https://github.com/antfu/kaomo/blob/master/scripts/fetch.ts
Promise.all(
  ["ru", "en"].map((languageCode, index, languageCodes) => {
    let result = {};

    const {
      window: { document },
    } = new JSDOM(fs.readFileSync(`html/${languageCode}.txt`).toString());

    for (const element of Array.from(
      document.querySelectorAll("h3 > a[name]")
    )) {
      const { parentElement } = element;

      const kaomoji = sort(
        Array.from(
          new Set(
            Array.from(
              parentElement.nextElementSibling.nextElementSibling.querySelectorAll(
                ".table_kaomoji td > span"
              )
            )
              .map((element) => element.textContent.trim())
              .filter(Boolean)
          )
        )
      ).asc();

      result[element.textContent] = {
        description: parentElement.nextElementSibling.textContent,
        count: kaomoji.length,
        kaomoji,
      };
    }

    result = sortKeys(result, { deep: true });

    fs.writeFileSync(`data/${languageCode}.json`, JSON.stringify(result));

    fs.writeFileSync(
      get.readMeFileName(languageCode),
      json2md([
        {
          p: document.querySelector(".updates_table td").childNodes[2]
            .textContent,
        },
        {
          img: {
            title: document.querySelector("title").textContent,
            source: `logo/${languageCode}.jpg`,
          },
        },
        { h2: "Languages" },
        {
          ul: languageCodes.map(
            (languageCode) =>
              `<a href='${get.readMeFileName(languageCode)}'>${get.languageName(
                languageCode
              )}</a>`
          ),
        },
        ...Object.entries(result).flatMap(([title, result]) => [
          { h2: `${title} <sup>${result.count}</sup>` },
          { p: result.description },
          { code: { content: result.kaomoji.join("\n\n") } },
        ]),
      ])
    );
  })
);
