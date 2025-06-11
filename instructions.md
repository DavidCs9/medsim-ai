### The Project: "MedSim AI" - The AI Patient Simulator

**Concept:** A web application for medical students or clinicians to practice their diagnostic and patient interaction skills. A user starts a new "case," and the AI generates a unique patient profile with a set of symptoms and a backstory. The user then interacts with the "AI patient" through a chat interface, asking questions to gather information, just like a real consultation. Finally, the user can submit a preliminary diagnosis and get feedback from the AI.

**Why this project is perfect:**

- **Directly Aligns with P\S\L's Mission:** It's a tool for medical education, fitting perfectly with "putting information at the service of medicine."
- **GenAI is the Core:** The entire experience is powered by a Large Language Model (LLM).
- **Requires a Full Stack:** You'll need a responsive frontend for the chat, a robust backend to manage the logic, and a database to store cases.
- **Naturally Serverless:** The event-driven nature (user sends a message, AI responds) is a perfect fit for AWS Lambda.

---

### Project Breakdown & Tech Stack Mapping

Here is a phased plan to build "MedSim AI" over the next two weeks.

#### Phase 0: Foundation & Setup (Days 1-3)

This phase is all about setting up your development environment and project structure correctly. This is a key skill for a senior developer.

1.  **Project Structure (Monorepo):**

    - Use **Yarn Workspaces** to create a monorepo. This addresses a "Nice to Have" and is excellent practice for managing complex projects.
    - Your `packages` directory will contain:
      - `frontend`: The React application.
      - `backend-api`: The main NodeJS API service.
      - `ai-core`: The Python service for GenAI logic.
      - `shared-types`: A TypeScript package for sharing types between frontend and backend.

2.  **Tooling Setup:**

    - Initialize a **Git** repository and push it to **GitHub**.
    - Set up **NVM** to manage your Node.js version.
    - Configure Prettier and ESLint at the root level to enforce consistent code style across all packages.

3.  **"Hello World" AWS Deployment:**
    - Install and configure the **Serverless Framework**.
    - In your `backend-api` package, create a simple "hello world" Lambda function.
    - Write a `serverless.yml` file to define the function and an **API Gateway** trigger.
    - Deploy it to your AWS account. This confirms your AWS credentials and basic IaC setup are working.

**Tech Covered:** `Yarn`, `Git`, `GitHub`, `NVM`, `NodeJS`, `AWS Lambda`, `API Gateway`, `Serverless Framework (IaC)`.

---

#### Phase 1: The Backend & AI Core (Days 4-7)

Now, let's build the brain of the application.

1.  **Authentication:**

    - Set up an **AWS Cognito** User Pool to handle user sign-up and sign-in.
    - Configure API Gateway to use the Cognito User Pool as an authorizer for your secure endpoints.

2.  **Database Schema:**

    - Design a single-table schema for **DynamoDB**. This table can hold different item types: `USER`, `CASE`, and `MESSAGE`.
    - Example Keys:
      - `USER`: `PK: USER#<userId>`, `SK: PROFILE`
      - `CASE`: `PK: USER#<userId>`, `SK: CASE#<caseId>` (stores case summary, status)
      - `MESSAGE`: `PK: CASE#<caseId>`, `SK: MSG#<timestamp>` (stores user/AI messages)

3.  **Node.js API Service (`backend-api`):**

    - Use **NodeJS**, **Express.js**, and **TypeScript**.
    - Create Lambda functions for the following RESTful endpoints:
      - `POST /cases`: Creates a new patient case. This function will invoke the Python AI Lambda (see below) to generate the initial patient scenario.
      - `GET /cases`: Lists all cases for the logged-in user.
      - `GET /cases/{caseId}`: Retrieves the full chat history for a specific case.
      - `POST /cases/{caseId}/messages`: This is the main interaction endpoint. It takes the user's message, invokes the Python AI Lambda to get a response, and saves both messages to DynamoDB.

4.  **Python AI Service (`ai-core`):**
    - This fulfills the **Python (20%)** requirement. Python is ideal for AI-heavy lifting.
    - Create a Python Lambda function that:
      - Accepts a prompt (e.g., "Generate a new patient case" or a user's chat message).
      - Uses an SDK (like OpenAI's or AWS Bedrock's) to call an **LLM (GPT-4o, Claude, etc.)**.
      - **Prompt Engineering is key here!**
        - For case generation: "You are a helpful medical simulation AI. Create a patient case for a 45-year-old male. Include a chief complaint, a brief medical history, and social history. Do not reveal the diagnosis."
        - For interaction: "You are acting as a patient. Your secret diagnosis is 'acute appendicitis'. The user is a doctor. Respond to their questions based on this diagnosis. Do not reveal the diagnosis directly. Here is the conversation history: [...]. The doctor's latest question is: [...]"
      - Returns the AI's generated text.

**Tech Covered:** `NodeJS`, `Python`, `Express.js`, `TypeScript`, `AWS Lambda`, `API Gateway`, `DynamoDB`, `Cognito`, `Serverless Framework`, `OpenAI/Bedrock API`.

---

#### Phase 2: The Frontend Interface (Days 8-12)

Let's build the user-facing part of the application.

1.  **Bootstrapping the App:**

    - Inside your `frontend` package, use **Vite** to create a new **React** + **TypeScript** project.

2.  **Component Development:**

    - Create reusable React components for the chat interface (message bubbles, input box), login/signup forms, and a dashboard to list patient cases.
    - Use **SASS/SCSS** for styling to create a modern, clean look. Ensure the layout is **responsive** for both desktop and mobile.

3.  **State Management:**

    - Use **Redux Toolkit** to manage global state, such as the user's authentication status, the list of cases, and the messages for the active case.

4.  **Connecting to the Backend:**

    - Use a library like `axios` to make authenticated API calls to your backend endpoints (created in Phase 1).
    - Implement the full user flow: Sign Up -> Log In -> View Dashboard -> Start New Case -> Chat with AI -> View Past Cases.

5.  **Testing:**
    - Write unit tests for key components and Redux slices using a framework like Jest and React Testing Library.

**Tech Covered:** `React`, `TypeScript`, `Vite`, `Redux`, `HTML5`, `CSS3 (SASS)`, `Unit Testing`.

---

#### Phase 3: Polish & Deployment (Days 13-14)

Time to productionalize your application.

1.  **CI/CD Pipeline:**

    - Create a **GitHub Actions** workflow (`.github/workflows/deploy.yml`).
    - This workflow should trigger on pushes to the `main` branch.
    - It should automatically install dependencies, run tests, and then use the **Serverless Framework** (`serverless deploy`) to deploy both the `backend-api` and `ai-core` services to AWS.

2.  **Frontend Deployment & Optimization:**

    - Build the static React application (`yarn build`).
    - Deploy the static files to an **AWS S3** bucket configured for static website hosting.
    - Set up **AWS CloudFront (CDN)** in front of your S3 bucket for caching, performance, and HTTPS.

3.  **Monitoring:**
    - Explore the logs for your Lambda functions in **AWS CloudWatch** to debug any issues. Set up a basic dashboard to monitor invocations and errors.

**Tech Covered:** `GitHub Actions (CI/CD)`, `AWS S3`, `AWS CloudFront (CDN)`, `AWS CloudWatch`.

### Final Code Example Snippet

Here’s what your `serverless.yml` for the `backend-api` might start to look like:

```yaml
# packages/backend-api/serverless.yml
service: medsim-backend-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  iam:
    role:
      statements:
        # Permissions for this service to talk to DynamoDB and invoke other Lambdas
        - Effect: 'Allow'
          Action:
            - 'dynamodb:Query'
            - 'dynamodb:PutItem'
            - 'lambda:InvokeFunction'
          Resource:
            - 'arn:aws:dynamodb:us-east-1:*:table/MedSimTable'
            - 'arn:aws:lambda:us-east-1:*:function:medsim-ai-core-dev-getAiResponse'

functions:
  createCase:
    handler: src/handlers.createCase
    events:
      - http:
          path: /cases
          method: post
          cors: true
          authorizer:
            name: CognitoAuthorizer
            type: COGNITO_USER_POOLS
            arn: arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/POOL_ID

  # ... other function definitions
```
