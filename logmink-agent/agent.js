/**
 *  for more details check (https://www.npmjs.com/package/pcap)
 */
const pcap = require("pcap");

/**
 *  customized internal logger utilizing [winston] pkg
 */
const Logger = require("./logger");
const logger = Logger._logger;

/// eht0 used for linux docker interface
/// lo used for linux docker loopback (isolated)
/// lo0 used for mac host machine local loopback
const networkInterface = "eth0";

/**
 *  create a pcap session to listen on the specified interface for HTTP traffic
 *  @argument {string} networkInterface - device network interface that want to capture
 *  @argument {string || object} options - more pcap options to be passed
 *  @example "tcp" || "tcp port 80"
 *
 */
const pcapSession = pcap.createSession(networkInterface, "tcp");

pcapSession.on("packet", async function (rawPacket) {
  /**
   *  @event packet
   *  @example
   *  PcapPacket {
   *    link_type: 'LINKTYPE_ETHERNET',
   *    pcap_header: PcapHeader {
   *      tv_sec: 1725618042,
   *      tv_usec: 693395,
   *      caplen: 66,
   *      len: 66
   *    },
   *    payload: EthernetPacket {
   *      emitter: undefined,
   *      dhost: EthernetAddr { addr: [Array] },
   *      shost: EthernetAddr { addr: [Array] },
   *      ethertype: 2048,
   *      vlan: null,
   *      payload: IPv4 {
   *        emitter: undefined,
   *        version: 4,
   *        headerLength: 20,
   *        diffserv: 0,
   *        length: 52,
   *        identification: 0,
   *        flags: [IPFlags],
   *        fragmentOffset: 0,
   *        ttl: 64,
   *        protocol: 6,
   *        headerChecksum: 61369,
   *        saddr: [IPv4Addr],
   *        daddr: [IPv4Addr],
   *        protocolName: undefined,
   *        payload: [TCP]
   *      }
   *    },
   *    emitter: undefined
   *  }
   *
   *
   */
  const packet = pcap.decode.packet(rawPacket);

  /**
   *  ipLayer object is being stored to access [consumer] and [producer]
   *  http requests
   * 
   *  @property {object} ipLayer
   *  @property {string} ipLayer.saddr   (from)
   *  @property {string} ipLayer.daddr   (to)
   */
  const ipLayer = packet.payload.payload;
  const tcpLayer = ipLayer.payload;
  const httpData = tcpLayer?.data?.toString();

  if (httpData?.includes("HTTP") && !httpData?.includes("X-Agent-Logs")) {
    const [requestLine, ...headerLines] = httpData.split("\r\n");
    const headers = {};
    var payload = "";

    /// parse the request line (e.g., "GET /path HTTP/1.1")
    const [method, url] = requestLine.split(" ");
    const methodsList = [
      "GET",
      "POST",
      "HEAD",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
      "CONNECT",
      "TRACE",
    ];

    if (!methodsList.includes(method)) {
      /// currently this if condition is allowing only http
      /// requests to be parsed and shared with the host.

      /// parsing should be enhanced to be accurate
      /// as it's now working for requests only, responses
      /// are not covered.

      /// TODO: response should be handled differently
      ///       as there is no method specified.
      return;
    }

    for (const line of headerLines) {
      if (line === "") {
        payload = headerLines
          .slice(headerLines.indexOf(line) + 1)
          .join("\r\n");
        break;
      }
      const [key, ...valueParts] = line.split(": ");
      if (key && valueParts.length > 0) {
        headers[key] = valueParts.join(": ");
      }
    }

    /// payload to be shared with the host [boki.master]
    const _request = {
      timestamp: new Date().toISOString(),
      method,
      url,
      headers,
      payload: () => {
        try {
          return JSON.parse(payload);
        } catch {
          return payload;
        }
      },
      from: ipLayer.saddr.toString(),
      to: ipLayer.daddr.toString(),
    };

    /// logging for debugging purposes
    ///
    /// I'd highly recommend to not log in prod env as it will be 
    /// resources extensive also it might be used to pull the logs
    /// for different solutions
    logger.info(_request);

    /// Send data to a centralized host [boki.master]
    await fetch(`${process.env.LOGMINK_HUB_URL}:${process.env.PORT}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        /// custom header to identify internal requests
        "X-Agent-Logs": "true",
      },
      body: JSON.stringify(_request),
    });
  }
});

console.log(`Listening on interface ${networkInterface} for HTTP traffic...`);
