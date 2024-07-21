# 🌟 Laratail 🌟

Hello there! 👋

Welcome to **Laratail**! 🚀 Your ultimate CLI tool to effortlessly set up Laravel projects with Tailwind CSS. Whether you're a newbie or a pro, Laratail makes your life easier with just a few prompts to get you up and running in no time!

I'm Wahyudi, and I made this mini project from my teamwork. So, if in this project you find my name, don't be surprised, I'm really narcissistic! Ha ha ha ha. I hope this Laratail can help you organize Laravel projects with Tailwind CSS more easily and quickly. Enjoy! 😊

## 📖 Table of Contents

- [✨ Features](#-features)
- [⚙️ Installation](#-installation)
- [🎬 Usage](#-usage)
- [🔧 Project Setup Options](#-project-setup-options)
- [🛠️ How It Works](#-how-it-works)
- [📜 License](#-license)
- [📬 Contact](#-contact)

## ✨ Features

- 🔥 **Easy project setup** with Tailwind CSS and Laravel
- ⚡ **Supports Vite and Laravel Mix** for Tailwind CSS integration
- 🛠️ **Automatically creates configuration files**
- 🚀 **Streamlined command execution** for project initialization

## ⚙️ Installation

First things first, make sure you have **Node.js** and **Composer** installed. Then, get Laratail globally with npm:

```bash
npm install -g @uwayxt/laratail
```

## 🎬 Usage

To create a new Laravel project with Laratail, run the following command in your terminal:

```bash
laratail
```

## 🔧 Project Setup Options

When you run the tool, you'll be presented with the following options:

1. **✨ Install Tailwind CSS with Vite: Modern development at its finest**! Creates a new Laravel project and sets up Tailwind CSS using Vite.
2. **🔧 Install Tailwind CSS with Laravel Mix**: Prefer traditional asset management? This option sets up Tailwind CSS in a new Laravel project using Laravel Mix. Note: Laravel Mix setup is currently experiencing issues and may not work correctly.
3. **🌿 Create a new Laravel project without Tailwind CSS**: Want a clean slate? This initializes a standard Laravel project without any additional CSS setup.
4. **🛰️ Install Tailwind CSS CLI**: Sets up a standalone Tailwind CSS project using the Tailwind CLI tool.

## 🛠️ How It Works

1. **Prompting the User**: The CLI tool gathers user input for the project name and setup type.
2. **Creating the Project**: Laratail executes shell commands to create a Laravel project using Composer.
3. **Installing Dependencies**: Based on the selected setup, it installs Tailwind CSS and required build tools.
4. **Generating Configuration Files**: Automatically generates the necessary configuration files like `tailwind.config.js` and updates CSS files.
5. **Running the Development Server**: Finally, Starts the development server using npm, so you're ready to code!

## 📜 License

Laratail is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

## 📬 Contact

For inquiries or support, feel free to reach out to [@uwayxt](https://www.instagram.com/uwayxt).

Happy coding! 🚀✨
