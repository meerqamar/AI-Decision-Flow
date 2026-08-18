# AI Decision Flow

A visual workflow builder and execution engine for designing deterministic AI-driven decision trees.

AI Decision Flow allows you to visually construct decision trees on a canvas, where specific nodes query the Google Gemini API. The workflow is executed reliably in the background using Inngest, which traverses your visual graph, evaluates AI conditions, and routes to the correct result path based on the AI's response.

##  Features

- **Visual Canvas:** Built with [React Flow](https://reactflow.dev/), featuring a sleek dark mode UI, custom decision nodes, and smooth interactive routing.
- **AI-Powered Decisions:** Integrate dynamically with Google Gemini 3.6 Flash. Ask questions in natural language, and let the AI decide the execution path (YES / NO).
- **Reliable Background Execution:** Workflows are executed deterministically via [Inngest](https://www.inngest.com/) Step Functions, guaranteeing that steps are retried on failure and executed reliably.
- **Real-time Polling & Logs:** The frontend UI tracks execution progress in real-time, animating active paths and rendering step-by-step logs.
- **Export & Import:** Save your complex decision graphs locally as JSON files and load them at any time.

##  Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Workflow Engine:** Inngest
- **Visualizer:** React Flow (`@xyflow/react`)
- **AI SDK:** Google Gen AI SDK (`@google/genai`)
- **Styling:** Tailwind CSS + Shadcn UI

##  Getting Started

### Prerequisites
- Node.js 18+
- An active [Google Gemini API Key](https://aistudio.google.com/)

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Running the Application

To run the full stack locally, you need to run two servers concurrently.

**Start the Next.js Dev Server:**
Open your first terminal and run:
```bash
npm run dev
```

**Start the Inngest Dev Server:**
Open a second terminal and run:
```bash
npx inngest-cli@latest dev
```

### 4. Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Connect the **Start Node** to an **AI Decision Node**.
3. Provide context in the prompt (e.g., *"Is the following message a support request? Message: 'Help I forgot my password'"*).
4. Connect the **YES** and **NO** handles to your desired **Result Nodes**.
5. Click **Execute** and watch the execution logs trace the AI's decision dynamically!

## 📝 License

This project is licensed under the MIT License.
