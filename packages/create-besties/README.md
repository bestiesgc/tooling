# create-besties

A CLI for creating new apps and libraries using [besties](https://besties.house)' configurations:

```sh
pnpm create besties [project-name] [options]
```

Or, if you'd prefer not to answer prompts, you can use flags:

| name    | shorthand | default                           | description                                                                        |
| ------- | --------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| help    | h         |                                   | show help page                                                                     |
| version | v         |                                   | show version                                                                       |
| type    | t         |                                   | type of project, either 'app' or 'lib'                                             |
| author  | a         | your git `user.name` config value | used in the package.json and in the license file if applicable                     |
| license | l         | LicenseRef-OQL-1.2                | license of the project. one of 0BSD, AGPL-3.0, GPL-3.0, LicenseRef-OQL-1.2, or MIT |

```sh
pnpm create besties my-amazing-app --type app
```

## License

[MIT](../../LICENSE)
