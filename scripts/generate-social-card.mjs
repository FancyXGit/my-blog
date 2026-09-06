import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = (name) => readFileSync(path.join(repo, "src/assets/fonts", name));

const regular = font("SunghyunSans-Regular.latin.ttf");
const bold = font("SunghyunSans-Bold.latin.ttf");

const ogOptions = {
	fonts: [
		{ data: regular, name: "SunghyunSans", style: "normal", weight: 400 },
		{ data: bold, name: "SunghyunSans", style: "normal", weight: 700 },
	],
	height: 630,
	width: 1200,
};

const markup = html`
  <div tw="flex flex-col w-full h-full bg-[#f2f2f2] text-[#6b6b6b]">
    <div tw="flex flex-col flex-1 w-full p-12 justify-center">
      <h1 tw="text-7xl font-bold tracking-tight text-[#224d67]">FancyXGit</h1>
      <p tw="text-3xl mt-8 text-[#545454]">Notes, study logs &amp; everyday ideas</p>
    </div>
    <div
      tw="flex items-end justify-between w-full px-12 py-8 border-t border-[#dbdbdb] text-2xl text-[#6b6b6b]"
    >
      <span tw="text-[#545454]">Personal blog · Astro</span>
      <span tw="text-[#8e8e8e]">fancyflow.top</span>
    </div>
  </div>
`;

const svg = await satori(markup, ogOptions);
const png = new Resvg(svg).render().asPng();

const out = path.join(repo, "public/social-card.png");
writeFileSync(out, png);
console.log("wrote", path.relative(repo, out), png.length, "bytes");
