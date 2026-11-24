# pruva-smoke-target

A deliberately tiny file server used as the Pruva platform smoke target. It is
small so every Pruva stage (Repro, Variant, Verified Defense, Coding) finishes
quickly while still running on real infrastructure end to end.

```
node server.js            # listens on 127.0.0.1:8080 (PORT to override)
curl 'http://127.0.0.1:8080/files?name=report.txt'
npm test
```

Do not deploy this application; it intentionally contains a vulnerability.
