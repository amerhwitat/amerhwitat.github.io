# Java Application Hub

This is the first verified Java GUI packaging target in the wider multi-repository Java migration. It is an inventory and navigation app, not a claim that every project listed below has been ported to Java.

## Build locally

Requires JDK 17+ and Maven 3.9+:

```sh
mvn -B -f apps/java-app-hub/java/pom.xml clean package
java -jar apps/java-app-hub/java/target/java-application-hub-1.0.0.jar
```

## Windows GUI package

The Java Application Hub CI workflow builds a self-contained Windows app-image with jpackage. The downloadable ZIP contains JavaApplicationHub.exe plus its private runtime, so a separate Java installation is not required on the target PC.

Open the workflow run's JavaApplicationHub-Windows-x64 artifact and verify SHA256SUMS.txt before use.

## Full conversion status

The catalog at apps.json is an inventory, not a parity assertion. Port each candidate individually, keep the original implementation until feature parity and error-handling tests pass, and record source links, dependencies, tests, and build evidence. Native kernel, bootloader, driver, assembly, hardware, and architecture-specific code should remain native where Java is not a suitable implementation.
