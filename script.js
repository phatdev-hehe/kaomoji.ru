import { JSDOM } from "jsdom";
import fs from "node:fs";

// https://github.com/antfu/kaomo/blob/master/scripts/fetch.ts
Promise.all(
  ["ru", "en"].map((languageCode) => {
    const result = {};

    const dom = new JSDOM(
      fs.readFileSync(`html/${languageCode}.txt`).toString()
    );

    for (const element of Array.from(
      dom.window.document.querySelectorAll("h3 > a[name]")
    )) {
      result[element.textContent] = Array.from(
        element.parentElement.nextElementSibling.nextElementSibling.querySelectorAll(
          ".table_kaomoji td > span"
        )
      )
        .map(({ textContent }) => textContent)
        .filter(Boolean);
    }

    fs.writeFileSync(`data/${languageCode}.json`, JSON.stringify(result));
  })
);
