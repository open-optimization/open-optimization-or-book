### Workflow with git ###

#### Working with git submodules ####

We use git submodules

To check out a project and all of its submodules:

```console
$ git clone --recurse https://github.com/open-optimization/open-optimization-or-book.git
```

Submodules are pinned to specific commits.  Running `git pull` or `git commit` etc. in the subdirectory containing a submodule, such as `open-optimization-bibliography`, marks the submodule as "modified" in the containing repository.  Commit this change to update the pinning of the submodule.

To move files between submodules, or between the containing repository and submodules, use `mv`, followed by `git add` and `git commit` in the affected repositories; avoid using `git mv`, which has an effect that may be confusing.

#### Never check in generated files ####

Only source files are to be committed to the git repository.
Add names of generated files, such as PDF files compiled from LaTeX sources, to `.gitignore` if they are not already covered by file name patterns.

#### Continuous integration on GitHub ####

Continuous integration infrastructure using GitHub actions is in place.
Whenever a commit is pushed to GitHub, a GitHub action [check-latex](.github/workflows/check-latex.yml) is run on a server.  It builds the PDF file and reports any errors.

#### Creating a release ####

After committing your files, create an annotated tag and push it to GitHub.

```console
$ git tag -f -a -m "Test release v0.0.3" v0.0.3
$ git push --tags
```

A GitHub action [make-release-on-tag](.github/workflows/make-release-on-tag.yml) automatically creates a GitHub release from the tag, builds the PDF file, and uploads it as a release asset to Releases.
