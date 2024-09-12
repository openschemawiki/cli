[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
<picture>
<source srcset="images/logo-light.svg" media="(prefers-color-scheme: dark)">
<img src="images/logo-dark.svg" width="200">
</picture>

<h3 align="center">OpenSchema CLI</h3>
<p align="center">OpenSchema.wiki is the largest online repository for structured data. It is used by services, webpages and organizations around the globe to ensure consistency in their data and workflows. This is the official CLI to simplify working with the OpenSchema registry.</p>

  <p align="center">
    <a href="https://github.com/openschemawiki/cli/issues">Report Bug</a>
    ·
    <a href="https://github.com/openschemawiki/cli/issues">Request Feature</a>
  </p>
</div>

- [About](#about)
- [Installation](#installation)
- [Commands](#commands)
	- [search](#search)
	- [pull](#pull)
	- [push](#push)
- [Contributing](#contributing)
	- [How to Contribute](#how-to-contribute)
	- [Contribution Guidelines](#contribution-guidelines)
	- [Where to Start](#where-to-start)
- [License](#license)

## About

OpenSchema.wiki is a public registry for structured data schemas. This CLI makes it easy to interface with the OpenSchema registry, allowing you to search, download, and contribute to the growing collection of schemas available on the platform.

## Installation

`npm` is required to install the CLI. You can download and install npm from the [official website](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

After installing npm, you can install the CLI using the following command:

```bash
npm install -g @openschemawiki/cli
```

## Commands

The CLI provides a number of commands to interact with the OpenSchema registry. Here are some of the available commands:


### search

Search for schemas in the OpenSchema registry.

```bash
openschema search <query>
```

### pull

Pull a schema from the OpenSchema registry.

```bash
openschema pull <name>[:version]
```

### push

Push a schema to the OpenSchema registry.

```bash
openschema push
```

To view a list of all available commands, you can use the `--help` flag:

```bash
openschema --help
```

## Contributing

### How to Contribute

**1. Fork the Repository**

- Start by forking the openschemawiki repository on GitHub to your own account. This will allow you to make changes without affecting the main project.

**2. Set Up Your Development Environment**

- Clone the forked repository to your local machine:

  ```bash
  git clone https://github.com/your-username/openschemawiki.git
  cd openschemawiki
  ```

- Follow the setup instructions in the `README` to install dependencies and get the project running locally.

**3. Make Your Changes**

- Create a new branch for your feature or bug fix:

  ```bash
  git checkout -b feature/new-feature
  ```

- Make your changes in the codebase. Be sure to follow the project's coding standards and best practices.

**4. Write Tests**

- If applicable, write tests to cover your changes. We use a variety of testing frameworks depending on the project, so check the documentation for guidance.

**5. Submit a Pull Request**

- Push your changes to your forked repository:

  ```bash
  git push origin feature/new-feature
  ```

- Go to the original openschemawiki repository on GitHub and open a pull request (PR) from your branch. Provide a clear and concise description of your changes, including any relevant issue numbers.

**6. Participate in Code Review**

- A member of the openschemawiki team will review your pull request. Be open to feedback and be prepared to make revisions if needed.

**7. Celebrate Your Contribution**

- Once your pull request is merged, you’ve officially contributed to openschemawiki! Your contribution will be recognized, and you'll be listed among our contributors.

### Contribution Guidelines

- **Code of Conduct:** We expect all contributors to adhere to our [Code of Conduct](#), fostering a welcoming and respectful environment.
- **Issue Tracking:** Before starting work, check the issue tracker to see if your contribution is already being worked on or has been requested by others.
- **Commit Messages:** Write clear, descriptive commit messages. We use conventional commit formats to maintain a consistent history.
- **Documentation:** Ensure that any new features or changes are well-documented. This helps other users and contributors understand how to use the new functionality.

### Where to Start

- **Good First Issues:** If you're new to contributing, check out the [Good First Issues](#) label in our issue tracker. These are typically smaller, well-defined tasks that are ideal for new contributors.
- **Feature Requests:** If you have an idea for a new feature, open a discussion or create a feature request in our issue tracker.

Thank you for considering contributing to openschemawiki. Together, we can continue to create innovative, open-source solutions that make a real impact. If you have any questions or need help getting started, don’t hesitate to reach out to our community or core team.

## License

Distributed under the MIT License. See `LICENSE` for more information.

[contributors-shield]: https://img.shields.io/github/contributors/openschemawiki/cli.svg?style=for-the-badge
[contributors-url]: https://github.com/openschemawiki/cli/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/openschemawiki/cli.svg?style=for-the-badge
[forks-url]: https://github.com/openschemawiki/cli/network/members
[stars-shield]: https://img.shields.io/github/stars/openschemawiki/cli.svg?style=for-the-badge
[stars-url]: https://github.com/openschemawiki/cli/stargazers
[issues-shield]: https://img.shields.io/github/issues/openschemawiki/cli.svg?style=for-the-badge
[issues-url]: https://github.com/openschemawiki/cli/issues
[license-shield]: https://img.shields.io/github/license/openschemawiki/cli.svg?style=for-the-badge
[license-url]: https://github.com/openschemawiki/cli/blob/master/LICENSE.txt
