[ ![Codeship Status for dorightdigital/amp-validator](https://codeship.com/projects/872f9fe0-6bc2-0133-b63d-0e105eb8924a/status?branch=master)](https://codeship.com/projects/115332)

AMP Validator
===

A command line tool for validating AMP HTML pages.

Usage
---

```
npm install -g amp-validator
amp-validator https://www.theguardian.com/sport/2015/nov/10/russia-iaaf-facing-suspension-wada-doping-report/amp
amp-validator myProject/localExample.html
amp-validator a.html b.html c.html || echo 'One of those failed'
```

To output as JSON use `-o json`
For no colors use `-o colorless-text`

Supports multiple URLs, supports local files.

Requirements
---

 - Node 4.2.1 - this is precisely the version needed at the moment (you can use `nvm install 4.2.1 && nvm use 4.2.1` if you have nvm installed)
 - `node-gyp` must be installed
