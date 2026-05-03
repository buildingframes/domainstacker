export type Idea = {
  name: string;
  domain: string;
  angle: string;
  score: number;
  tlds: string[];
};

export function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 48);
}

export function domainFromName(name: string, tld = '.com') {
  const label = normalizeLabel(name) || 'launchbrand';
  return `${label}${tld}`;
}

export function namecheapSearchUrl(domain: string) {
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
}

export function godaddySearchUrl(domain: string) {
  return `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`;
}
