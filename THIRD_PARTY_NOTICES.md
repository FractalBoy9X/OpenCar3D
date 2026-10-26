# OpenCar3D — komponenty zewnętrzne

Sprawdzono 27 października 2026. Kod i proceduralny model Sedan Lab są udostępnione na MIT, zgodnie z [LICENSE](LICENSE). Wbudowane komponenty zachowują poniższe licencje. Publikacja nie zmienia autorstwa ani licencji materiałów zewnętrznych.

| Komponent | Wersja / autor | Licencja | Pliki |
| --- | --- | --- | --- |
| Three.js | npm `three@0.160.1`, three.js authors | MIT | `sedan-lab/dist/vendor/three.min.js` |
| RGBELoader | Three.js 0.160.1, three.js authors | MIT | `RGBELoader.source.js`, `RGBELoader.js` w katalogu vendor |
| RoundedBoxGeometry | Three.js 0.160.1, three.js authors | MIT | `RoundedBoxGeometry.source.js`, `RoundedBoxGeometry.js` w katalogu vendor |
| Studio Small 08 HDRI, wariant HDR 1K | Sergej Majboroda / Poly Haven | CC0 1.0 Universal | `studio_small_08_1k.hdr` i jego kodowanie w `hdr-data.js` |

Pełna licencja Three.js: [THREE-LICENSE.txt](sedan-lab/dist/vendor/THREE-LICENSE.txt). Pełny tekst CC0: [CC0-1.0.txt](sedan-lab/dist/vendor/CC0-1.0.txt). Licencje i ten wykaz są też osadzone w komentarzu wygenerowanego `sedan-lab-anatomia.html`.

## Źródła i zakres zmian

- [Pakiet Three.js 0.160.1](https://www.npmjs.com/package/three/v/0.160.1), [licencja upstream](https://github.com/mrdoob/three.js/blob/r160/LICENSE).
- [RGBELoader upstream](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/RGBELoader.js).
- [RoundedBoxGeometry upstream](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/geometries/RoundedBoxGeometry.js).
- Pliki `*.source.js` zachowują oryginały z pakietu. W wersjach używanych w aplikacji zmieniono import/eksport ES Modules na osłonę IIFE korzystającą z globalnego `THREE`; pozwala to uruchamiać pojedynczy HTML z dysku. Bez zmiany algorytmów dodatków.
- [Studio Small 08 — strona zasobu i autor](https://polyhaven.com/a/studio_small_08), [polityka licencyjna Poly Haven](https://polyhaven.com/license), [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Sam HDR pozostaje CC0; nie jest przedstawiany jako autorski utwór projektu na MIT.
- Model auta, geometria części, katalog, animacje i interfejs powstają w kodzie projektu. Nie dołączono modelu konkretnego producenta ani jego znaków towarowych.
- Nie dołączono zewnętrznych fontów, fotografii referencyjnych ani treści stron Bosch/NGK. Odnośniki do ich materiałów służą dalszej nauce. Interfejs korzysta z fontów dostępnych w systemie.

## Weryfikacja pochodzenia

Porównanie bajt po bajcie lokalnych plików z opublikowanymi plikami pakietu `three@0.160.1` i HDR pobranym z Poly Haven zakończyło się zgodnością. SHA-256:

```text
three.min.js                   170c6789f43217c96b3170f4b42fafe135de7f7cd48497a4218f9757ee1d49fa
RGBELoader.source.js           f0e87d0008d9484d31358b32befd1bf80e4301f77573cc9a7cf7d871cc3f64b4
RoundedBoxGeometry.source.js   d20aeaf7077c459a8d952d215738d7b44fba028440bb862d84b622a34f0c80bb
studio_small_08_1k.hdr         f6a989f89432eb4eee3191364a9c1ceed195c4ec3544173a3c04fd96cb91d0ba
```

Three.js i dodatki są oprogramowaniem open source na MIT. HDR jest otwartym zasobem CC0, a nie biblioteką oprogramowania. Oba rodzaje licencji pozwalają na redystrybucję w tym projekcie, również do zastosowań komercyjnych; należy zachować wymagane informacje MIT.
