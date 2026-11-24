# Agentic Browser Automation Agent

An AI-powered browser automation agent that accepts a task in natural language, plans browser actions, executes them through Playwright, observes the page, and continues step by step until the task is completed or it reaches a stopping condition.

The project is a mini version of an agentic browser-use system. 

## 1. Project objective

The objective is to demonstrate how an AI agent can translate a user's instruction into a sequence of browser operations instead of relying on a fixed, manually written sequence of clicks. The agent should:

- Understand the requested task and target fields.
- Open a browser and navigate to the target URL.
- Inspect the visible page and identify relevant form labels.
- Scroll when the required fields are not visible.
- Locate a field, focus it, and type the requested value.
- Read each tool result before choosing the next action.
- Stop and report completion or explain when it cannot finish the task.

## 2. Technology stack

| Technology | Role in this project |
|---|---|
| JavaScript (ES modules) | Implements the agent, browser tools, and control loop. |
| Playwright | Launches Chromium, navigates pages, captures screenshots, locates labels, and performs mouse/keyboard actions. |
| OpenRouter SDK | Sends prompts and messages to the language and vision models. |
| DeepSeek R1 (`deepseek/deepseek-r1`) | Main agent model. Produces the next step in the THINK → ACTION → RESULT workflow. |
| GPT-4o mini (`openai/gpt-4o-mini`) | Vision model used to inspect screenshots and report visible form labels. |
| dotenv | Loads the OpenRouter API key from a local `.env` file. |
| `@playwright/test` | Provides the Playwright test wrapper used by the submitted script. |

## 3. How the agent works

The agent follows a sequential tool-use loop. The model does not directly control the browser: it requests one action by returning structured JSON, the JavaScript program executes that action, and the result is added to the conversation for the model's next decision.

```text
User instruction
      |
      v
Agent receives task and prepares the next step
      |
      v
DeepSeek R1 returns one JSON step
      |
      +---- THINK: decide what should happen next
      |
      +---- ACTION: select one available browser tool
      |         |
      |         v
      |    JavaScript tool dispatcher runs the Playwright function
      |         |
      |         v
      |    Tool result is returned as RESULT
      |         |
      |         v
      |    Result is appended to conversation history
      |         |
      +---------+----> Model is called again with the updated history
      |
      +---- END: stop the loop and finish the task
```

### Execution sequence for the form-filling example

1. **Receive the request:** The current code supplies a hardcoded `userQuery` containing the target URL and the requested fields. A future version can accept this instruction from a terminal, web interface, or API.
2. **Open the browser:** The agent selects `openBrowser()`. Playwright launches Chromium in headless mode and creates a page.
3. **Navigate:** The agent selects `navigateToUrl(url)` to open the requested page.
4. **Inspect the page:** The agent selects `takeScreenshot()`. The screenshot is captured as PNG data and converted to a Base64 data URL.
5. **Identify visible labels:** The screenshot and a text instruction are sent to GPT-4o mini. The vision model is asked to list visible form labels that can be accessed through Playwright's `getByLabel()` locator. Its observation is added to the agent's conversation history.
6. **Find fields that are not visible:** If a requested label is not present in the screenshot result, the agent can select `scroll(amount)` and inspect a new screenshot. This can repeat as needed, subject to the prompt's stopping rule.
7. **Get the field position:** Once a label has been visually confirmed, the agent selects `getFormCoordinatesByLabel(label)`. Playwright uses `page.getByLabel(label)` and `boundingBox()` to obtain the element's position.
8. **Focus and type:** The agent selects `clickOnScreen(x, y)` to focus the field, waits for the result, and then selects `sendKeys(keys)` to type the value into the focused element.
9. **Repeat for the next field:** The agent locates and fills the remaining requested field using the same observe → locate → click → type sequence.
10. **Finish:** The model emits a final completion step and `END`. The main loop stops when it receives `END`.

The important agentic feature is that each next action is selected after the previous action's result has been returned. The sequence is therefore driven by the model's observations and decisions, rather than being fully hardcoded in advance.

## 4. Browser tools

The system prompt exposes the following tools to the agent:

| Tool | Purpose | Key input / output |
|---|---|---|
| `openBrowser()` | Launches Chromium and creates a browser page. | No arguments; returns success or an error message. |
| `navigateToUrl(url)` | Opens the requested website. | URL string; returns navigation status. |
| `takeScreenshot()` | Captures the current browser viewport. | No arguments; stores the image as a Base64 data URL for vision analysis. |
| `scroll(amount)` | Scrolls down to reveal more page content. | Pixel amount; the current agent dispatcher uses downward scrolling. |
| `getFormCoordinatesByLabel(label)` | Finds a labelled form control and obtains its bounding box. | Label string; returns the x/y position or an error. |
| `clickOnScreen(x, y)` | Clicks at a screen position to focus a field. | x and y coordinates; returns click status. |
| `doubleClick(x, y)` | Performs a double-click at a screen position. | x and y coordinates; available for interactions that require it. |
| `sendKeys(keys)` | Types text into the currently focused element. | Text string; returns typing status. |

### Why both Playwright and a vision model are used

Playwright performs the actual browser operations and can locate elements through accessibility labels. GPT-4o mini is used to interpret the screenshot and identify which labels are visible in the current viewport. DeepSeek R1 then uses that observation to decide whether to locate a field, scroll, click, type, or stop.

This is a hybrid approach: visual understanding helps the agent decide what is on screen, while Playwright provides the browser-control and element-location mechanisms.

## 5. Project structure

The supplied code is a single JavaScript test file. A suggested simple structure is:

```text
browser-automation-agent/
├── tests/
│   └── agent.spec.js       # Agent prompt, tools, dispatcher, and execution loop
├── .env                    # Local API key (do not commit)
├── .env.example            # Example environment variable names
├── .gitignore
├── package.json
└── README.md
```

The folder and file names above are a suggested layout; use the path and filename that match your repository. In the submitted implementation, the browser helper functions, system prompt, model calls, and `main()` loop are currently kept together in one file.

## 6. Requirements

Before running the project, make sure you have:

- Node.js and npm installed.
- An OpenRouter account and a valid API key with access to the configured models.
- A working internet connection to access the target website and OpenRouter API.
- The project dependencies installed.
- Chromium installed through Playwright.

## 7. Installation and setup

### 7.1 Initialise the project (if it does not already have a package file)

```bash
npm init -y
```

The source uses ES module `import` syntax. If your project uses `.js` files, set the package type to module in `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "test": "playwright test"
  }
}
```

Merge these fields into your existing `package.json` rather than replacing existing project configuration.

### 7.2 Install dependencies

```bash
npm install playwright @playwright/test @openrouter/sdk dotenv
```

### 7.3 Install the Chromium browser binary

```bash
npx playwright install chromium
```

### 7.4 Configure the OpenRouter API key

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

The code calls `dotenv.config()` and reads the key using `process.env.OPENROUTER_API_KEY`.

Create a `.gitignore` file and ensure that secrets and generated dependencies are not committed:

```gitignore
node_modules/
.env
playwright-report/
test-results/
```

Do not place a real API key in the source code, README, screenshots, or a public repository.

## 8. Running the agent

Save the test containing `test("fill form", ...)` with a Playwright-discoverable filename, for example `tests/example.spec.js`, and run:

```bash
npx playwright test tests/example.spec.js 
```

Or, when the test is in the default Playwright test directory and uses a recognised test filename:

```bash
npm test
```

The browser is currently launched with `headless: true`, so it runs without displaying a browser window. For a live demonstration, you can temporarily change the launch option to `headless: false` so the browser activity is visible. Keep the API key configured in `.env` before running.

The target URL and user instruction are currently defined in the `userQuery` constant in the source file. Change that value to test a different request. The field labels and text must match the target page and the user's instruction.

## 9. Agent prompt and response format

The system prompt instructs the main model to return one JSON object at a time. The object includes a `step` field and, for an action, the tool name and arguments.

The supported steps are:

- `INPUT` — acknowledge and interpret the user's instruction.
- `THINK` — decide the next step based on the task and previous results.
- `ACTION` — request exactly one tool call.
- `RESULT` — represent the result returned by the JavaScript tool.
- `END` — stop the execution loop.

The prompt enforces important behaviour: do not issue multiple tools in one action, wait for each result before choosing the next action, avoid repeating successful actions for the same goal, take screenshots before relying on visible labels and coordinates, and stop when the task is complete or cannot reasonably be completed.

`safeParseJSON()` removes optional Markdown code fences and extracts a JSON object from the model response before parsing it. The OpenRouter request also asks for JSON-object output. The main loop appends each model step and each tool result to `messages`, preserving the interaction history for subsequent decisions.

## 10. Error handling and current limitations

Each browser helper uses `try/catch` and returns a success or failure status. The prompt also tells the agent to consider an error and try a different approach rather than blindly repeating the same failed action.

The submitted code is a working foundation, but the following points should be checked and improved before treating it as a robust general-purpose agent:

1. **Hardcoded request:** `userQuery` is currently fixed in the source. It is not yet a live prompt entered by a user at runtime.
2. **Field-name mismatch:** The assignment says Name and Description, while the current hardcoded query says Username and Description. The examples also mention More about you. Confirm the labels on the live page and use one consistent task definition.
3. **Coordinate-based clicking:** Coordinates can become inaccurate if the viewport, page layout, zoom, or scroll position changes. Prefer Playwright locator actions such as `getByLabel(...).fill(...)` where possible, and use coordinates as a fallback.
4. **Screenshot interpretation:** Vision-model label detection may make mistakes. Confirm that a label exists in the DOM before interacting with it, and verify the field value after typing.
5. **Completion verification:** A successful keyboard action means text was sent, but it does not by itself prove that the intended field contains the correct value. Read back the input value or take a final screenshot.
6. **Browser lifecycle:** Add a `finally` block to close the browser after the run, including when an error occurs. The current code does not show a browser-close step.
7. **Robustness of helpers:** Check that `boundingBox()` returned a value before reading its x/y coordinates. Also correct the `error.messge` typo in `getFormCoordinatesByLabel()` to `error.message`.
8. **Await scrolling:** Await the `page.mouse.wheel(...)` operation so the next screenshot is not taken before scrolling has completed.
9. **Loop safeguards:** Add a maximum number of model iterations and tool calls, and handle invalid JSON, unknown step names, unknown tools, API failures, and missing model responses.
10. **Browser context:** Review the browser/context creation so that the page is created from the intended context. The code creates a context and then calls `browser.newPage()`, which creates a page with its own context.
11. **Sensitive actions:** The current demonstration only fills fields. For future actions such as submitting forms, sending messages, making purchases, or deleting data, add explicit user confirmation before irreversible actions.

## 11. Future improvements

The following improvements can extend the project beyond the current form-filling demonstration:

- **Dynamic user input:** Accept tasks through a command-line prompt, web UI, or API instead of a hardcoded string.
- **More robust element selection:** Use accessible roles, labels, placeholders, text locators, and CSS selectors. Prefer DOM-based locators over coordinates; keep visual coordinates as a fallback.
- **Field-value verification:** After typing, read the value from each field and compare it with the requested value before marking the task complete.
- **More browser actions:** Add dropdown selection, checkbox/radio interaction, keyboard shortcuts, tab handling, file uploads, and form submission with user approval.
- **Improved scrolling and navigation:** Support upward and horizontal scrolling, waiting for dynamic content, handling pop-ups, and navigating between pages.
- **State and memory:** Maintain a structured task state containing the goal, completed actions, current page, fields already filled, and remaining steps.
- **Retries and recovery:** Add bounded retries, timeouts, fallback locators, and recovery strategies for elements that move or disappear.
- **Logging and traceability:** Record timestamps, model decisions, tool arguments, results, and errors. Avoid logging passwords, API keys, or other sensitive values.
- **Screenshots and replay:** Save optional screenshots and Playwright traces for debugging and demonstration, with care for personal information visible on pages.
- **Human approval and permissions:** Ask before consequential actions and restrict the agent to authorised websites and tasks.
- **Modular architecture:** Separate browser tools, model communication, prompt/schema validation, task orchestration, configuration, and logging into different modules.
- **Testing:** Add unit tests for helper functions and integration tests for successful field filling, missing labels, slow pages, network errors, and invalid model output.

## 12. Security and responsible use

- Use the agent only on websites and accounts where you have permission to automate actions.
- Keep `OPENROUTER_API_KEY` private and out of version control.
- Be aware that screenshots are sent to the configured vision model for analysis. Do not use the current screenshot workflow with pages containing sensitive information unless the data handling is appropriate and authorised.
- Do not let model-generated tool arguments run unchecked. Validate tool names, argument types, URL schemes, and allowed domains before executing actions.
- Require user confirmation for actions that submit, send, purchase, publish, delete, or otherwise create significant external effects.

## 13. Assignment requirement mapping

| Assignment requirement | Where/how it is addressed |
|---|---|
| Browser automation library | Playwright with Chromium. |
| Open browser | `openBrowser()`. |
| Navigate to URL | `navigateToUrl(url)`. |
| Take screenshot | `takeScreenshot()` and screenshot analysis through GPT-4o mini. |
| Identify form elements | Vision model identifies visible labels; `getFormCoordinatesByLabel()` resolves a label through Playwright. |
| Click on screen | `clickOnScreen(x, y)`. |
| Send text | `sendKeys(keys)`. |
| Scroll | `scroll(amount)`; current dispatcher scrolls downward. |
| Double click | `doubleClick(x, y)`. |
| Modular tools | Browser operations are implemented as separate helper functions, although they currently live in one file. |
| Element detection | Playwright `getByLabel()` and `boundingBox()`, supported by screenshot/vision analysis. |
| Error handling | `try/catch` blocks in tool helpers and recovery instructions in the system prompt; additional hardening is recommended. |
| Logging | Basic console output is present; structured logging can be added. |
| Configuration | `dotenv` and `OPENROUTER_API_KEY` environment variable. |
| Documentation | This README describes setup, tools, architecture, workflow, and limitations. | 

## 14. References

- [Playwright documentation](https://playwright.dev/)
- [Playwright Test documentation](https://playwright.dev/docs/test-intro)
- [OpenRouter documentation](https://openrouter.ai/docs)
- [Browser Use reference project](https://github.com/browser-use/browser-use)
- [OpenAI Agents SDK documentation](https://openai.github.io/openai-agents-js)

---

**Project:** Agentic Browser Automation Agent  
**Primary language:** JavaScript  
**Browser automation:** Playwright  
**Model access:** OpenRouter 
