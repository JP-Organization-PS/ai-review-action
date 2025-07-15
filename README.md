# AI Code Review Action

An internal GitHub Action that leverages AI models (like Google's Gemini or Azure OpenAI) to perform exhaustive, automated code reviews on pull requests.

This tool is designed to be used as a **reusable workflow**, allowing any repository within your organization to easily integrate automated AI reviews without duplicating code.

---

## Features

-   **Multi-Model Support:** Easily switch between different AI providers (Google Gemini, Azure OpenAI).
-   **Intelligent Chunking Strategy:**
    -   **Level 1 (File-based):** Reviews small files in a single pass.
    -   **Level 2 (Function-based):** Uses `tree-sitter` to parse code and review changed functions in their entirety, providing maximum context to the AI.
    -   **Level 3 (Diff-based):** As a fallback, splits very large diffs into token-aware chunks to stay within model limits.
-   **Multi-Language Parsing:** Supports a wide range of popular programming languages out of the box, with an easily extensible configuration.
-   **Robust Error Handling:** Includes retry logic with exponential backoff for API calls and resilient fallback mechanisms for posting comments.
-   **Detailed & Actionable Feedback:** Uses advanced prompt engineering to generate in-depth reviews covering security, performance, best practices, and more.
-   **Inline & Summary Comments:** Posts a detailed summary on the PR and attempts to post inline comments directly on the relevant lines of code in the diff.

---

## How to Use

This action is designed as a reusable workflow. To use it in a repository, you need to create a workflow file that calls it.

### Prerequisites

1.  **Repository Access:** The calling repository must be within the same organization as this `ai-review-action` repository to have access.
2.  **Secrets:** You must have the necessary AI provider API key available as a repository or organization-level secret.

### Step 1: Create a Workflow File

In any repository where you want to run the review, create a new workflow file at `.github/workflows/code-review.yml`.

```yaml
# .github/workflows/code-review.yml

name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  ai-review:
    # Use the reusable workflow from your central action repository
    # IMPORTANT: Update 'your-org' to your organization's name
    uses: your-org/ai-review-action/.github/workflows/reusable-review.yml@main

    # Provide the necessary secrets
    secrets:
      # This secret must be created in the repository or organization settings
      # For Gemini, this would be your GEMINI_API_KEY
      AI_API_KEY: ${{ secrets.AI_API_KEY }}
```

### Step 2: Configure Secrets

1.  Navigate to the repository where you added the workflow file.
2.  Go to **Settings > Secrets and variables > Actions**.
3.  Click **New repository secret**.
4.  Create a secret named `AI_API_KEY` and paste the API key from your chosen provider (e.g., your Gemini API key).
    * *Tip: For organization-wide use, create this as an **organization secret** under your organization's settings.*

That's it! The AI review will now automatically run on all new pull requests in that repository.

---

## Configuration

While the action works out of the box, you can fine-tune its behavior by editing the files in this `ai-review-action` repository.

### Reusable Workflow Inputs

The `reusable-review.yml` workflow accepts the following inputs:

| Input      | Description                                | Default   | Required |
| :--------- | :----------------------------------------- | :-------- | :------- |
| `ai-model` | The AI model to use (`gemini` or `azure`). | `'gemini'`  | No       |

**Example of passing an input:**
```yaml
jobs:
  ai-review:
    uses: your-org/ai-review-action/.github/workflows/reusable-review.yml@main
    with:
      ai-model: 'azure' # Override the default
    secrets:
      AI_API_KEY: ${{ secrets.AZURE_OPENAI_KEY }}
```

### Script Configuration (`ai-review.js`)

You can modify the constants at the top of the `.github/scripts/ai-review.js` file:

-   `TOKEN_LIMIT`: The maximum token context for the AI model. Reducing this will cause the script to chunk large files more aggressively.
-   `SIMILARITY_THRESHOLD`: A value between `0.0` and `1.0` that controls the strictness of the fuzzy matching for code snippets. A higher value requires a more exact match. Default is `0.85`.

### Adding or Modifying Languages

You can extend the function-based chunking to more languages by editing the `LANGUAGE_CONFIG` object in `ai-review.js`.

1.  Install the required `tree-sitter` grammar: `npm install tree-sitter-your-language`
2.  Add a new entry to `LANGUAGE_CONFIG`:
    ```javascript
    const LANGUAGE_CONFIG = {
        // ... other languages
        rust: {
            extensions: ['.rs'],
            module: 'tree-sitter-rust',
            query: `[(function_item) @function (impl_item) @function]` // Tree-sitter query to find functions
        },
    };
    ```

---

## Contributing

Contributions to improve this action are welcome! Please follow the standard fork-and-pull-request workflow.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/my-new-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/my-new-feature`).
6.  Create a new Pull Request.

---
