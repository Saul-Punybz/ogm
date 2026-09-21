/** Prueba rapida de la agrupacion por plataforma: `npx tsx scripts/check-platforms.ts` */
import assert from "node:assert/strict";
import { plataformasDe } from "../lib/platforms";

assert.deepEqual(plataformasDe(["iOS", "Android"]), ["movil"]);
assert.deepEqual(plataformasDe(["PC (Microsoft Windows)", "PlayStation 5", "Xbox Series X|S"]), ["pc", "ps5", "xbox"]);
assert.deepEqual(plataformasDe(["Nintendo Switch 2"]), ["nintendo"]);
assert.deepEqual(plataformasDe(["Mac"]), ["pc"]);
assert.deepEqual(plataformasDe(["PlayStation 4", "Xbox 360"]), [], "consolas viejas no cuentan");
assert.deepEqual(plataformasDe([]), []);
console.log("plataformas: 6 casos OK");
