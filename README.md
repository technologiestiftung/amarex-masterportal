![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Amarex Masterportal

Welcome to the **Amarex Masterportal** repository! This project is built with the Masterportal.
The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org), [Vue.js](https://vuejs.org/). The Masterportal is Open Source Software published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/License.txt).

Below are setup instructions for running the project locally and steps for deploying it to Netlify.

### Prerequisites

Ensure you have the following installed on your machine:

-   **Node.js** (v18 or higher)
-   **npm** (usually included with Node.js)

### Installation

1. **Clone the Repository**

    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2. **Install Dependencies**

    Run the following command to install all necessary packages:

    ```bash
    npm install
    ```

## Running the Project

To start a local development server, use the following command:

```bash
npm run start
```

This will start the development server, usually accessible at `http://localhost:9001` (check the terminal output to confirm).

## Building for Production

To build the project for production, run:

```bash
npm run buildPortal
```

## Deploying to Netlify

### Steps to Deploy

1. **Login to Netlify**: Go to [Netlify](https://www.netlify.com/) and log in to your account (or create one if you haven’t already).

2. **Create a New Site**:

    - Click **"New site from Git"** and connect your GitHub (or other Git provider) account.
    - Select the repository for **Project Name**.

3. **Configure Build Settings**:

    - **Build Command**: `npm run buildPortal`
    - **Publish Directory**: `dist`

4. **Deploy**:
    - Click **"Deploy Site"**. Netlify will automatically build and deploy your project.

### Netlify Continuous Deployment

After the initial setup, every push to the main branch will automatically trigger a redeployment on Netlify, ensuring your site stays up-to-date.

---

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https:/github.com/LuiseBrandenburger"><img src="https://avatars.githubusercontent.com/u/61413319?s=?s=64" width="64px;" alt="Luise Brandenburger"/><br /><sub><b>Luise Brandenburger</b></sub></a><br /><a href="https://github.com/technologiestiftung/smartwater-masterportal/commits?author=LuiseBrandenburger" title="Code">💻</a> <a href="https://github.com/technologiestiftung/smartwater-masterportal/pulls?q=is%3Apr+reviewed-by%3ALuiseBrandenburger" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/technologiestiftung/smartwater-masterportal/commits?author=LuiseBrandenburger" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

Illustrations by {MARIA_MUSTERFRAU}, all rights reserved.

## Credits

<table>
  <tr>
    <td>
      Made by  <a href="https://www.technologiestiftung-berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-de.svg" />
      </a>
    </td>
    <td>
      Supported by <a href="https://www.berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-berlin.svg" />
      </a>
    </td>
  </tr>
</table>

## Related Projects

