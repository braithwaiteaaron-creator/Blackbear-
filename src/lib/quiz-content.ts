import type { Question } from "@/lib/types";

export const QUIZ_METADATA = {
  title: "How Well Do You Know GitHub Best Practices?",
  estimatedTime: "8-10 minutes",
  totalQuestions: 15,
  totalTiers: 3,
  questionsPerTier: 5,
  totalScore: 15,
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    tier: "beginner",
    prompt: "What is the primary purpose of using branches in GitHub?",
    options: [
      { id: "A", text: "To store backup copies of your code" },
      {
        id: "B",
        text: "To manage different versions of your project simultaneously",
      },
      { id: "C", text: "To increase the size of your repository" },
      {
        id: "D",
        text: "To create a visual representation of your project",
      },
    ],
    correctOption: "B",
    rationale:
      "Branches let teams develop features, fix bugs, and experiment in isolated environments without destabilizing main.",
  },
  {
    id: 2,
    tier: "beginner",
    prompt: "Why is it important to write descriptive commit messages?",
    options: [
      { id: "A", text: "They make the repository look more professional" },
      {
        id: "B",
        text: "They help you remember what changes were made and why",
      },
      { id: "C", text: "They are required by GitHub" },
      { id: "D", text: "They increase the repository's visibility" },
    ],
    correctOption: "B",
    rationale:
      "Clear commit messages create a durable, auditable history that helps teams understand changes without reverse engineering code.",
  },
  {
    id: 3,
    tier: "beginner",
    prompt: "How can GitHub Issues improve your project management?",
    options: [
      {
        id: "A",
        text: "By allowing you to track bugs and feature requests",
      },
      { id: "B", text: "By automatically merging code" },
      { id: "C", text: "By providing a backup of your code" },
      { id: "D", text: "By increasing your repository's storage" },
    ],
    correctOption: "A",
    rationale:
      "Issues centralize planning and execution with clear ownership, prioritization, and visibility of project progress.",
  },
  {
    id: 4,
    tier: "beginner",
    prompt: "What is the benefit of using pull requests in your workflow?",
    options: [
      { id: "A", text: "They allow you to delete branches" },
      {
        id: "B",
        text: "They facilitate code reviews and collaboration",
      },
      { id: "C", text: "They automatically deploy your code" },
      { id: "D", text: "They increase the size of your repository" },
    ],
    correctOption: "B",
    rationale:
      "Pull requests create structured collaboration and review checkpoints, improving quality and reducing regression risk.",
  },
  {
    id: 5,
    tier: "beginner",
    prompt: "What is a key advantage of integrating CI/CD tools with GitHub?",
    options: [
      { id: "A", text: "It allows for manual testing of code" },
      { id: "B", text: "It automates testing and deployment processes" },
      { id: "C", text: "It increases the number of commits" },
      { id: "D", text: "It requires more manual oversight" },
    ],
    correctOption: "B",
    rationale:
      "CI/CD automation speeds delivery, reduces repetitive work, and enforces consistent quality standards.",
  },
  {
    id: 6,
    tier: "intermediate",
    prompt: "What is the purpose of a .gitignore file in a repository?",
    options: [
      {
        id: "A",
        text: "To specify files and directories that Git should not track",
      },
      { id: "B", text: "To list all contributors to the project" },
      { id: "C", text: "To document the project's dependencies" },
      { id: "D", text: "To define the repository's license terms" },
    ],
    correctOption: "A",
    rationale:
      "A strong .gitignore protects against leaking sensitive files and keeps repositories clean from generated artifacts.",
  },
  {
    id: 7,
    tier: "intermediate",
    prompt: 'What does "rebasing" a branch accomplish in GitHub?',
    options: [
      { id: "A", text: "It deletes the branch permanently" },
      {
        id: "B",
        text: "It moves or combines a sequence of commits to a new base commit",
      },
      { id: "C", text: "It creates a duplicate of the repository" },
      { id: "D", text: "It automatically resolves merge conflicts" },
    ],
    correctOption: "B",
    rationale:
      "Rebasing creates a cleaner linear history that is easier to review and debug in collaborative development.",
  },
  {
    id: 8,
    tier: "intermediate",
    prompt:
      "Which GitHub feature allows you to automate workflows directly within your repository?",
    options: [
      { id: "A", text: "GitHub Pages" },
      { id: "B", text: "GitHub Sponsors" },
      { id: "C", text: "GitHub Actions" },
      { id: "D", text: "GitHub Marketplace" },
    ],
    correctOption: "C",
    rationale:
      "GitHub Actions provides native automation for build, test, deployment, and custom event workflows.",
  },
  {
    id: 9,
    tier: "intermediate",
    scenario: "Feature branch collaboration scenario",
    prompt:
      "Your team is developing a large feature that will take three weeks. Several developers need to contribute without affecting production. What is the best strategy?",
    options: [
      { id: "A", text: "Commit all changes directly to main as completed" },
      { id: "B", text: "Create a separate repository for the feature" },
      {
        id: "C",
        text: "Create a dedicated feature branch and integrate regularly with main",
      },
      {
        id: "D",
        text: "Keep changes local until the feature is fully complete",
      },
    ],
    correctOption: "C",
    rationale:
      "Feature branches isolate work, reduce integration risk, and support parallel development in larger teams.",
  },
  {
    id: 10,
    tier: "intermediate",
    prompt: "What is the function of GitHub's Protected Branches feature?",
    options: [
      { id: "A", text: "To hide branches from public view" },
      { id: "B", text: "To automatically test branches before merging" },
      {
        id: "C",
        text: "To enforce rules such as requiring reviews before merging",
      },
      { id: "D", text: "To lock branches from further development" },
    ],
    correctOption: "C",
    rationale:
      "Protected branches enforce governance and prevent accidental or policy-violating changes to critical branches.",
  },
  {
    id: 11,
    tier: "advanced",
    prompt: "How does GitHub's Dependabot contribute to repository security?",
    options: [
      {
        id: "A",
        text: "It monitors repository traffic and blocks suspicious users",
      },
      {
        id: "B",
        text: "It automatically creates pull requests to update vulnerable dependencies",
      },
      { id: "C", text: "It encrypts all files stored in the repository" },
      { id: "D", text: "It restricts external contributions to the repository" },
    ],
    correctOption: "B",
    rationale:
      "Dependabot helps reduce exposure to known vulnerabilities by keeping dependencies updated with minimal manual effort.",
  },
  {
    id: 12,
    tier: "advanced",
    scenario: "Staging approval and secret isolation scenario",
    prompt:
      "You need staging-specific API keys and a required senior approval before deployment. Which GitHub feature best fits?",
    options: [
      { id: "A", text: "GitHub Wikis" },
      { id: "B", text: "GitHub Labels" },
      { id: "C", text: "Repository Webhooks" },
      {
        id: "D",
        text: "GitHub Environments with protection rules and environment secrets",
      },
    ],
    correctOption: "D",
    rationale:
      "GitHub Environments enforce deployment gates and stage-specific secrets to reduce production misconfiguration risk.",
  },
  {
    id: 13,
    tier: "advanced",
    prompt:
      "Which practice best supports scalability when managing many repositories across an organization?",
    options: [
      { id: "A", text: "Manually review each repository weekly" },
      {
        id: "B",
        text: "Use organization-level policies, team permissions, and repository templates",
      },
      { id: "C", text: "Consolidate all projects into one monorepo" },
      { id: "D", text: "Restrict access to only senior developers" },
    ],
    correctOption: "B",
    rationale:
      "Organization-level governance tools scale standards, onboarding, and security across large repository portfolios.",
  },
  {
    id: 14,
    tier: "advanced",
    prompt:
      "What is a key benefit of GitHub code scanning and secret scanning?",
    options: [
      { id: "A", text: "They improve repository loading speeds" },
      { id: "B", text: "They automatically format code style" },
      {
        id: "C",
        text: "They identify vulnerabilities and exposed credentials before production",
      },
      { id: "D", text: "They auto-generate code documentation" },
    ],
    correctOption: "C",
    rationale:
      "Built-in scanning shifts security left, reducing remediation cost and production incident likelihood.",
  },
  {
    id: 15,
    tier: "advanced",
    scenario: "Event-driven merge automation scenario",
    prompt:
      "Your SaaS must notify PM tools, trigger deployment, and log analytics whenever a PR is merged. What should you use?",
    options: [
      { id: "A", text: "Manually check GitHub and update systems" },
      { id: "B", text: "GitHub Pages deployment notifications" },
      {
        id: "C",
        text: "Protected branch rules to block merges until notifications are sent",
      },
      {
        id: "D",
        text: "GitHub webhooks and API integrations for real-time automation",
      },
    ],
    correctOption: "D",
    rationale:
      "Webhooks and APIs enable event-driven integration across systems without manual intervention.",
  },
];

export const QUESTIONS_BY_TIER = {
  beginner: QUESTIONS.filter((question) => question.tier === "beginner"),
  intermediate: QUESTIONS.filter((question) => question.tier === "intermediate"),
  advanced: QUESTIONS.filter((question) => question.tier === "advanced"),
};

