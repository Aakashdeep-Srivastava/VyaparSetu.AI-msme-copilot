# Requirements: VyaparSetu AI

## Product Overview

**VyaparSetu AI** is an AI-powered Commerce Intelligence Copilot for Indian MSMEs that enhances decision-making, efficiency, and user experience across retail, commerce, and marketplace ecosystems. Built on AWS, it solves three critical problems: intelligent product cataloging, smart marketplace matching, and real-time market intelligence — enabling India's 6.3 crore MSMEs to compete in digital commerce.

---

## Problem Statement

Build an AI-powered solution that enhances decision-making, efficiency, or user experience across retail, commerce, and marketplace ecosystems.

### Context

India's MSMEs contribute 30% of GDP and 45% of manufacturing output, yet fewer than 10% have a meaningful digital commerce presence. The TEAM (Technology for MSMEs: AI-Led E-Commerce Acceleration and Marketplace) Scheme under the Ministry of Commerce aims to onboard 5 lakh MSEs onto digital commerce platforms by FY 2026-27, with INR 277.35 Crore allocated. However, the current process faces critical bottlenecks:

- **Manual catalog creation**: 2-4 hours per product, inconsistent categorization, no standardization
- **Marketplace selection is guesswork**: 50+ e-commerce platforms in India, MSMEs lack data to choose
- **Market intelligence is inaccessible**: Pricing, demand, and competitive tools are enterprise-only
- **Language barrier**: 85% of MSMEs operate in non-English languages

---

## Functional Requirements

### FR-1: Intelligent Product Cataloging (CatalogAI)

**Description**: Transform raw, multilingual product descriptions into structured, marketplace-ready catalog entries with standardized categories, attributes, and HSN codes.

**User Stories**:

- **FR-1.1**: As an MSME owner, I want to describe my product in Hindi or English (voice or text) and get an auto-generated, structured product listing so I don't need to manually fill complex forms.
- **FR-1.2**: As an MSME owner, I want the system to show me the top 3 predicted product categories with confidence scores so I can confirm or correct the classification.
- **FR-1.3**: As an MSME owner, I want the system to extract product attributes (size, color, material, weight) automatically from my description so my listing is complete.
- **FR-1.4**: As a platform operator, I want products classified with >95% Top-1 accuracy and >99% Top-3 accuracy so catalog quality is maintained at scale.
- **FR-1.5**: As a platform operator, I want low-confidence classifications (below 0.60) automatically routed to human reviewers so quality is never compromised.

**Acceptance Criteria**:
- Product descriptions in Hindi and English are accepted via text input
- Classification returns Top-3 categories with softmax confidence scores
- Confidence band routing: GREEN (≥0.85 auto-assign), YELLOW (0.60-0.85 review), RED (<0.60 manual)
- End-to-end classification latency < 500ms p95
- HSN code auto-tagged for each classified product

### FR-2: Smart Marketplace Matching (MatchMaker)

**Description**: Multi-factor scoring engine that recommends the best-fit e-commerce platforms/marketplace channels for each MSME.

**User Stories**:

- **FR-2.1**: As an MSME owner, I want to see the top 3 marketplace recommendations for my products with clear explanations of why each was chosen.
- **FR-2.2**: As an MSME owner, I want the matching to consider my location, product type, business size, and whether I sell B2B or B2C so recommendations are truly relevant.
- **FR-2.3**: As a platform operator, I want the matching algorithm to achieve NDCG@3 > 0.80 so ranking quality is measurably better than rule-based approaches.
- **FR-2.4**: As a platform operator, I want historical success rates factored into matching so MSMEs are directed to platforms where similar businesses have succeeded.

**Acceptance Criteria**:
- Composite scoring formula: M = 0.35×D + 0.20×G + 0.15×C + 0.20×H + 0.10×S
  - D: Domain similarity (cosine similarity of product and platform embeddings)
  - G: Geography (delivery reach, regional demand, Tier 2/3 penetration)
  - C: Capacity (platform seller load vs. capacity)
  - H: History (success rate with similar MSMEs)
  - S: Specialization (B2B/B2C archetype match)
- Returns Top-3 ranked platforms with per-factor score breakdown
- Cold start handling for new MSMEs (content-based with boosted domain weight)
- Vernacular explanation of each recommendation
- Matching latency < 500ms p95

### FR-3: Market Intelligence & Demand Forecasting (PriceWise)

**Description**: Real-time pricing intelligence, demand trend analysis, and competitive positioning insights.

**User Stories**:

- **FR-3.1**: As an MSME owner, I want to see how my product pricing compares to the category median so I can price competitively.
- **FR-3.2**: As an MSME owner, I want demand trend forecasts for my product category so I can plan inventory and production.
- **FR-3.3**: As an MSME owner, I want all market insights presented in my preferred language (Hindi/English) so I can understand and act on them.
- **FR-3.4**: As a platform operator, I want aggregated market intelligence dashboards showing category trends, pricing distributions, and regional demand patterns.

**Acceptance Criteria**:
- Pricing benchmark against category median displayed per product
- Time-series demand forecast generated via Amazon Forecast
- LLM-generated plain-language insights in Hindi and English via Amazon Bedrock
- Admin dashboard with aggregate analytics (QuickSight)

### FR-4: Admin Dashboard & Audit

**Description**: Operator-facing dashboard for monitoring, review, and override.

**User Stories**:

- **FR-4.1**: As an admin, I want to see all classifications and matches with confidence bands so I can prioritize reviews.
- **FR-4.2**: As an admin, I want to override any AI decision with logged justification so human judgment always has final authority.
- **FR-4.3**: As an admin, I want a baseline vs. AI comparison view showing accuracy, NDCG@3, and other metrics so I can demonstrate system value.

**Acceptance Criteria**:
- Dashboard shows GREEN/YELLOW/RED band distribution
- Override capability with mandatory reason field
- Every decision logged with timestamp, input hash, confidence, and rationale
- Baseline vs. AI comparison charts

---

## Non-Functional Requirements

### NFR-1: Performance
- Classification latency: < 500ms p95
- Matching latency: < 500ms p95
- API response time: < 1 second p95
- System availability: 99.5% uptime SLA

### NFR-2: Scalability
- Handle 5K concurrent MSME sessions (pilot phase)
- Scale to 50K+ MSMEs without architecture changes
- Serverless architecture (Lambda + Fargate) auto-scales with demand

### NFR-3: Security & Compliance
- All data stored within AWS Mumbai region (ap-south-1)
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Amazon Cognito for authentication with role-based access control
- Immutable audit logs in CloudWatch Logs
- DPDP Act 2023 compliant data handling

### NFR-4: Responsible AI
- Gender fairness: match quality gap < 5% for women-led MSMEs
- Geographic fairness: comparable quality across Tier 1/2/3 cities
- Category fairness: accuracy variance < 10% across product domains
- Human override available at every decision point
- Per-recommendation explainability in vernacular language

### NFR-5: Multilingual Support
- MVP: Hindi + English
- Full deployment: 11+ Indian languages
- Voice input support via Amazon Transcribe
- Output in MSME's preferred language

---

## Data Requirements

### Training Data
- **Source**: AIKosh (government datasets), public e-commerce catalogs, Kaggle product datasets
- **Volume**: 50K+ labeled product-category pairs across 15+ retail domains
- **Matching**: 5K simulated MSME profiles × 50 marketplace profiles
- **Split**: Stratified 80/10/10 (train/validation/test)
- **Imbalance handling**: SMOTE oversampling + class-weighted loss

### Evaluation Metrics
| Module | Metric | Target |
|--------|--------|--------|
| CatalogAI | Top-1 Accuracy | >95% |
| CatalogAI | Top-3 Accuracy | >99% |
| CatalogAI | Macro F1 | >90% |
| MatchMaker | NDCG@3 | >0.80 |
| MatchMaker | MRR | >0.75 |
| MatchMaker | First-Match Acceptance | >60% |

---

## Technical Constraints

- Must be built on AWS services (hackathon requirement)
- Amazon Bedrock for LLM reasoning (Claude)
- Amazon SageMaker for custom ML model training and inference
- Serverless-first architecture for cost efficiency
- React frontend hosted on AWS Amplify
- PostgreSQL on Amazon RDS for primary data store
