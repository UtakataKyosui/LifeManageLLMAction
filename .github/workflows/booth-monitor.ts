// .github/workflows/src/booth-monitor.ts
import { Workflow, Job } from "ghats";

const workflow = new Workflow("BOOTH Monitor", {
    on: {
        schedule: [
            {
                // 毎時0分に実行
                cron: "0 * * * *",
            },
        ],
        // 手動実行を許可
        workflowDispatch: {},
    },
    env: {
        BOOTH_SHOP_NAME: "${{ vars.BOOTH_SHOP_NAME }}",
        BOOTH_KEYWORDS: "${{ vars.BOOTH_KEYWORDS }}",
    },
});

const monitorJob = new Job("monitor-booth-products", {
    runsOn: "ubuntu-latest",
    permissions: {
        contents: "read",
    },
    env: {
        GOOGLE_SERVICE_ACCOUNT_KEY: "${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}",
        GOOGLE_CALENDAR_ID: "${{ secrets.GOOGLE_CALENDAR_ID }}",
        LINE_CHANNEL_ACCESS_TOKEN: "${{ secrets.LINE_CHANNEL_ACCESS_TOKEN }}",
        LINE_USER_ID: "${{ secrets.LINE_USER_ID }}",
    },
});

// ステップを追加
monitorJob
    .uses("actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608") // v4.1.0
    .uses("actions/setup-node@1e60f620b9541d16bece96c5465dc8ee9832be0b", {
        // v4.0.3
        with: {
            "node-version": "20",
            cache: "npm",
            "cache-dependency-path": "packages/booth-monitor/package-lock.json",
        },
    })
    .run("npx playwright install --with-deps chromium", {
        name: "Install Playwright browsers",
        workingDirectory: "packages/booth-monitor",
    })
    .run("npm ci", {
        name: "Install dependencies",
        workingDirectory: "packages/booth-monitor",
    })
    .run("npm run build", {
        name: "Build",
        workingDirectory: "packages/booth-monitor",
    })
    .run("node dist/main.js", {
        name: "Run BOOTH Monitor",
        workingDirectory: "packages/booth-monitor",
    });

workflow.addJob(monitorJob);

export default workflow;
