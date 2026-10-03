// scripts/fix-archived-claims.cjs
// Fix false plan claims in archived blog post (7 spots).
// All replacements: honest 10MB-everywhere copy, no per-hour/priority/50MB/100MB.
const fs = require('fs');
const path = require('path');
// Derive from this file's location rather than hardcoding an absolute path:
// the hardcoded form leaked the author's local directory layout into a public
// repo and broke the script on any other machine.
const FILE = path.join(
  __dirname,
  '..',
  'src/data/_archived/how-to-convert-epub-to-mobi.ts'
);

const REPLACEMENTS = [
  // EN :34
  [
    'Free conversions handle files up to 10MB, which covers nearly every text-only novel. Illustrated books — comics, cookbooks, textbooks — run much larger and need a paid plan, where the ceiling rises to 50MB on Pro and 100MB on the API tier.',
    'Conversions handle files up to 10MB on every plan, which covers nearly every text-only novel. Illustrated books — comics, cookbooks, textbooks — run much larger; split them by chapter or convert them with a desktop tool.'
  ],
  // EN :54
  [
    'The free tier gives you five conversions per hour with no account required, which is plenty for a small library migration.',
    'The converter requires no account, and the 10MB per-file cap covers most books — plenty for a small library migration.'
  ],
  // EN :91
  [
    '- **Watch the limits** — 10MB free, 50MB Pro, 100MB API; five conversions per hour on the free tier',
    '- **Watch the limits** — 10MB per file on all plans; split larger books before converting'
  ],
  // EN :117
  [
    '10MB, which covers virtually every novel. Pro handles up to 50MB and the API plan up to 100MB, which is where illustrated books and textbooks usually land.',
    '10MB on every plan, which covers virtually every novel. Illustrated books and textbooks often exceed it, so split them by chapter first.'
  ],
  // ES :162
  [
    'Las conversiones gratuitas manejan archivos de hasta 10 MB, lo que cubre casi todas las novelas solo texto. Los libros ilustrados —cómics, recetarios, libros de texto— son mucho más grandes y necesitan un plan de pago, donde el límite sube a 50 MB en Pro y 100 MB en el nivel de API.',
    'Las conversiones manejan archivos de hasta 10 MB en todos los planes, lo que cubre casi todas las novelas solo texto. Los libros ilustrados —cómics, recetarios, libros de texto— son mucho más grandes; divídelos por capítulos o conviértelos con una herramienta de escritorio.'
  ],
  // ES :219
  [
    '- **Ojo con los límites** — 10 MB gratis, 50 MB Pro, 100 MB API; cinco conversiones por hora en el nivel gratuito',
    '- **Ojo con los límites** — 10 MB por archivo en todos los planes; divide los libros más grandes antes de convertir'
  ],
  // ES :244
  [
    '10 MB, lo que cubre prácticamente cualquier novela. Pro llega hasta 50 MB y el plan API hasta 100 MB, que es donde suelen caer los libros ilustrados y los libros de texto.',
    '10 MB en todos los planes, lo que cubre prácticamente cualquier novela. Los libros ilustrados y los libros de texto suelen superarlo, así que divídelos por capítulos primero.'
  ]
];

let src = fs.readFileSync(FILE, 'utf8');
let n = 0;
for (const [oldS, newS] of REPLACEMENTS) {
  const count = src.split(oldS).length - 1;
  if (count !== 1) throw new Error('HIT ' + count + ' (expect 1): ' + oldS.slice(0, 60));
  src = src.replace(oldS, newS);
  n++;
}
fs.writeFileSync(FILE, src, 'utf8');
console.log('replaced ' + n + '/7 claims');
