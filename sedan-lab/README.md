# Sedan Lab · anatomia auta

Oddzielny model edukacyjny fikcyjnego sedana benzynowego. Otwórz `../sedan-lab-anatomia.html` w Safari lub innej przeglądarce z WebGL. Plik zawiera wszystkie skrypty i oświetlenie HDR; nie wymaga internetu ani serwera.

## Zakres

- **214 wybieranych elementów**, każdy z własną geometrią, opisem funkcji i powiązaniami.
- **100 pozycji z mechanizmem**, w tym niezależne zawiasy i przesuwy oraz pozycje współdzielące ruch jednego układu. Np. wszystkie tłoki, wałki i zawory współdzielą cykl silnika, a kierownica i zwrotnice — sterowanie skrętem.
- Każdą z 214 części można odsunąć; zespoły można izolować, przybliżać i rozsuwać globalnie.
- Cztery osobne drzwi, cztery opuszczane szyby, składane lusterka, wycieraczki, klapka i korek paliwa, pokrywy, schowek, fotele, zagłówki, tylne oparcia i podłoga bagażnika.
- Zależności gaz–przepustnica, hamulec–klocki–światła STOP, sprzęgło–tarcza, kierownica–przekładnia–drążki–zwrotnice i geometria skrętu Ackermanna.
- Przekrój R4 DOHC 16V z wałem, czterema tłokami i korbowodami, dwoma wałkami i 16 osobnymi zaworami. Cykl 0–720° można odtwarzać i zatrzymywać. Kinematyka tłoka uwzględnia stałą długość korbowodu; skok wynosi 90 mm, przyjęta średnica cylindra 84 mm odpowiada ok. 1,995 l.
- Powtarzalne losowanie wyglądu według numeru projektu: lakier, dach, kratka i detale felg. Wspólna architektura mechaniczna pozwala porównywać warianty.
- Wyszukiwanie, filtr układów i mechanizmów, zapisywane notatki i eksport TXT.

## Przyjęta architektura

Wolnossący, poprzeczny benzynowy R4 2.0 MPI, DOHC 16V, pasek rozrządu, manualna skrzynia, napęd przedni i mechanizm różnicowy z przodu. Zawieszenie: MacPherson z przodu, wielowahaczowe z tyłu. Hamulce tarczowe na czterech kołach.

To przykład techniczny, nie dokumentacja realnej marki. Geometria, fazy zaworów, popychacze, przewody, mocowania i zakresy ruchu są uproszczone. Odsuwanie elementów jest widokiem dydaktycznym, nie procedurą naprawy. Nie ma symulacji ciśnień, spalania, temperatur, sił, emisji ani skuteczności hamowania. Pojazd stoi w miejscu.

Lewa i prawa strona są określone z miejsca kierowcy. Pozycje katalogu mogą stanowić zespoły, np. dwa klocki przy jednym kole, piasta z łożyskiem albo zawór ze sprężyną. Licznik nie jest liczbą wszystkich fizycznych detali produkcyjnych.

## Pliki

`dist/catalog.js`: katalog i znaczenie części. `dist/model.js`: rejestr geometrii, hierarchia, kinematyka i losowanie. `dist/app.js`: UI, wybieranie, kamera, widoki i zapis. `dist/studio.js`: oświetlenie i tło. Zmiany nie modyfikują wcześniejszych plików Mégane.

Zapis używa osobnego klucza localStorage (`sedan-lab-notes-v1`). Czyszczenie danych przeglądarki może usunąć notatki. Losowanie wyglądu zachowuje notatki o tych samych częściach.

Odtworzenie HTML: `python3 build_offline.py`. Sprawdzenie modelu i kinematyki: `node check-model.cjs`.

## Użyte komponenty

- [Poly Haven · Studio Small 08](https://polyhaven.com/a/studio_small_08), CC0, HDR osadzony w pliku.
- Three.js, RGBELoader i RoundedBoxGeometry r160.1, MIT; licencja dołączona do HTML.

## Licencja i publikacja

MIT — Copyright (c) 2026 FractalBoy9X. Zależności zachowują MIT (Three.js i dodatki) oraz CC0 (HDRI). Zobacz [LICENSE](../LICENSE), [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) i [instrukcję GitHub Desktop](../instrukcja-github.html).
