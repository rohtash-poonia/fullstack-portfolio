import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { default: sharp } = await import(process.env.SHARP_MODULE ? pathToFileURL(process.env.SHARP_MODULE).href : 'sharp');
const directory = 'src/assets/images/';
await mkdir(directory + 'optimized', { recursive: true });
const jobs = [
  ['SV.png', 'logo-160', 160],
  ['y.jpeg', 'profile-240', 240], ['y.jpeg', 'profile-480', 480],
  ['Astra.png', 'astra-450', 450], ['Astra.png', 'astra-900', 900],
  ['av.png', 'testimonial-192', 192],
  ['ko.png', 'portfolio-960', 960],
  ['Screenshot 2026-04-05 124850.png', 'task-master-960', 960],
];
for (const [input, name, width] of jobs) {
  const result = await sharp(directory + input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(directory + 'optimized/' + name + '.webp');
  console.log(name, JSON.stringify(result));
}
