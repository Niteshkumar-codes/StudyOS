# REST API Endpoints Specification
## StudyOS: Your Complete Preparation Operating System

This document outlines the API contracts for frontend-backend communication, including payload schemas, return structures, and status codes.

---

## 1. Authentication & Session APIs

### POST /api/auth/register
- **Description:** Register a new user account.
- **Authorization:** None (Public)
- **Request Body:**
  ```json
  {
    "name": "Aarav Mehta",
    "email": "aarav@studyos.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "success": true,
    "message": "Registration successful. Please verify OTP.",
    "tempToken": "eyJhbGciOi..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (Validation failure / Password too weak)
  - `409 Conflict` (Email already registered)

### POST /api/auth/verify-otp
- **Description:** Verify the email OTP to complete registration.
- **Authorization:** Temporary Token (Bearer)
- **Request Body:**
  ```json
  {
    "otp": "482910"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "603f...",
      "name": "Aarav Mehta",
      "email": "aarav@studyos.com"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (Invalid or expired OTP)
  - `401 Unauthorized` (Invalid temp token)

### POST /api/auth/login
- **Description:** Authenticate users with email & password.
- **Authorization:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "aarav@studyos.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response:** `200 OK`
  - *Cookie:* Sets HTTP-only `refreshToken`.
  - *Body:*
    ```json
    {
      "success": true,
      "accessToken": "eyJhbGciOi..."
    }
    ```
- **Error Responses:**
  - `401 Unauthorized` (Incorrect email or password)

### POST /api/auth/refresh
- **Description:** Rotate JWT access tokens using the refresh cookie.
- **Authorization:** HTTP-only Refresh Token Cookie
- **Request Body:** None
- **Success Response:** `200 OK`
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi..."
  }
  ```
- **Error Responses:**
  - `403 Forbidden` (Refresh token expired or blacklisted)

---

## 2. Exam & Syllabus APIs

### GET /api/exams
- **Description:** Get all configured exams for the authenticated user.
- **Authorization:** Access Token (Bearer)
- **Response:** `200 OK`
  ```json
  [
    {
      "id": "71a2...",
      "name": "GATE Computer Science",
      "targetDate": "2027-02-05T00:00:00Z",
      "progress": 65
    }
  ]
  ```

### POST /api/exams
- **Description:** Create a custom target exam.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "name": "UPSC CSAT",
    "targetDate": "2027-05-25T00:00:00Z",
    "dailyTargetMinutes": 240
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "examId": "82b1..."
  }
  ```

### GET /api/exams/:examId/syllabus
- **Description:** Fetch the complete hierarchical syllabus (Subjects $\rightarrow$ Topics $\rightarrow$ Sub-topics).
- **Authorization:** Access Token (Bearer)
- **Response:** `200 OK`
  ```json
  {
    "examId": "71a2...",
    "subjects": [
      {
        "id": "90c3...",
        "name": "Algorithms",
        "weightage": 15,
        "color": "#FF5733",
        "topics": [
          {
            "id": "11d4...",
            "name": "Graph Search",
            "difficulty": "Medium",
            "importance": "High",
            "status": "In Progress"
          }
        ]
      }
    ]
  }
  ```

### PATCH /api/topics/:topicId/status
- **Description:** Update the completion status of a specific sub-topic.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "status": "Completed"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "updatedStatus": "Completed",
    "revisionScheduled": true,
    "nextReviewDate": "2026-07-02T15:00:00Z"
  }
  ```

---

## 3. Productivity & Timer APIs

### POST /api/study-logs
- **Description:** Log a completed study session.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "topicId": "11d4...",
    "durationSeconds": 3000,
    "focusRating": 5,
    "sessionNote": "Analyzed DFS/BFS complexities."
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "logId": "50fa...",
    "xpEarned": 50,
    "newStreak": 13
  }
  ```

### GET /api/planner/tasks
- **Description:** Retrieve scheduled planner events for a date range.
- **Authorization:** Access Token (Bearer)
- **Query Params:** `startDate=2026-06-29&endDate=2026-07-05`
- **Response:** `200 OK`
  ```json
  [
    {
      "id": "62e9...",
      "title": "Study Graph Search",
      "topicId": "11d4...",
      "startTime": "2026-06-29T10:00:00Z",
      "endTime": "2026-06-29T11:30:00Z",
      "priority": "P0",
      "isCompleted": false
    }
  ]
  ```

---

## 4. Academic Review & AI APIs

### GET /api/revision/queue
- **Description:** Fetch flashcards and topics due for review today.
- **Authorization:** Access Token (Bearer)
- **Response:** `200 OK`
  ```json
  [
    {
      "cardId": "44a1...",
      "topicName": "Graph Search",
      "front": "What is the time complexity of BFS using an adjacency list?",
      "back": "O(V + E)"
    }
  ]
  ```

### POST /api/revision/log-review
- **Description:** Record user answer feedback and update the card's SM-2 interval parameters.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "cardId": "44a1...",
    "qualityRating": 4
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "nextReviewDate": "2026-07-06T09:00:00Z",
    "intervalDays": 7
  }
  ```

### POST /api/ai/chat
- **Description:** Ask a concept question to the AI chatbot, leveraging vector contexts from the user's notes database.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "message": "Why is Dijkstra's algorithm greedy?"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "reply": "Dijkstra's algorithm is greedy because it solves the shortest path by consistently selecting the vertex with the lowest tentative distance...",
    "sources": [
      {
        "noteId": "88e1...",
        "title": "Dijkstra Notes"
      }
    ]
  }
  ```

---

## 5. Mock Test & Reports APIs

### POST /api/mock-tests
- **Description:** Log a mock exam score entry.
- **Authorization:** Access Token (Bearer)
- **Request Body:**
  ```json
  {
    "examId": "71a2...",
    "title": "Full Mock Test 1",
    "marksObtained": 85,
    "totalMarks": 100,
    "durationMinutes": 180,
    "sectionsBreakdown": [
      { "name": "Quant", "marks": 45, "incorrectCount": 2 },
      { "name": "Logic", "marks": 40, "incorrectCount": 3 }
    ]
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "testId": "33b2..."
  }
  ```
