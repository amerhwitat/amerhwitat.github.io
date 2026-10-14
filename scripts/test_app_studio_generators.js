#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const ids = ["q","filter","grid","console","javaAppName","javaPackage","generateJava","downloadJava","javaOutput","featureQ","featureFilter","featureGrid","framework","frameworkAppName","frameworkOutput","generateFramework","downloadFramework"];
const elements = Object.fromEntries(ids.map(id => [id, {
  id, value: id === "javaAppName" ? "Aurora Test App" : id === "javaPackage" ? "org.example.auroratest" : id === "frameworkAppName" ? "Aurora Test App" : id === "framework" ? "vite-react" : id === "filter" || id === "featureFilter" ? "all" : "",
  innerHTML: "", listeners: {}, addEventListener(event, callback) { this.listeners[event] = callback; },
  scrollTop: 0, scrollHeight: 0
}]));
let downloaded = null;
const document = {
  getElementById(id) { return elements[id] || null; },
  body: { appendChild() {} },
  createElement() { return { click() {}, remove() {}, set href(value) {}, set download(value) {} }; }
};
class MockBlob {
  constructor(parts, options) { this.text = parts.join(""); this.type = options?.type || ""; downloaded = this; }
}
const context = {
  document, window: {}, console, Blob: MockBlob,
  URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
  Date, JSON, String, Math, RegExp, Object, Array, Set
};
const source = fs.readFileSync("apps/chimera-ii-os/web/repository-app-studio.js", "utf8");
vm.runInNewContext(source, context, { filename: "repository-app-studio.js" });

elements.generateJava.listeners.click();
assert.match(elements.javaOutput.value, /public final class MainActivity/);
elements.downloadJava.listeners.click();
const javaBundle = JSON.parse(downloaded.text);
for (const path of ["settings.gradle","build.gradle","gradle.properties","app/build.gradle","app/src/main/AndroidManifest.xml","app/src/main/java/org/example/auroratest/MainActivity.java","app/src/test/java/org/example/auroratest/PackageContractTest.java","README.md"]) {
  assert.ok(javaBundle.files[path], "Missing Java bundle file: " + path);
}
assert.equal(JSON.parse(javaBundle.files["app/build.gradle"]).namespace, undefined); // Gradle is Groovy DSL, not JSON.
assert.match(javaBundle.files["app/build.gradle"], /compileSdk 35/);
assert.match(javaBundle.files["app/build.gradle"], /junit:junit:4\.13\.2/);

for (const [target, required] of [
  ["vite-react", ["package.json","index.html","src/main.tsx","src/App.tsx","src/style.css","vite.config.ts","tsconfig.json"]],
  ["angular", ["package.json","angular.json","src/main.ts","src/app/app.component.ts","src/app/app.component.html","src/styles.css","tsconfig.app.json"]],
  ["react-native", ["package.json","App.tsx","tsconfig.json"]]
]) {
  elements.framework.value = target;
  elements.generateFramework.listeners.click();
  const bundle = JSON.parse(elements.frameworkOutput.value);
  assert.equal(bundle.framework, target);
  for (const path of required) assert.ok(bundle.files[path], target + " missing file: " + path);
  assert.ok(bundle.files["package.json"].length > 10, target + " dependency manifest is empty");
}
console.log("PASS: Java/Gradle bundle and Angular, Vite+React, React Native source bundles");
