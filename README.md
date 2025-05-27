# Project Context: Student Score Management System

You are my expert AI pair programmer. I need you to deeply understand my current project so you can provide the best possible assistance for development, debugging, and refactoring.

**1. Project Goal:**
The project, named "student-score-management," is a web application designed for teachers or administrators. Its primary purpose is to manage student information and their academic scores efficiently.

**2. Technology Stack:**
* **Framework:** Next.js (using React)
* **Styling:** Tailwind CSS (configured with `tailwind.config.js` and `postcss.config.js`)
* **Language:** JavaScript (ES6+)
* **Environment:** Node.js (especially for server-side operations like file handling)
* **Package Manager:** npm (using `package.json` and `package-lock.json`)

**3. Project Structure (Key Folders & Files):**
* `.idea/`: IDE-specific settings (You can generally ignore this).
* `.next/`: Next.js build output (Ignore this).
* `components/`: Contains reusable React components used across various pages.
* `data/`: **Crucial:** This folder holds our application data, currently stored in JSON files (e.g., `students.json`, `scores.json`). *This is our current 'database'.*
* `node_modules/`: Project dependencies (Ignore this).
* `pages/`: Defines the routes and primary views of the application using Next.js file-based routing. This includes UI and potentially data-fetching logic (`getServerSideProps`, `getStaticProps`, or API routes in `pages/api/`).
* `styles/`: Contains global CSS files or base styles.
* `utils/`: Contains utility and helper functions:
    * `auth.js`: Handles user authentication logic (e.g., login, logout, session management).
    * `fileOperations.js`: **Very Important:** This module handles *all* reading and writing operations for the JSON files in the `data/` folder. It uses Node.js `fs` module and `process.cwd()` to ensure paths are relative to the project root, making it portable. *This code runs exclusively on the server-side.*
* `.gitignore`: Specifies files/folders to be ignored by Git.
* `next.config.js`: Next.js configuration.
* `package.json`: Lists project dependencies and scripts.
* `tailwind.config.js` / `postcss.config.js`: Configuration for Tailwind CSS.

**4. Key Features & Logic:**
* **Data Storage:** Currently uses JSON files. All modifications (read/write) MUST go through `utils/fileOperations.js` and happen on the server (likely via API routes or `getServerSideProps`).
* **Student Management:** CRUD (Create, Read, Update, Delete) operations for student records.
* **Score Management:** Adding, viewing, editing, and deleting scores associated with students.
* **Authentication:** Basic user login/logout to protect access.
* **Frontend:** Built with React components, styled with Tailwind CSS, rendered via Next.js pages.

**5. How You Should Help:**
* **Understand the Context:** Remember this structure and tech stack when I ask questions.
* **Server-Side vs. Client-Side:** Be mindful that file operations (`fs`) can *only* run on the server-side in Next.js (API routes, `getStaticProps`, `getServerSideProps`). Don't suggest using `fs` directly in client-side React components.
* **Code Generation:** When generating code, adhere to the existing structure (e.g., put new components in `components/`, new API routes in `pages/api/`). Use React, Next.js, and Tailwind CSS best practices.
* **Problem Solving:** When I describe a problem, consider how it fits into this architecture before suggesting a solution.
* **Refactoring:** Suggest improvements that maintain or enhance this structure, focusing on portability, maintainability, and Next.js conventions.

**Please confirm that you have read and understood this project context. From now on, act as my assistant for the "student-score-management" project based on this information.**

具体任务：
# Project Update & New Feature Request: Student Score Management System

你好！基于我们之前讨论过的 "student-score-management" Next.js 项目，我现在需要为其增加两个核心功能，以提升其数据分析能力和智能化水平，这对于我的项目答辩（presentation）至关重要。

**请牢记我们项目的技术栈（Next.js, React, Tailwind CSS）和现有结构（特别是 `utils/fileOperations.js` 用于在服务器端读写 `data/` 目录下的 JSON 文件）。**

**新功能目标：**

**1. 成绩分析与可视化 (Score Analysis & Visualization) 📊**
* **目标：** 开发一个专门的页面或区域，用于展示对学生成绩的统计分析结果。
* **核心指标：**
* 计算并展示**平均分** (Average Score) - 可按班级、科目或全体计算。
* 找出并展示**最高分** (Highest Score) 和**最低分** (Lowest Score) - 可按科目或全体。
* 统计并展示**不及格人数** (Number of Failing Students) - 假设 60 分以下为不及格。
* **可视化要求：**
* 必须使用**图表**形式展示上述指标，例如：
* 使用**柱状图**比较不同科目/学生的平均分/最高分/最低分。
* 使用**饼图**展示及格与不及格学生的比例。
* 图表需要**清晰、美观、易于理解**，适合在答辩时进行展示。
* **技术实现建议：**
* 建议引入一个 React 图表库，例如 **`react-chartjs-2`** (基于 Chart.js) 或 **`Recharts`**。请帮我选择一个合适的，并指导如何集成到 Next.js 项目中。
* 创建一个新的页面，例如 `pages/analysis.js`。
* 所有的数据计算**必须在服务器端完成**（例如，在 `getServerSideProps` 中），通过 `utils/fileOperations.js` 读取 `data/` 中的成绩数据，计算完成后将结果传递给前端页面。
* 前端页面接收到计算好的数据后，使用选定的图表库进行渲染。

**2. 成绩趋势预警算法 (Trend Analysis Algorithm) 📉**
* **目标：** 实现一个简单的规则算法，用于监测学生的成绩变化趋势，特别是识别出有“连续下滑”风险的学生，并给出提醒。
* **算法规则定义：**
* 定义“连续下滑”为：**同一名学生，在同一门科目上，连续 3 次或以上的考试成绩呈下降趋势。** （我们需要假设成绩数据包含时间或考试批次信息，如果没有，请帮我考虑如何模拟或调整数据结构）。
* **功能要求：**
* 系统能够自动扫描所有学生的成绩记录，找出符合“连续下滑”规则的学生。
* 在学生列表页或学生详情页，对这些学生进行**标记或高亮显示**，并给出明确的“成绩下滑预警”提示。
* **技术实现建议：**
* 这个算法逻辑**必须在服务器端实现**。可以考虑：
* 创建一个 API 路由 (e.g., `pages/api/trends.js`)，它负责处理数据并返回有预警的学生列表。
* 或者，在加载学生列表或详情页的 `getServerSideProps` 中直接集成这个算法。
* 请帮我设计并实现这个算法的核心 JavaScript/Node.js 代码。
* 指导我如何在前端 UI 中展示这些预警信息。

**你的任务：**

请基于以上要求，为我提供具体的实施步骤、代码示例和指导：
1.  **选择并集成图表库**：给出建议并提供安装和基本配置代码。
2.  **构建 `pages/analysis.js`**：包括 `getServerSideProps` 中的数据读取与计算逻辑，以及前端 React 组件中使用图表库展示数据的代码。
3.  **设计并实现趋势预警算法**：提供算法的 JavaScript 代码，并建议最佳的集成方式（API 路由 or `getServerSideProps`）。
4.  **实现前端预警展示**：给出如何在 React 组件中根据算法结果显示预警信息的示例。

**请确保所有方案都符合我们项目的现有技术栈和架构，并且代码清晰、高效、易于理解。最终效果要注重**演示性**和**说服力**，以达到在答辩中加分的目的。**

**让我们开始吧！首先，请帮我分析一下哪种图表库更适合我们的需求，并指导我如何安装。**