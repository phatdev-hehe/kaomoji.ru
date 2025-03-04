import { sort } from "fast-sort";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import sortKeys from "sort-keys";

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
      const { parentElement } = element;

      const kaomoji = sort(
        Array.from(
          parentElement.nextElementSibling.nextElementSibling.querySelectorAll(
            ".table_kaomoji td > span"
          )
        )
          .map(({ textContent }) => textContent)
          .filter(Boolean)
      ).asc();

      result[element.textContent] = {
        description: parentElement.nextElementSibling.textContent,
        count: kaomoji.length,
        kaomoji,
      };
    }

    fs.writeFileSync(
      `data/${languageCode}.json`,
      JSON.stringify(sortKeys(result, { deep: true }))
    );
  })
);
