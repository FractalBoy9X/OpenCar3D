# OpenCar3D · Sedan Lab

Interaktywny atlas części fikcyjnego sedana benzynowego w WebGL. Samochód pozostaje nieruchomy; można obracać kamerę, wybierać części i uruchamiać ich mechanizmy.

**[Instrukcja krok po kroku: GitHub Desktop](instrukcja-github.html)** · **[Licencja MIT](LICENSE)** · **[Komponenty i licencje](THIRD_PARTY_NOTICES.md)**

## Uruchomienie

1. Pobierz repozytorium przez **Code → Download ZIP** lub sklonuj je w GitHub Desktop.
2. Rozpakuj ZIP, jeśli z niego korzystasz.
3. Otwórz **`sedan-lab-anatomia.html`** w Safari, Firefox lub Chrome z WebGL. Podgląd kodu pliku na github.com nie uruchamia aplikacji.

Gotowy HTML zawiera kod, biblioteki i HDR. Nie wymaga instalowania pakietów, serwera ani internetu. Notatki są zapisywane lokalnie w przeglądarce; nie trafiają do repozytorium.

## Co można odkrywać

- 214 wybieranych części z opisami funkcji, wskazówkami i powiązaniami.
- 100 pozycji katalogu z mechanizmem: niezależne zawiasy/przesuwy oraz części współdzielące ruch jednego układu.
- Każdą część można odsunąć; zespoły można izolować i oglądać z bliska.
- Benzynowy R4 2.0 MPI DOHC 16V: 4 tłoki i korbowody, wał korbowy, 2 wałki rozrządu, 16 zaworów, cykl czterosuwowy 0–720°.
- Osobne drzwi i szyby, fotele, zagłówki, lusterka, schowek, wycieraczki, pokrywy i korki.
- Powiązania kierownicy z układem kierowniczym, gazu z przepustnicą, hamulca z klockami i światłami STOP oraz sprzęgła z tarczą.
- Losowane warianty wyglądu z powtarzalnym numerem projektu, wyszukiwanie, filtry i eksport notatek.

To model edukacyjny z proceduralną, uproszczoną geometrią. Nie odwzorowuje konkretnej marki, nie stanowi dokumentacji serwisowej i nie symuluje obciążeń ani spalania.

## Edytowanie i sprawdzanie

Źródła znajdują się w `sedan-lab/dist/`. Python 3 jest potrzebny tylko do ponownego złożenia pojedynczego HTML; Node.js — do sprawdzenia geometrii i kinematyki. Bez zależności npm.

```sh
python3 sedan-lab/build_offline.py
node sedan-lab/check-model.cjs
```

Po zmianie źródeł wygeneruj HTML ponownie i dodaj do commitu zarówno źródła, jak i wynik. Nie edytuj niezależnie obu wersji. Szczegóły architektury: [sedan-lab/README.md](sedan-lab/README.md).

## Licencje

Kod projektu i proceduralny model: **MIT**, Copyright (c) 2026 FractalBoy9X. Three.js 0.160.1, RGBELoader i RoundedBoxGeometry: **MIT**, z zachowaną licencją autorów. Mapa HDR Studio Small 08 autorstwa Sergeja Majborody / Poly Haven: **CC0 1.0**. Pełne teksty i pochodzenie: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Licencje są także osadzone w gotowym HTML.
