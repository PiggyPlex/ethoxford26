# README.md

# Project Title

This project is a TypeScript application that integrates various tools and agents to assist users in their daily tasks. It utilizes effectful programming principles to manage side effects and ensure a robust user experience.

## Project Structure

The project is organized into several directories:

- **src**: Contains the source code for the application.
  - **index.ts**: The entry point of the application that initializes and invokes the agent based on user input.
  - **agents**: Contains the agent implementations.
    - **index.ts**: Exports the main agent that utilizes the tools defined in the tools folder.
    - **planning.ts**: Implements a planning agent that decides actions based on the user's recent activities.
  - **tools**: Contains various tools that the agents can use.
    - **index.ts**: Exports all tools available in the tools folder.
    - **weather.ts**: Fetches the current weather for a given city using the Open-Meteo API.
    - **webSearch.ts**: Performs web searches using the LangSearch API and provides a visit_page tool for fetching page contents directly.
    - **fileTools.ts**: Provides file-related tools for interacting with the notes directory.
  - **utils**: Contains utility functions.
    - **safePath.ts**: Validates and resolves file paths within the notes folder.
  - **types**: Contains TypeScript types and interfaces used throughout the project.

## Installation

To install the project dependencies, run:

```
npm install
```

## Usage

To start the application, run:

```
npm start
```

The application will initialize and wait for user input to invoke the appropriate agent based on the context provided.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
