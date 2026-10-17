import test from "node:test";
import assert from "node:assert/strict";
import { parseIPv4, parseIPv6, classifyIP } from "./ip-classifier.js";

test("IPv4 parser accepts exactly four bounded decimal octets", () => {
  assert.deepEqual(parseIPv4("192.168.1.20"), [192, 168, 1, 20]);
  assert.equal(parseIPv4("256.1.1.1"), null);
  assert.equal(parseIPv4("192.168.1"), null);
  assert.equal(parseIPv4("example.com"), null);
});

test("IPv4 classification covers private, loopback, link-local and other addresses", () => {
  assert.equal(classifyIP("10.0.0.4").scope, "local/intranet");
  assert.equal(classifyIP("172.16.0.4").scope, "local/intranet");
  assert.equal(classifyIP("192.168.1.4").scope, "local/intranet");
  assert.equal(classifyIP("127.0.0.1").scope, "loopback");
  assert.equal(classifyIP("169.254.2.4").scope, "link-local");
  assert.equal(classifyIP("8.8.8.8").scope, "other/global-or-special");
});

test("IPv6 parser handles compression and embedded IPv4", () => {
  assert.equal(parseIPv6("::1").length, 8);
  assert.equal(parseIPv6("2001:db8::1").length, 8);
  assert.equal(parseIPv6("::ffff:192.0.2.1").length, 8);
  assert.equal(parseIPv6("2001::db8::1"), null);
  assert.equal(parseIPv6("fe80::zz"), null);
  assert.equal(parseIPv6("fe80::1%eth0"), null);
});

test("IPv6 classification covers loopback, unspecified, unique-local, link-local and other", () => {
  assert.equal(classifyIP("::1").scope, "loopback");
  assert.equal(classifyIP("::").scope, "unspecified");
  assert.equal(classifyIP("fd12:3456::1").scope, "local/intranet");
  assert.equal(classifyIP("fe80::1").scope, "link-local");
  assert.equal(classifyIP("2001:4860:4860::8888").scope, "other/global-or-special");
});

test("invalid input never yields a scope classification", () => {
  assert.equal(classifyIP(""), null);
  assert.equal(classifyIP("host.example"), null);
  assert.equal(classifyIP("1.2.3.999"), null);
});
