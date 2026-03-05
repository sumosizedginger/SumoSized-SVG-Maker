# Security Policy

## Supported Versions

The SumoSized SVG Generator ecosystem currently formally supports the latest release branch to preserve mathematically deterministic rendering safety.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

Because the engine evaluates mathematical matrices entirely on the client without database synchronization or server endpoints, traditional RCE and DB vulnerabilities are fundamentally non-existent by architecture. 

However, if you uncover any memory-leak vectors, SSR hydration attacks natively rooted in the standalone NPM Engine package, or SvelteKit route misconfigurations, please DO NOT report them directly via public GitHub issues.

Please email the core maintainer team securely at **security@sumosized.com** with standard reproduction steps. Include the `.json` preset tree or exact `params` dictionary string used to trigger the vector collision. We aim to triage reports within 48 hours for CVSS tracking.
