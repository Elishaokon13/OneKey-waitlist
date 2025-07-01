# 🛠️ MVP Engineering Plan – One-Time KYC (API-First)

> 🚀 Goal: Ship an API-first MVP in 10 days with decentralized storage (Filecoin/Arweave), EAS attestations, and Lit Protocol-based access control. No centralized database.

---

## ✅ MVP Assumptions

- **Authentication**: Privy (primary) or Passkey (WebAuthn fallback)
- **KYC Storage**: Filecoin or Arweave (encrypted client-side)
- **Attestations**: Ethereum Attestation Service (EAS)
- **Access Control**: Lit Protocol
- **No DB**: All persistent state lives in EAS, Lit, Filecoin

---

## 🧱 Codebase Structure

```
Onekey api/
├── api/                      # REST API (Node.js / TypeScript)
│   ├── routes/
│   ├── controllers/
│   ├── services/             # EAS, Lit, Encryption logic
│   ├── utils/
│   └── index.ts
├── storage/                  # Filecoin/Arweave handlers
├── auth/                     # Privy/Passkey logic
├── frontend/                 # React-based UI
├── scripts/                  # CLI & test scripts
└── .env / README.md
```

---

## 👥 Team Roles & Responsibilities

<details><summary><strong>DefiDevrel — API Lead</strong></summary>

- [ ] Set up REST API boilerplate (Express + TypeScript)
- [ ] `POST /initiate-kyc`
- [ ] `GET /kyc-payload/:cid`
- [ ] `POST /create-attestation`
- [ ] `POST /verify-attestation`
- [ ] Integrate response formatting and error handling

</details>

<details><summary><strong>Seyi — Encryption + Storage</strong></summary>

- [ ] AES-256-GCM encryption of KYC metadata
- [ ] Encrypt AES key with user's public key (Privy/Passkey)
- [ ] Upload encrypted blob to Filecoin/Arweave
- [ ] Generate `data_hash` for EAS attestation
- [ ] Return CID + encryptedKey

</details>

<details><summary><strong>Israel — EAS + Lit Protocol</strong></summary>

- [ ] Define attestation schema (`kyc_passed`, `country`, `data_hash`)
- [ ] Create EAS attestations via SDK
- [ ] Integrate Lit Protocol to define access rules
- [ ] `POST /request-access` logic and signature handling

</details>

<details><summary><strong>Bright — Auth + DevOps + QA</strong></summary>

- [ ] Integrate Privy or Passkey auth
- [ ] Generate user wallet + handle JWT sessions
- [ ] Dockerize API + deploy to Railway/Fly.io
- [ ] Write CLI and Postman scripts
- [ ] Set up logging and basic monitoring

</details>

<details><summary><strong>Dayo + Defidevrel — Frontend (React)</strong></summary>

- [ ] Upload KYC form (doc, selfie)
- [ ] View KYC status + attestation
- [ ] Share KYC with Platform B
- [ ] Handle approval signature UI
- [ ] Style with Tailwind or Shadcn

</details>

---

## 🗓️ 10-Day Execution Timeline

| Days | API (Dev 1)         | Storage (Dev 2)       | EAS + Lit (Dev 3)         | Auth + Infra (Dev 4)       | UI Team              |
|------|----------------------|------------------------|----------------------------|-----------------------------|-----------------------|
| 1–2  | API setup            | Encrypt + Upload       | EAS test script            | Auth SDK setup              | UX Wireframes         |
| 3–4  | /initiate-kyc        | Filecoin upload        | create-attestation         | WebAuthn fallback           | Upload Form           |
| 5–6  | /kyc-payload         | Finalize hash          | Lit access rules           | Docker deploy               | Attestation View      |
| 7–8  | /verify-attestation  | Assist API             | Grant access flow          | CLI test + QA               | Share flow            |
| 9    | Test API             | Integration            | Final EAS + Lit            | Postman scripts             | Polish                |
| 10   | Finalize             | Finalize               | Finalize                   | Deploy staging              | Deploy UI             |

---

## ✅ Final Deliverables

- [ ] REST API (no database)
- [ ] Filecoin-encrypted storage with AES + CID hash
- [ ] EAS attestations (`kyc_passed`, `country`, `data_hash`)
- [ ] Lit Protocol-based access flow
- [ ] React UI: Upload → Attest → Share
- [ ] Postman collection and CLI scripts
- [ ] Staging deployment
