import fs from 'fs';
import path from 'path';

const storePath = path.resolve('Frontend/src/data/store.js');
let content = fs.readFileSync(storePath, 'utf8');

// 1. In INITIAL_PRESETS:
content = content.replace(
  `  {
    id: "preset-classic",
    title: "Elegant Floral Cream",
    religion: "secular",
    config: {`,
  `  {
    id: "preset-classic",
    title: "Elegant Floral Cream",
    religion: "secular",
    thumbnail: "/cover_suman_vishal_1k.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-dark",
    title: "Royal Floral Navy",
    religion: "secular",
    config: {`,
  `  {
    id: "preset-dark",
    title: "Royal Floral Navy",
    religion: "secular",
    thumbnail: "/bg_floral_dark.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-green",
    title: "Romantic Lace Green",
    religion: "secular",
    config: {`,
  `  {
    id: "preset-green",
    title: "Romantic Lace Green",
    religion: "secular",
    thumbnail: "/bg_lace_green.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-royal-scroll",
    title: "3D Royal Imperial Scroll",
    religion: "royal",
    config: {`,
  `  {
    id: "preset-royal-scroll",
    title: "3D Royal Imperial Scroll",
    religion: "royal",
    thumbnail: "/real_palace_doors.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-royal-palace",
    title: "Indian Vintage Royal Palace (Rajwada)",
    religion: "hindu",
    config: {`,
  `  {
    id: "preset-royal-palace",
    title: "Indian Vintage Royal Palace (Rajwada)",
    religion: "hindu",
    thumbnail: "/thumbnails/radha-krishna.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-neon-glass",
    title: "Cyberpunk Minimalist Neon Glass",
    religion: "secular",
    config: {`,
  `  {
    id: "preset-neon-glass",
    title: "Cyberpunk Minimalist Neon Glass",
    religion: "secular",
    thumbnail: "/cover_suman_vishal_1k.jpg",
    config: {`
);

content = content.replace(
  `  {
    id: "preset-gold-foil",
    title: "Luxury Metallic Floral Gold Foil",
    religion: "secular",
    config: {`,
  `  {
    id: "preset-gold-foil",
    title: "Luxury Metallic Floral Gold Foil",
    religion: "secular",
    thumbnail: "/cover_suman_vishal_1k.jpg",
    config: {`
);

// 2. In serverDbCache initialization inside getDb():
content = content.replace(
  `      serverDbCache = {
        users: JSON.parse(JSON.stringify(INITIAL_USERS)),
        invitations: JSON.parse(JSON.stringify(INITIAL_INVITATIONS)),
        presets: JSON.parse(JSON.stringify(INITIAL_PRESETS)),`,
  `      serverDbCache = {
        users: JSON.parse(JSON.stringify(INITIAL_USERS)),
        invitations: JSON.parse(JSON.stringify(INITIAL_INVITATIONS)),
        presets: JSON.parse(JSON.stringify(INITIAL_PRESETS)),`
);

fs.writeFileSync(storePath, content, 'utf8');
console.log("INITIAL_PRESETS thumbnails updated successfully!");

