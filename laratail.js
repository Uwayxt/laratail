#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import inquirer from "inquirer";
import updateNotifier from "update-notifier";
import { fileURLToPath } from "url";

// Convert __filename and __dirname to be compatible with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load package.json
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);

// Check for updates
const notifier = updateNotifier({ pkg });
notifier.notify({ defer: false });

// ANSI escape codes for colors
const blue = "\x1b[34m";
const reset = "\x1b[0m";

// Function to log messages in blue
const log = (message) => {
  console.log(`${blue}${message}${reset}`);
};

// ASCII art for "laratail" in blue
const asciiArt =
  blue +
  `
 _                    _        _ _
| |    __ _ _ __ __ _| |_ __ _(_) |
| |   / _\` | '__/ _\` | __/ _\` | | |
| |__| (_| | | | (_| | || (_| | | |
|_____\\__,_|_|  \\__,_|\\__\\__,_|_|_|
` +
  reset;

// Welcome message with blue ASCII art
const welcomeMessage = `
${asciiArt}

Welcome to Laratail by @uwayxt!`;

log(welcomeMessage);

// Function to execute shell commands with error handling
const execCommand = (command, options = {}) => {
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (error) {
    log(`Error executing command: ${command}`);
    log(error.message);
    process.exit(1);
  }
};

// Ensure package.json exists or create it only for case 4
const ensurePackageJson = () => {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    log("package.json not found. Creating one...");
    execCommand("npm init -y");
  }
};

// Questions for the user
const questions = [
  {
    type: "input",
    name: "projectName",
    message: "What is the name of your project?",
    default: "my_project",
    validate: (input) => (input ? true : "Project name cannot be empty."),
  },
  {
    type: "list",
    name: "setupType",
    message: "Choose your setup:",
    choices: [
      "Install Tailwind CSS with Vite",
      "Install Tailwind CSS with Laravel Mix(still error)",
      "Create a new Laravel project without Tailwind CSS",
      "Install Tailwind CSS CLI Only",
    ],
  },
];

// Main function
const main = async () => {
  try {
    // Prompt the user with questions
    const answers = await inquirer.prompt(questions);
    const { projectName, setupType } = answers;

    const projectPath = path.join(process.cwd(), projectName);

    // Create project directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    process.chdir(projectPath);

    // Only ensure package.json if the setup type is "Install Tailwind CSS CLI Only"
    if (setupType === "Install Tailwind CSS CLI Only") {
      ensurePackageJson();
    }

    // Check if Laravel should be installed
    const skipLaravelSetupTypes = ["Install Tailwind CSS CLI Only"];
    const shouldInstallLaravel = !skipLaravelSetupTypes.includes(setupType);

    if (shouldInstallLaravel) {
      log(`\nCreating Laravel project with name: ${projectName}\n`);
      execCommand(`composer create-project --prefer-dist laravel/laravel ./`);
    } else {
      log(`\nSkipping Laravel installation for setup type: ${setupType}\n`);
    }

    if (shouldInstallLaravel) {
      process.chdir(projectPath);
    }

    switch (setupType) {
      case "Install Tailwind CSS with Vite":
        log("\nInstalling Tailwind CSS with Vite...\n");
        execCommand("npm install -D tailwindcss postcss autoprefixer");
        execCommand("npx tailwindcss init -p");

        // Write Tailwind configuration
        const viteTailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
        `;
        fs.writeFileSync(
          path.join(projectPath, "tailwind.config.js"),
          viteTailwindConfig.trim()
        );

        // Add Tailwind directives to app.css
        const viteTailwindCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
        `;
        fs.writeFileSync(
          path.join(projectPath, "resources/css/app.css"),
          viteTailwindCSS.trim()
        );

        // Update welcome.blade.php
        const viteBlade = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laratail by @Uwayxt</title>
  @vite('resources/css/app.css')
</head>
<body class="bg-black">
        <div>
            <div class="relative isolate px-6 pt-14 lg:px-8">
              <div class="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-10" aria-hidden="true">
                <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-500 to-purple-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
              <div class="mx-auto max-w-3xl sm:py-10 py-10 lg:py-10">
                <div class="sm:mb-8 mb-8 sm:flex sm:justify-center">
                    <a href="#" class="inline-flex justify-between items-center py-1 px-1 pe-4 text-sm text-white rounded-full border text-sky-300 hover:bg-white/20">
                        <span class="text-xs bg-white rounded-full text-black font-bold px-4 py-1.5 me-3">Hello👋</span>
                        <span class="text-sm font-medium">create a project with just one click👆

                        </span>
                        <svg class="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                    </a>
                </div>
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">Effortless Setup for Your Laravel Projects!</h1>
                    <p class="mt-7 text-lg leading-8 text-slate-300">Get started with your web projects quickly and easily using Laratail. No hassle, straight away productive! Laratail helps you organize Laravel and Tailwind CSS projects with just one command. Suitable for developers of all levels.</p>
                </div>
                <div class="mt-8 justify-center max-w-2xl animate-pulse lg:max-w-4xl mx-auto">
                    <div class="relative flex items-center animate-bounce justify-center h-14 w-14 rounded-full bg-white/5 border hover:bg-white/10 mx-auto">
                        <svg class="h-6 w-6 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                        </svg>
                    </div>
                  </div>
                <div class="flex items-start justify-start gap-x-6">
                    <div class="mx-auto mt-8 max-w-2xl sm:mt-8 lg:mt-8 lg:max-w-4xl">
                        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                    </div>
                                    Effortless Setup
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Quickly initialize your Laravel project with Laratail, providing a seamless setup experience tailored to your needs.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    Secure Development
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Rest easy with our robust security features that keep your projects safe and reliable throughout development.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                    Seamless Integration
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Effortlessly integrate Tailwind CSS into your project, whether using Vite or Laravel Mix, for a smoother workflow.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                                        </svg>
                                    </div>
                                    Exceptional Support
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Dedicated support throughout your setup process, ensuring a smooth and efficient development experience.</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="mt-16 text-center">
                    <p class="text-sm text-gray-300">Created by <a href="https://www.instagram.com/uwayxt" target="_blank" class="text-blue-400 font-bold underline">@uwayxt</a></p>
                    <p class="text-sm text-gray-300">Licensed under <a href="#" class="text-blue-400 font-bold">MIT License</a></p>
                </div>
            </div>
              </div>
              <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9333ea] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
            </div>
          </div>
    </body>
</html>
        `;
        fs.writeFileSync(
          path.join(projectPath, "resources/views/welcome.blade.php"),
          viteBlade.trim()
        );

        log("\nInstallation completed!\n");
        log('Running "php artisan serve" in a new terminal...\n');
        log("\nProcess completed successfully!\n");
        execCommand("npm run dev");
        break;

      case "Install Tailwind CSS with Laravel Mix(still error)":
        log("\nInstalling Tailwind CSS with Laravel Mix...\n");
        execCommand("npm install -D tailwindcss postcss autoprefixer");
        execCommand("npx tailwindcss init");

        // Write Tailwind configuration
        const mixTailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
        `;
        fs.writeFileSync(
          path.join(projectPath, "tailwind.config.js"),
          mixTailwindConfig.trim()
        );

        // Add Tailwind directives to app.css
        const mixTailwindCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
        `;
        fs.writeFileSync(
          path.join(projectPath, "resources/css/app.css"),
          mixTailwindCSS.trim()
        );

        // Modify webpack.mix.js
        const webpackMix = `
import mix from 'laravel-mix';
mix.js('resources/js/app.js', 'public/js')
   .postCss('resources/css/app.css', 'public/css', [
       require('tailwindcss'),
   ]);
        `;
        fs.writeFileSync(
          path.join(projectPath, "webpack.mix.js"),
          webpackMix.trim()
        );

        execCommand("npm install");
        execCommand("npm run watch");

        // Update welcome.blade.php
        const mixBlade = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laratail by @Uwayxt</title>
  <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body class="bg-black">
        <div>
            <div class="relative isolate px-6 pt-14 lg:px-8">
              <div class="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-10" aria-hidden="true">
                <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-500 to-purple-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
              <div class="mx-auto max-w-3xl sm:py-10 py-10 lg:py-10">
                <div class="sm:mb-8 mb-8 sm:flex sm:justify-center">
                    <a href="#" class="inline-flex justify-between items-center py-1 px-1 pe-4 text-sm text-white rounded-full border text-sky-300 hover:bg-white/20">
                        <span class="text-xs bg-white rounded-full text-black font-bold px-4 py-1.5 me-3">Hello👋</span>
                        <span class="text-sm font-medium">create a project with just one click👆

                        </span>
                        <svg class="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                    </a>
                </div>
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">Effortless Setup for Your Laravel Projects!</h1>
                    <p class="mt-7 text-lg leading-8 text-slate-300">Get started with your web projects quickly and easily using Laratail. No hassle, straight away productive! Laratail helps you organize Laravel and Tailwind CSS projects with just one command. Suitable for developers of all levels.</p>
                </div>
                <div class="mt-8 justify-center max-w-2xl animate-pulse lg:max-w-4xl mx-auto">
                    <div class="relative flex items-center animate-bounce justify-center h-14 w-14 rounded-full bg-white/5 border hover:bg-white/10 mx-auto">
                        <svg class="h-6 w-6 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                        </svg>
                    </div>
                  </div>
                <div class="flex items-start justify-start gap-x-6">
                    <div class="mx-auto mt-8 max-w-2xl sm:mt-8 lg:mt-8 lg:max-w-4xl">
                        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                    </div>
                                    Effortless Setup
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Quickly initialize your Laravel project with Laratail, providing a seamless setup experience tailored to your needs.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    Secure Development
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Rest easy with our robust security features that keep your projects safe and reliable throughout development.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                    Seamless Integration
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Effortlessly integrate Tailwind CSS into your project, whether using Vite or Laravel Mix, for a smoother workflow.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                                        </svg>
                                    </div>
                                    Exceptional Support
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Dedicated support throughout your setup process, ensuring a smooth and efficient development experience.</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="mt-16 text-center">
                    <p class="text-sm text-gray-300">Created by <a href="https://www.instagram.com/uwayxt" target="_blank" class="text-blue-400 font-bold underline">@uwayxt</a></p>
                    <p class="text-sm text-gray-300">Licensed under <a href="#" class="text-blue-400 font-bold">MIT License</a></p>
                </div>
            </div>
              </div>
              <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9333ea] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
            </div>
          </div>
    </body>
</html>
        `;
        fs.writeFileSync(
          path.join(projectPath, "resources/views/welcome.blade.php"),
          mixBlade.trim()
        );
        break;

      case "Create a new Laravel project without Tailwind CSS":
        log("\nYour Laravel project setup is complete without Tailwind CSS!\n");

        // Update welcome.blade.php for the Laravel project
        const welcomeBladePath = path.join(
          projectPath,
          "resources/views/welcome.blade.php"
        );
        const newContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laratail by @Uwayxt</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-black">
        <div>
            <div class="relative isolate px-6 pt-14 lg:px-8">
              <div class="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-10" aria-hidden="true">
                <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-500 to-purple-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
              <div class="mx-auto max-w-3xl sm:py-10 py-10 lg:py-10">
                <div class="sm:mb-8 mb-8 sm:flex sm:justify-center">
                    <a href="#" class="inline-flex justify-between items-center py-1 px-1 pe-4 text-sm text-white rounded-full border text-sky-300 hover:bg-white/20">
                        <span class="text-xs bg-white rounded-full text-black font-bold px-4 py-1.5 me-3">Hello👋</span>
                        <span class="text-sm font-medium">create a project with just one click👆

                        </span>
                        <svg class="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                    </a>
                </div>
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">Effortless Setup for Your Laravel Projects!</h1>
                    <p class="mt-7 text-lg leading-8 text-slate-300">Get started with your web projects quickly and easily using Laratail. No hassle, straight away productive! Laratail helps you organize Laravel and Tailwind CSS projects with just one command. Suitable for developers of all levels.</p>
                </div>
                <div class="mt-8 justify-center max-w-2xl animate-pulse lg:max-w-4xl mx-auto">
                    <div class="relative flex items-center animate-bounce justify-center h-14 w-14 rounded-full bg-white/5 border hover:bg-white/10 mx-auto">
                        <svg class="h-6 w-6 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                        </svg>
                    </div>
                  </div>
                <div class="flex items-start justify-start gap-x-6">
                    <div class="mx-auto mt-8 max-w-2xl sm:mt-8 lg:mt-8 lg:max-w-4xl">
                        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                    </div>
                                    Effortless Setup
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Quickly initialize your Laravel project with Laratail, providing a seamless setup experience tailored to your needs.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    Secure Development
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Rest easy with our robust security features that keep your projects safe and reliable throughout development.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                    Seamless Integration
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Effortlessly integrate Tailwind CSS into your project, whether using Vite or Laravel Mix, for a smoother workflow.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                                        </svg>
                                    </div>
                                    Exceptional Support
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Dedicated support throughout your setup process, ensuring a smooth and efficient development experience.</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="mt-16 text-center">
                    <p class="text-sm text-gray-300">Created by <a href="https://www.instagram.com/uwayxt" target="_blank" class="text-blue-400 font-bold underline">@uwayxt</a></p>
                    <p class="text-sm text-gray-300">Licensed under <a href="#" class="text-blue-400 font-bold">MIT License</a></p>
                </div>
            </div>
              </div>
              <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9333ea] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
            </div>
          </div>
    </body>
</html>
        `;
        fs.writeFileSync(welcomeBladePath, newContent.trim());
        break;

      case "Install Tailwind CSS CLI Only":
        log("\nInstalling Tailwind CSS CLI...\n");

        execCommand("npm install -D tailwindcss");

        // Initialize Tailwind CSS
        execCommand("npx tailwindcss init");

        // Write Tailwind configuration
        const tailwindConfigCLI = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
        `;
        fs.writeFileSync(
          path.join(projectPath, "tailwind.config.js"),
          tailwindConfigCLI.trim()
        );

        // Add Tailwind directives to input.css
        const inputCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
        `;
        const cssDir = path.join(projectPath, "src");
        const inputCSSPath = path.join(cssDir, "input.css");
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        fs.writeFileSync(inputCSSPath, inputCSS.trim());

        // Add dev script to package.json
        const packageJsonPath = path.join(projectPath, "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
        packageJson.scripts = {
          ...packageJson.scripts,
          dev: "npx tailwindcss -i ./src/input.css -o ./src/output.css --watch",
        };
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Create index.html
        const indexHTML = `
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laratail by @Uwayxt</title>
  <link href="./output.css" rel="stylesheet">
</head>
<body class="bg-black">
        <div>
            <div class="relative isolate px-6 pt-14 lg:px-8">
              <div class="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-10" aria-hidden="true">
                <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-500 to-purple-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
              <div class="mx-auto max-w-3xl sm:py-10 py-10 lg:py-10">
                <div class="sm:mb-8 mb-8 sm:flex sm:justify-center">
                    <a href="#" class="inline-flex justify-between items-center py-1 px-1 pe-4 text-sm text-white rounded-full border text-sky-300 hover:bg-white/20">
                        <span class="text-xs bg-white rounded-full text-black font-bold px-4 py-1.5 me-3">Hello👋</span>
                        <span class="text-sm font-medium">create a project with just one click👆

                        </span>
                        <svg class="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                    </a>
                </div>
                <div class="text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-6xl">Effortless Setup for Your Laravel Projects!</h1>
                    <p class="mt-7 text-lg leading-8 text-slate-300">Get started with your web projects quickly and easily using Laratail. No hassle, straight away productive! Laratail helps you organize Laravel and Tailwind CSS projects with just one command. Suitable for developers of all levels.</p>
                </div>
                <div class="mt-8 justify-center max-w-2xl animate-pulse lg:max-w-4xl mx-auto">
                    <div class="relative flex items-center animate-bounce justify-center h-14 w-14 rounded-full bg-white/5 border hover:bg-white/10 mx-auto">
                        <svg class="h-6 w-6 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                        </svg>
                    </div>
                  </div>
                <div class="flex items-start justify-start gap-x-6">
                    <div class="mx-auto mt-8 max-w-2xl sm:mt-8 lg:mt-8 lg:max-w-4xl">
                        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                    </div>
                                    Effortless Setup
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Quickly initialize your Laravel project with Laratail, providing a seamless setup experience tailored to your needs.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    Secure Development
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Rest easy with our robust security features that keep your projects safe and reliable throughout development.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div>
                                    Seamless Integration
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Effortlessly integrate Tailwind CSS into your project, whether using Vite or Laravel Mix, for a smoother workflow.</dd>
                            </div>
                            <div class="relative pl-16">
                                <dt class="text-lg font-semibold leading-7 text-white">
                                    <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border hover:bg-white/20">
                                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
                                        </svg>
                                    </div>
                                    Exceptional Support
                                </dt>
                                <dd class="mt-2 text-base leading-7 text-slate-300">Dedicated support throughout your setup process, ensuring a smooth and efficient development experience.</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="mt-16 text-center">
                    <p class="text-sm text-gray-300">Created by <a href="https://www.instagram.com/uwayxt" target="_blank" class="text-blue-400 font-bold underline">@uwayxt</a></p>
                    <p class="text-sm text-gray-300">Licensed under <a href="#" class="text-blue-400 font-bold">MIT License</a></p>
                </div>
            </div>
              </div>
              <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9333ea] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
              </div>
            </div>
          </div>
    </body>
</html>
        `;
        fs.writeFileSync(path.join(cssDir, "index.html"), indexHTML.trim());

        log("\nCongratulations! Tailwind CSS CLI installation is complete.");
        log("Open src/index.html with a server to see the result.\n");
        execCommand("npm run dev");
        break;

      default:
        log("Invalid setup type.");
        process.exit(1);
    }

    log("\nYour Laravel project setup is complete!\n");
  } catch (error) {
    log("An unexpected error occurred:");
    log(error.message);
    process.exit(1);
  }
};

main();
