import { FastMCP } from "fastmcp";
import { z } from "zod";
import { queryShodan, formatSslSummary, sortedCveIds } from "../helpers.js";
import type { ShodanService } from "../types.js";

export function registerIpLookup(server: FastMCP) {
  server.addTool({
    name: "ip_lookup",
    description:
      "Retrieve comprehensive information about an IP address, including geolocation, operating system, open ports, running services (product, version, CPE), known vulnerabilities (CVEs), SSL certificates, hostnames, and cloud provider details if available. Returns service banners and HTTP server information when present. Optional history returns historical banners; minify omits banners.",
    parameters: z.object({
      ip: z.union([z.ipv4(), z.ipv6()]).describe("The IP address (IPv4 or IPv6) to query."),
      history: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Include historical banners. Adds a 'Banner History' with one row per port, product and version, showing first/last seen and how many times it was observed; Services still shows the latest banner per port."
        ),
      minify: z
        .boolean()
        .optional()
        .default(false)
        .describe("Return only basic host information and the port list, without banners."),
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const params: Record<string, any> = {};
      if (args.history) params.history = true;
      if (args.minify) params.minify = true;
      const result = await queryShodan(`/shodan/host/${args.ip}`, params);

      const ports: number[] = result.ports || [];
      const data: ShodanService[] = result.data || [];

      const byTimeDesc = (a: ShodanService, b: ShodanService) =>
        (b.timestamp || "").localeCompare(a.timestamp || "");
      const latestByPort = new Map<number, ShodanService>();
      for (const banner of data) {
        const current = latestByPort.get(banner.port);
        if (!current || byTimeDesc(banner, current) < 0) {
          latestByPort.set(banner.port, banner);
        }
      }
      const topVulns = sortedCveIds(result.vulns);

      const formattedResult = {
        "IP Information": {
          "IP Address": result.ip_str,
          Organization: result.org,
          ISP: result.isp,
          ASN: result.asn,
          "Last Update": result.last_update,
          OS: result.os || "Unknown",
        },
        Location: {
          Country: result.country_name,
          City: result.city,
          Coordinates: `${result.latitude}, ${result.longitude}`,
          Region: result.region_code,
        },
        Services: ports.map((port: number) => {
          const service = latestByPort.get(port);
          const cpe = service?.cpe23 ?? service?.cpe;
          const serviceVulns = sortedCveIds(service?.vulns);
          return {
            Port: port,
            Protocol: service?.transport || "unknown",
            Service: service?.data?.trim() || "No banner",
            Product: service?.product || "Unknown",
            Version: service?.version || "Unknown",
            CPE: cpe || [],
            ...(serviceVulns.length ? { Vulnerabilities: serviceVulns } : {}),
            ...(service?.http
              ? {
                  HTTP: {
                    Server: service.http.server,
                    Title: service.http.title,
                  },
                }
              : {}),
            ...(service?.ssl
              ? {
                  SSL: formatSslSummary(service.ssl),
                }
              : {}),
          };
        }),
        Vulnerabilities: topVulns.length
          ? { Count: topVulns.length, CVEs: topVulns }
          : "None reported",
        ...(args.history
          ? {
              "Banner History": summarizeHistory(data),
            }
          : {}),
        "Cloud Provider": data[0]?.cloud
          ? {
              Provider: data[0].cloud.provider,
              Service: data[0].cloud.service,
              Region: data[0].cloud.region,
            }
          : "Not detected",
        Hostnames: result.hostnames || [],
        Domains: result.domains || [],
        Tags: result.tags || [],
      };

      return JSON.stringify(formattedResult, null, 2);
    },
  });
}

// Shodan returns one banner per scan, so a long-lived host can have hundreds of
// near-identical entries. Collapse them to one row per port, transport, product
// and version with the first and last time it was seen.
function summarizeHistory(data: ShodanService[]) {
  const rows = new Map<
    string,
    {
      Port: number;
      Transport: string;
      Product: string;
      Version: string;
      "First Seen": string;
      "Last Seen": string;
      Observations: number;
    }
  >();
  for (const b of data) {
    const product = b.product || "Unknown";
    const version = b.version || "Unknown";
    const ts = b.timestamp || "";
    const key = JSON.stringify([b.port, b.transport, product, version]);
    const row = rows.get(key);
    if (!row) {
      rows.set(key, {
        Port: b.port,
        Transport: b.transport,
        Product: product,
        Version: version,
        "First Seen": ts,
        "Last Seen": ts,
        Observations: 1,
      });
      continue;
    }
    row.Observations++;
    if (ts && (!row["First Seen"] || ts < row["First Seen"])) row["First Seen"] = ts;
    if (ts > row["Last Seen"]) row["Last Seen"] = ts;
  }
  return [...rows.values()].sort(
    (a, b) => a.Port - b.Port || b["Last Seen"].localeCompare(a["Last Seen"])
  );
}
