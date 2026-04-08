# Reservation System

Semestrální projekt pro předměty TDD a DevOps. Projekt řeší rezervace sdílených resource, konkrétně zasedacích místností a sportovních kurtů.

## Popis domény a funkcí

Aplikace pracuje se třemi hlavními entitami:

- `User`
- `Resource`
- `Reservation`

Uživatel si může vytvořit rezervaci na konkrétní resource v daném čase. Hlavní smysl projektu ale není jen uložení záznamu do databáze. Důležité je, že backend kontroluje obchodní pravidla rezervací.

Implementovaná pravidla:

1. rezervace nesmí začínat v minulosti
2. `endAt` musí být později než `startAt`
3. stejná resource nesmí mít překrývající se rezervace
4. jeden uživatel může mít maximálně 3 aktivní rezervace
5. rezervace musí být v rámci pracovních hodin resource
6. opakovaný request se stejným `idempotencyKey` nesmí vytvořit duplicitu

Hlavní business logika je implementovaná v souboru `src/application/services/reservationService.js`.

## Návod ke spuštění

Projekt lze spustit několika způsoby.

### 1. Spuštění přes Docker

Nejjednodušší varianta je:

```bash
npm run docker:demo
```

Tento příkaz:

- sestaví Docker image
- spustí PostgreSQL a backend
- aplikuje Prisma schema
- vytvoří demo data
- otevře aplikaci v prohlížeči

Aplikace bude dostupná na adrese:

- `http://127.0.0.1:3001`

Pokud je potřeba spustit kontejnery ručně:

```bash
docker compose up -d --build
```

Zastavení kontejnerů:

```bash
docker compose down
```

### 2. Spuštění testů

```bash
npm test
```

Coverage report:

```bash
npm run test:coverage
```

## Architektura systému

Projekt je rozdělený do několika jednoduchých vrstev:

- `src/app.js` - HTTP routes a mapování chyb na status kódy
- `src/server.js` - start aplikace
- `src/application/services` - business logika
- `src/application/repositories` - kontrakty repository vrstvy
- `src/infrastructure/repositories` - Prisma implementace repository vrstvy
- `prisma/schema.prisma` - datový model databáze
- `frontend/` - React frontend pro ukázku funkcí
- `k8s/` - Kubernetes manifests

Service vrstva je hlavní část projektu. Právě tam se rozhoduje, zda rezervace projde nebo bude zamítnuta.

## Strategie testování

Vývoj business logiky probíhal hlavně stylem TDD.

V projektu jsou:

- 8 unit testů
- 5 integration testů

Testovací soubory:

- `tests/unit/reservationService.test.js`
- `tests/unit/reservationService.clock.test.js`
- `tests/integration/reservationApi.test.js`

Unit testy ověřují hlavně jednotlivá business pravidla v `ReservationService`.
Integration testy ověřují chování HTTP API, tedy route, validaci requestu a správné status kódy odpovědí.

## Pokrytí kódu

Celkové coverage projektu není vysoké, protože nejsou zvlášť testované všechny bootstrapping a infrastructure soubory.

Důležitější je ale business logika:

- `ReservationService` má přibližně 91 % statements coverage
- `ReservationService` má přibližně 94 % branch coverage

To je pro tento projekt podstatnější než vysoké globální číslo, protože právě service vrstva obsahuje nejdůležitější rozhodovací logiku.

## API

Hlavní endpointy:

- `GET /health`
- `GET /users`
- `GET /resources`
- `GET /reservations`
- `POST /reservations`
- `DELETE /reservations/:id`

API vrací:

- `201` při úspěšném vytvoření rezervace
- `400` při neplatném payloadu
- `409` při porušení business pravidel

## CI a Kubernetes

GitHub Actions workflow je v `.github/workflows/ci.yml`.
Pipeline provádí instalaci závislostí, generování Prisma klienta, spuštění testů a build Docker image.

Ve složce `k8s/` jsou připravené manifests pro:

- app
- postgres
- configmap
- secret
- namespace

## Frontend

Frontend slouží hlavně pro ukázku práce aplikace. Umožňuje načíst uživatele a resource, vytvořit rezervaci, zobrazit seznam rezervací a rezervaci smazat. Chybové zprávy z backendu se zobrazují přímo v UI.