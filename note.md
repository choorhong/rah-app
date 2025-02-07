# Application Overview

This application consists of three main pages:

1. `/` - Authentication (Login & Sign Up)
2. `/search-chat` - Search for a user and initiate a conversation
3. `/chat/:id` - Chat screen

## Tech Stack

This application is built with [Vite](https://vite.dev/) and [React v19](https://react.dev/).

### Key Considerations

- Vite does not natively support React Server Components (RSC) like Next.js. Therefore, the application defaults to client-side components.
- Due to time constraints, some optimizations and best practices have been deferred.

## Design Decisions

1. **Form Handling**:
   - `react-hook-form` and validation logic are not implemented to streamline development and focus on core functionalities.

2. **Backend & API Structure**:
   - No dedicated server instances are included since Vite is optimized for client-side applications.
   - A `/server/api` folder is available to emulate a structured development environment. It includes:
     - `repository` layer (data handling logic)
     - `service` layer (business logic)

3. **Database**:
   - [Firebase](https://firebase.google.com/) is used as the database to facilitate quick prototyping and development.

## Thoughts during development
- Midway through the development, I considered designing the application to resemble WhatsApp Web but ultimately I decided to prioritize getting the functional logic working first. As a result, the UI/UX might not be as refined as intended.
- Althought the lack of backend server but the Domain-Driven Design pattern was observed to ensure a clear separation of concerns.
- In hindsight, unit testing should have been included for better maintainability and reliability.
- Although a Docker setup was omitted, the application was swiftly deployed to Netlify for accessibility.



