import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { cyanframe: '#20C3CA', ink: '#0B1220' } } }, plugins: [] };
export default config;
