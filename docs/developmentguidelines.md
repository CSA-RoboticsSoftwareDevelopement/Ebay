# developmentguidelines.md

These guidelines outline the **development practices** that **Cursor AI** should follow when implementing new features or making code changes for the **Resale** application. The overarching goals are **maintainability**, **readability**, **modularity**, and **simplicity**. Cursor AI must ensure any new code integrates seamlessly into existing codebases, avoids overcomplicating features, and explains its reasoning for proposed changes.

---

## 1. General Principles

1. **Ask Questions Early**  
   - **Clarify Requirements**: If any part of a task is unclear, Cursor AI must ask clarifying questions before writing or suggesting code.
   - **Validate Assumptions**: Verify assumptions with the user or documentation to prevent rework and ensure alignment with project goals.

2. **Keep It Simple**  
   - **Avoid Over-Engineering**: Choose straightforward solutions that effectively solve the problem without introducing excessive complexity.
   - **Prioritize Maintainability**: Clearly name variables, functions, and classes so that other developers can understand the purpose and flow.

3. **Ensure Compatibility**  
   - **Existing Codebase**: Verify all changes work with the current architecture, libraries, and frameworks.
   - **Version Control**: Provide code snippets that fit into the existing folder structure and programming conventions.

---

## 2. Code Quality & Best Practices

1. **Modularity**  
   - **Single Responsibility**: Each function, component, or class should perform one clear job.  
   - **Reusable Components**: Whenever feasible, factor out reusable logic into utility/helper modules.

2. **Readability**  
   - **Clear Naming**: Use descriptive, consistent naming conventions for variables, methods, and classes (e.g., `productData`, `calculateProfit`).  
   - **Small Functions**: Keep functions short and focused; break down large functions into smaller parts to improve clarity.

3. **Commenting & Documentation**  
   - **In-Line Comments**: Add brief comments where logic might be non-obvious, focusing on the “why” behind the code.  
   - **Docstrings**: For new modules, classes, or major functions, include docstrings explaining inputs, outputs, and side effects.

4. **Error Handling**  
   - **Fail Gracefully**: Catch errors and provide clear, actionable messages.  
   - **Logging**: Use a logging strategy (or existing logging practices in the project) to record errors for debugging and audits.

---

## 3. Code Integration

1. **Explain Reasoning**  
   - **Proposal Rationale**: When suggesting a code change, briefly describe why this approach was chosen.  
   - **Implementation Details**: Outline the steps the code takes to achieve its goal.

2. **Testing & Validation**  
   - **Unit Tests**: When adding or modifying features, provide or recommend new/updated test cases.  
   - **Integration**: Confirm compatibility with existing systems (database schemas, APIs, etc.).

3. **Incremental Changes**  
   - **Small Commits**: Prefer small, well-documented commits over large ones; it helps with easier reviews and rollbacks if needed.  
   - **Seamless Upgrades**: Ensure new changes don’t break backward compatibility unless explicitly approved.

---

## 4. Performance & Security

1. **Efficient Queries**  
   - **Database**: Opt for optimized queries (avoid unnecessary loops, indexes for commonly queried fields, etc.).  
   - **Caching**: If needed, suggest caching strategies to reduce load times (but confirm feasibility with the existing architecture).

2. **Secure by Default**  
   - **Data Validation**: Sanitize inputs to prevent injection attacks.  
   - **Authentication & Authorization**: Adhere to existing security patterns (e.g., token-based, session-based) and confirm user rights before granting access.

3. **Scalability**  
   - **Avoid Bottlenecks**: Identify potential performance bottlenecks (nested loops, large data sets).  
   - **Load Testing**: Whenever relevant, suggest or perform basic load tests for new features.

---

## 5. Collaboration & Workflow

1. **PR Reviews & Feedback**  
   - **Peer Review**: Encourage code reviews from team members or other AI tools to ensure quality and consistency.  
   - **Iterative Changes**: Promptly incorporate feedback and explain subsequent revisions.

2. **Documentation**  
   - **Update Project Docs**: If new endpoints, data models, or workflows are introduced, update the relevant documentation.  
   - **Release Notes**: Provide summary notes of changes, bug fixes, or new features for each deployment or release cycle.

3. **Communication**  
   - **Frequent Updates**: Keep the team informed about progress or blockers.  
   - **Open Channels**: Use established communication tools (e.g., Slack, Jira, etc.) for clarifications.

---

## 6. Guidelines Enforcement

1. **Automated Checks**  
   - **Linting**: Ensure code passes lint checks (ESLint, Prettier, etc.) with minimal warnings.  
   - **CI/CD**: Propose or maintain continuous integration pipelines to automate build and test processes.

2. **Compliance**  
   - **Versioning Policy**: Follow the project’s versioning scheme (e.g., semantic versioning).  
   - **Established Patterns**: Adhere to existing design patterns, folder structures, or frameworks chosen by the project.

---

## Conclusion

These **Development Guidelines** ensure that Cursor AI consistently delivers code that is **well-structured, easily understandable**, and **maintainable**. By following these rules—asking clarifying questions, documenting logic, integrating code seamlessly, and adhering to coding best practices—Cursor AI will help build a robust, user-friendly application without overcomplicating the development process.
