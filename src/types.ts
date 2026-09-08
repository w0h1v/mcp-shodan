export interface DnsResponse {
  [hostname: string]: string;
}

export interface ReverseDnsResponse {
  [ip: string]: string[] | null;
}

export interface SearchLocation {
  city: string | null;
  region_code: string | null;
  area_code: number | null;
  longitude: number;
  latitude: number;
  country_code: string;
  country_name: string;
}

export interface SearchMatch {
  product?: string;
  hash: number;
  ip: number;
  ip_str: string;
  org: string;
  isp: string;
  transport: string;
  cpe?: string[];
  version?: string;
  hostnames: string[];
  domains: string[];
  location: SearchLocation;
  timestamp: string;
  port: number;
  data: string;
  asn: string;
  http?: {
    server?: string;
    title?: string;
    robots?: string | null;
    sitemap?: string | null;
  };
}

export interface SearchResponse {
  matches: SearchMatch[];
  facets: {
    country?: Array<{
      count: number;
      value: string;
    }>;
  };
  total: number;
}

export interface ShodanSslCert {
  sig_alg?: string;
  issued?: string;
  expires?: string;
  expired?: boolean;
  version?: number;
  serial?: number | string;
  fingerprint?: {
    sha1?: string;
    sha256?: string;
  };
  subject?: Record<string, string>;
  issuer?: Record<string, string>;
  pubkey?: {
    type?: string;
    bits?: number;
  };
  extensions?: Array<{
    critical?: boolean;
    name: string;
    data?: string;
  }>;
}

export interface ShodanSsl {
  versions?: string[];
  alpn?: string[];
  ja3s?: string;
  jarm?: string;
  cipher?: {
    version?: string;
    bits?: number;
    name?: string;
  };
  trust?: {
    revoked?: boolean;
    browser?: unknown;
  };
  chain_sha256?: string[];
  chain?: string[];
  dhparams?: {
    bits?: number;
    generator?: number;
    fingerprint?: string;
    prime?: string;
    public_key?: string;
  };
  cert?: ShodanSslCert;
}

export interface ShodanService {
  port: number;
  transport: string;
  data?: string;
  http?: {
    server?: string;
    title?: string;
  };
  ssl?: ShodanSsl;
  cloud?: {
    provider: string;
    service: string;
    region: string;
  };
}

export interface CveResponse {
  cve_id: string;
  summary: string;
  cvss: number;
  cvss_version: number;
  cvss_v2: number;
  cvss_v3: number;
  epss: number;
  ranking_epss: number;
  kev: boolean;
  propose_action: string;
  ransomware_campaign: string;
  references: string[];
  published_time: string;
  cpes: string[];
}

export interface ShodanHostResponse {
  ip_str: string;
  org: string;
  isp: string;
  asn: string;
  last_update: string;
  country_name: string;
  city: string;
  latitude: number;
  longitude: number;
  region_code: string;
  ports: number[];
  data: ShodanService[];
  hostnames: string[];
  domains: string[];
  tags: string[];
}
