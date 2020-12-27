### Licenses and copyrights ###

#### Our choice of licenses ####

Not wanting commercial exploitation of your own scholarly work is a natural position. However, in our opinion, it is shortsighted, as it prevents wider and more impactful use of your material.

In our project, we use a copyleft-style free documentation license, the CC-BY-SA license, which allows the material to be used for *any* purpose, including commercial purposes.  The Attribution (BY) clause protects your interests in academic attribution of your materials.  The ShareAlike clause ensures that any derivatives that are made must be shared under the same license.

The CC-BY-SA license makes sure that the following uses are possible:

 * Adopting material *from* Wikipedia to the project, and adding material *to* Wikipedia  from the project.
 * Including materials from the project in Free Software / Open Source projects and distributions:
   - CC-BY-SA satisfies the criteria of the [Debian_Free_Software_Guidelines](https://en.wikipedia.org/wiki/Debian_Free_Software_Guidelines), and therefore materials from the project can be included in major Linux distributions.
   - More specifically, the CC-BY-SA license is [one-way compatible with the GNU General Public License 3 (GPL v3)](https://creativecommons.org/2015/10/08/cc-by-sa-4-0-now-one-way-compatible-with-gplv3/), so free software packages using this license will be able to use material from our project to enhance their documentation.
 * Publishing the materials, or remixes or other adaptations, with a commercial publisher - as long as the publisher agrees to keep the source files of the commercial edition  available under the same license
 * Publishing the materials, or remixes or other adaptations, with a self-publishing service.
 * Using the materials in a commercial MOOC - as long as the platform agrees to keep the source files of the MOOC course that uses it available under the same license

We do *not* use the NonCommercial (NC) variants of the CC licenses such as CC-BY-NC, CC-BY-NC-ND, CC-BY-NC-SA.  If you feel strongly about restricting the use of your materials to non-commercial use only, or disallowing the creation of derivatives, we certainly respect your opinions, feelings, and decisions; but as this is incompatible with our philosophy and license choices, you will have to find another venue for your materials.

#### Discussion of compatibility of CC-BY-SA with other free licenses

TBD: CC-BY-SA 3 vs 4

TBD: other CC licenses


#### Workflow for integrating contributed/donated materials ####

1. Create a separate git repository for contributed/donated materials under https://github.com/open-optimization.  For example, if D. Gantzig contributes *Linear programming and restrictions*, create the repository `source-gantzig-linear-programming-and-restrictions`.

2. Put the materials there, unpacking any archives (.tar, .zip), in an initial commit.

3. Remove any copyright-encumbered materials that were included by mistake.

4. Make an initial commit.

5. Add a `README.md` file to the repository that records the intention to publish this material under a specific license that is compatible with CC-BY-SA.  Include documentation such as email exchanges.

6. In the GitHub settings for the repository, archive the repository. This marks it as read-only.
   https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-archiving-repositories

7. Don't clone the repository.  Either:

	- Either: Copy materials from the source repository, step by step, into an existing open-optimization repository when needed. Document the source of the materials by include the URL https://github.com/open-optimization/source-gantzig-linear-programming-and-restrictions in LaTeX comments where appropriate and in the commit message.

	- Or: Prepare an open-optimization version of the materials: Create a new repository from [open-optimization-template](https://github.com/open-optimization/open-optimization-template), such as `open-optimization-gantzig-linear-programming-and-restrictions`. Copy in materials from the source prepository, avoiding to copy generated files.  Adjust file structure to project standards.  Build, test, fix, repeat, release.

#### Keeping track of the source and license status of materials from the web ####

See https://github.com/open-optimization/open-optimization-or-book/blob/master/content/figures/figures-static/00_METADATA.bib
