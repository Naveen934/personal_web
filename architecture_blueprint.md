# Personal Dashboard - Architecture Blueprint

This document outlines the complete high-level and low-level architecture of the Personal Dashboard project. It is intended for study purposes to provide a clear understanding of the project flow, components, and data structures.

---

## 🏗️ 1. High-Level System Architecture

The project follows a standard decoupled **Client-Server Architecture**, using modern web technologies.

### **Frontend (Client Side)**
*   **Framework:** React.js (via Vite)
*   **Styling:** Tailwind CSS + Vanilla CSS (`index.css`)
*   **Routing/State:** React state overrides (no strict router like React Router, uses conditional rendering based on `activeTab` state). Local state management with simple React hooks (`useState`, `useEffect`).
*   **API Client:** Axios for HTTP requests (`api.js`).
*   **Authentication:** Simple `localStorage` based auth (`personal_dashboard_auth`).
*   **Hosting Location:** Designed for deployment on Netlify (`https://naveen-ja.netlify.app`), indicated by `netlify.toml` and CORS setup.

### **Backend (Server Side)**
*   **Framework:** FastAPI (Python)
*   **Database ORM:** SQLAlchemy with AsyncSession (`sqlalchemy.ext.asyncio`).
*   **Database:** PostgreSQL (indicated by UUID dialects and PgBouncer configurations in connection args).
*   **Hosting Location:** Designed for deployment on Vercel (`vercel.json` present).
*   **CORS:** Configured to accept requests from localhost and the Netlify frontend.

### **System Data Flow**
1.  User interacts with the React frontend on Netlify.
2.  React components trigger API calls via `api.js` using Axios.
3.  Axios sends HTTP requests (GET, POST, PUT, DELETE) to the FastAPI backend on Vercel.
4.  FastAPI matches the route (e.g., `/companies`), validates the body using Pydantic schemas, and opens an Async DB session.
5.  SQLAlchemy performs asynchronous queries against the PostgreSQL database.
6.  The result is serialized back to JSON and returned to the React frontend, which updates its state and UI.

---

## 🧩 2. Low-Level Architecture (Code level details)

This section maps out all the major functions and properties within the project.

### **A. Backend Architecture & Functions**

#### **1. Database & Models (`database.py`, `models.py`)**
The database is initialized asynchronously. It connects to the database via the `DATABASE_URL` environment variable.

*   **`Company` Model:** `id` (UUID), `name` (String), `status` (String), `monthly_revenue` (Numeric), `total_invested` (Numeric), `notes` (Text), `created_at` (Timestamp).
*   **`Saving` Model:** `id` (UUID), `category` (String), `subcategory` (String), `quantity` (String), `value` (Numeric), `type` ('asset' or 'liability'), `notes` (Text), `created_at`.
*   **`Economy` Model:** `id` (UUID), `bank_name` (String), `account_type` (String), `balance` (Numeric), `notes` (Text), `created_at`.
*   **`Document` Model:** `id` (UUID), `document_name` (String), `number` (String), `drive_link` (Text), `created_at`.

#### **2. Main Application (`main.py`)**
Entry point of the FastAPI backend.
*   **Functions:**
    *   `root()`: Maps to `GET /`. Returns `{"message": "Personal Dashboard API is running", "version": "1.0.0"}`.
    *   `health()`: Maps to `GET /health`. Returns `{"status": "ok"}`.

#### **3. API Routes (`routes/`)**
Controllers containing the business logic and database interactions.

**`companies.py` (Prefix: `/companies`)**
*   **`list_companies(db)`**: 
    *   *Input:* DB Session.
    *   *Operation:* Queries all standard companies ordered by creation date descending.
    *   *Returns:* List of serialized `Company` objects.
*   **`get_company(company_id, db)`**: 
    *   *Input:* `company_id` (UUID string), DB Session.
    *   *Operation:* Queries a specific company by ID.
    *   *Returns:* Serialized `Company` object or 404 Error.
*   **`create_company(data, db)`**: 
    *   *Input:* `CompanyCreate` schema (name, status, monthly_revenue, total_invested, notes).
    *   *Operation:* Creates a new company record in the DB.
    *   *Returns:* Serialized `Company` object with assigned UUID.
*   **`delete_company(company_id, db)`**: 
    *   *Input:* `company_id` (UUID string).
    *   *Operation:* Deletes specific company.
    *   *Returns:* 204 No Content.

**`savings.py` (Prefix: `/savings`)**
*   **`list_savings(db)`**: 
    *   *Returns:* List of serialized `Saving` objects.
*   **`create_saving(data, db)`**: 
    *   *Input:* `SavingCreate` schema (category, subcategory, quantity, value, type, notes).
    *   *Returns:* Serialized newly created `Saving` object.
*   **`delete_saving(saving_id, db)`**: 
    *   *Input:* UUID string. Deletes the saving record.

**`economy.py` (Prefix: `/economy`)**
*   **`list_economy(db)`**: 
    *   *Returns:* List of serialized `Economy` objects representing bank accounts.
*   **`create_economy(data, db)`**: 
    *   *Input:* `EconomyCreate` schema (bank_name, account_type, balance, notes).
    *   *Returns:* Serialized `Economy` object.
*   **`delete_economy(entry_id, db)`**: 
    *   *Input:* UUID string. Deletes the economy record.

**`documents.py` (Prefix: `/documents`)**
*   **`list_documents(db)`**: 
    *   *Returns:* List of serialized `Document` objects ordered by creation sequentially.
*   **`create_document(data, db)`**: 
    *   *Input:* `DocumentCreate` schema (document_name, number, drive_link).
    *   *Returns:* Serialized `Document` object.
*   **`update_document(doc_id, data, db)`**: 
    *   *Input:* UUID string, `DocumentUpdate` schema (partial updates allowed).
    *   *Operation:* Updates existing properties of a document object.
    *   *Returns:* Serialized updated `Document` object.
*   **`delete_document(doc_id, db)`**: 
    *   *Input:* UUID string. Deletes the document record.

---

### **B. Frontend Architecture & Functions**

#### **1. Application Core**
*   **`App.jsx`**: The root component.
    *   *State:* `isAuthenticated` (Boolean), `activeTab` (String).
    *   *Functions:* 
        *   `handleLogin()`: Sets auth locally.
        *   `handleLogout()`: Removes auth from local storage.
        *   `renderTab()`: Switch conditional that renders `<CompaniesTab />`, `<SavingsTab />`, `<EconomyTab />`, or `<DocumentsTab />` depending on `activeTab`.
    *   *Flow:* Wraps the active tab in `Layout.jsx` passing navigational controls.
*   **`api.js`**: Reusable Axios HTTP client.
    *   *Properties:* Pre-configured with base URL from `VITE_API_URL` or fallback localhost.
    *   *Functions:* Exported wrappers for backend endpoints (e.g., `getCompanies()`, `createDocument(data)`, `deleteSaving(id)`).

#### **2. UI Components (`src/components/`)**
*   **`Layout.jsx`**: The shell of the application featuring the sidebar/navigation header. Takes props `activeTab`, `onTabChange`, and `onLogout`.
*   **`Login.jsx`**: Simple UI prompting login action. Updates `App.jsx` state.
*   **`CompaniesTab.jsx`**: 
    *   *State:* Holds list of companies fetched from backend. Manages modal visibility for additions.
    *   *Functions:* Maps over company data and renders summary cards. Has functions like `fetchCompanies`, `handleDelete`, `handleSubmit` using the `api.js` bindings.
*   **`SavingsTab.jsx`**: 
    *   *State:* Tracks list of assets and liabilities.
    *   *Functions:* Renders comparative data between what the user owns (assets) versus what they owe (liabilities) through dynamic list mapping. Allows creation and deletion of records.
*   **`EconomyTab.jsx`**: 
    *   *State:* Tracks active banking and investment accounts. 
    *   *Functions:* Computes visual representations of balances, allows user to register a new `bank_name` and `balance` via form interactions.
*   **`DocumentsTab.jsx`**: 
    *   *State:* Stores document entities.
    *   *Functions:* Lists important document IDs/links. Includes an update mechanism binding to `updateDocument` in API client to handle edits inline or via modal.

---
*Created automatically to map the holistic architecture of the web application spanning Python FastAPI and React.*
