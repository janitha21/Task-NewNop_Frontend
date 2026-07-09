# Task Manager Application (Frontend)

This is the frontend user interface for the Task Tracker application, built with Angular 18. It provides a seamless, responsive, and dynamic user experience for managing tasks, complete with real-time updates and secure JWT authentication.

## Architecture Overview & Design Decisions
- **Framework:** Built using Angular 18 to leverage its powerful component-based architecture and robust dependency injection.
- **Design System:** Custom CSS was chosen to create a premium, modern design aesthetic without the bloat of heavy UI component libraries. This ensures fast load times and pixel-perfect control over the UI.
- **Real-Time Communication:** We implemented `@stomp/rx-stomp` to connect to the backend WebSocket server. This allows the UI to instantly reflect task changes (creates, updates, deletes) made by other users without requiring manual page refreshes.
- **State Management & Authentication:** JWT tokens are stored securely, and Angular HttpInterceptors are used to automatically attach the Bearer token to all outgoing API requests. Route Guards protect authenticated routes from unauthorized access.

## Setup Instructions

### Prerequisites
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Angular CLI:** `npm install -g @angular/cli@18`

### Environment Configuration
The application is configured to communicate with the backend API running on `http://localhost:8080`. 
A proxy configuration (`proxy.conf.json`) is included for local development to bypass CORS issues if running both servers locally.

### Running the Application

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd task-manager-ui
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm start
   ```
   *This command runs `ng serve` under the hood. The application will be available at `http://localhost:4200/`.*

### Running Tests and Linting
To execute the automated test suite in headless mode (used by the CI pipeline):
```bash
npm run test -- --watch=false --browsers=ChromeHeadless
```
To run linting:
```bash
npm run lint
```

## Assumptions & Future Improvements
- **Assumptions:** The frontend assumes the backend API is up and running correctly on port 8080. If the backend is down, the frontend will fail gracefully but will not function.
- **Future Improvements:**
  - Implement a centralized state management library like NgRx for better scalability as the application grows.
  - Add end-to-end (E2E) testing using Cypress or Playwright to simulate full user journeys.
  - Dockerize the frontend application using Nginx to serve the static built files for production deployments.
