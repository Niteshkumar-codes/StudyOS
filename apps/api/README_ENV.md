# Environment Variables Configuration Guide

This guide explains the environment variables required to run the StudyOS API server. Copy the template from `.env.example` into a new file named `.env` in this directory (`apps/api/`) and configure the variables accordingly.

---

## Environment Variables Breakdown

### Server Configuration
* **`PORT`**
  * **Description**: The port on which the Express server will listen locally.
  * **Default**: `5000`
  * **Obtain**: Any free port on your local machine (standard is `5000`).

* **`NODE_ENV`**
  * **Description**: The runtime environment of the application.
  * **Default**: `development`
  * **Values**: `development`, `production`, `test`

* **`CORS_ORIGIN`**
  * **Description**: The client application URL allowed to make cross-origin requests.
  * **Default**: `http://localhost:3000`
  * **Obtain**: The domain or port where your frontend (Vite/Next.js) is running.

### Database Configuration
* **`MONGODB_URI`**
  * **Description**: Connection string URI for your MongoDB database instance.
  * **Default**: `mongodb://127.0.0.1:27017/studyos`
  * **Obtain**:
    * **Local MongoDB**: Install and run MongoDB Community Edition locally (runs on `127.0.0.1:27017` by default).
    * **MongoDB Atlas**: See the Cloud/Atlas section below.

### JWT Configuration
* **`JWT_ACCESS_SECRET`**
  * **Description**: Secret key used to sign and verify short-lived Access JSON Web Tokens.
  * **Obtain**: Generate a secure random string. In terminal, run:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

* **`JWT_REFRESH_SECRET`**
  * **Description**: Secret key used to sign and verify long-lived Refresh JSON Web Tokens.
  * **Obtain**: Generate a separate secure random string using the same command as above.

* **`JWT_ACCESS_EXPIRY`**
  * **Description**: Expiration duration of access tokens.
  * **Default**: `15m` (15 minutes)

* **`JWT_REFRESH_EXPIRY`**
  * **Description**: Expiration duration of refresh tokens.
  * **Default**: `7d` (7 days)

### SMTP / Gmail Configuration
* **`SMTP_HOST`**
  * **Description**: Host address of the SMTP server.
  * **Value for Gmail**: `smtp.gmail.com`

* **`SMTP_PORT`**
  * **Description**: Connection port for the SMTP server.
  * **Value**: Use `587` for TLS or `465` for SSL.

* **`SMTP_USER`**
  * **Description**: Authentication user email address.
  * **Obtain**: Your Gmail address (e.g. `your_account@gmail.com`).

* **`SMTP_PASS`**
  * **Description**: App-specific password for Gmail authentication.
  * **Obtain**: See the Gmail SMTP instructions below.

* **`SMTP_FROM`**
  * **Description**: The display sender header for outgoing emails.
  * **Default**: `StudyOS <no-reply@studyos.com>`

### Google OAuth Configuration
* **`GOOGLE_CLIENT_ID`**
  * **Description**: Client ID for Google OAuth2 Single Sign-On.
  * **Obtain**: Google Cloud Console credentials page.

* **`GOOGLE_CLIENT_SECRET`**
  * **Description**: Client Secret corresponding to the Google OAuth Client ID.
  * **Obtain**: Google Cloud Console credentials page.

* **`GOOGLE_CALLBACK_URL`**
  * **Description**: Callback URL registered in your Google App.
  * **Default**: `http://localhost:5000/api/auth/google/callback`

---

## Configuration Categories

### 1. Minimal Local Development Setup
If you just want to run the project locally and do not need to test email delivery or Google SSO, configure only the database and server parameters. The application will fall back to logging OTP codes and password reset links directly to your console terminal.
* `PORT`
* `NODE_ENV`
* `CORS_ORIGIN`
* `MONGODB_URI`
* `JWT_ACCESS_SECRET`
* `JWT_REFRESH_SECRET`
* `JWT_ACCESS_EXPIRY`
* `JWT_REFRESH_EXPIRY`

### 2. Gmail SMTP Setup
To test sending actual verification emails and password reset links to user inboxes:
1. Enable **2-Step Verification** on your Google account.
2. Go to **Google Account Settings** -> **Security** -> **App passwords** (search "App passwords" in the settings search bar).
3. Generate an app password (select "Other" and name it e.g., `StudyOS`).
4. Copy the generated 16-character password.
5. Populate:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASS=your-16-char-app-password`
   - `SMTP_FROM=StudyOS <no-reply@studyos.com>`

### 3. Google OAuth Setup
To enable "Continue with Google" SSO:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Go to **APIs & Services** -> **OAuth consent screen** and set up the details.
4. Go to **APIs & Services** -> **Credentials** -> **Create Credentials** -> **OAuth client ID**.
5. Select **Web application** as application type.
6. Under **Authorized redirect URIs**, add `http://localhost:5000/api/auth/google/callback`.
7. Click **Create** and copy both the Client ID and Client Secret.
8. Populate:
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`

### 4. MongoDB Atlas Setup
If you want to use MongoDB Cloud Atlas instead of a local MongoDB:
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create or select a cluster.
3. Add your IP to the **Network Access** whitelist.
4. Create a database user in **Database Access**.
5. Click **Connect** on your cluster, select **Drivers**, and copy the connection string.
6. Populate:
   - `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/studyos?retryWrites=true&w=majority` (replace `<username>`, `<password>`, and `<cluster-url>` with your database user credentials and cluster address).
