import { sort } from "fast-sort";
import { JSDOM } from "jsdom";
import json2md from "json2md";
import fs from "node:fs";
import sortKeys from "sort-keys";

// https://github.com/antfu/kaomo/blob/master/scripts/fetch.ts
Promise.all(
  ["ru", "en"].map((languageCode) => {
    let result = {};

    const dom = new JSDOM(
      fs.readFileSync(`html/${languageCode}.txt`).toString()
    );

    for (const element of Array.from(
      dom.window.document.querySelectorAll("h3 > a[name]")
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

    if (languageCode === "en")
      fs.writeFileSync(
        "readme.md",
        json2md([
          {
            p: dom.window.document.querySelector(".updates_table td")
              .childNodes[2].textContent,
          },
          {
            img: {
              title: dom.window.document.querySelector("title").textContent,
              source: "logo_en.jpg",
            },
          },
          ...Object.entries(result).flatMap(([title, result]) => [
            { h2: `${title} <sup>${result.count}</sup>` },
            { blockquote: result.description },
            { ul: result.kaomoji },
          ]),
        ])
      );
  })
);
