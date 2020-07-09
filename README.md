# Email Release Notes action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log. To learn how this action was built, see "[Creating a JavaScript action](https://help.github.com/en/articles/creating-a-javascript-action)" in the GitHub Help documentation.

## Inputs

### `github_token`

**Required** The token for requesting release notes info with

### `repo_name`

**Required** The reponame being requested

### `email_password`

**Required** The password for the dedicated @brafton Gmail sending user


## Example usage

```yaml
uses: brafton/email-release-notes-action@master
with:
  github_token: ${{ github.token }}
  repo_name: brafton_alerts
  email_password: your_pa$$word
```
