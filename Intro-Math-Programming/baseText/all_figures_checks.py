import re

# Define the path to your .bib file
bib_file_path = '/path/to/your/metadata.bib'
# Define the output LaTeX file where the figure commands will be written
output_latex_file = '/path/to/your/output_file.tex'

def extract_figure_filenames(bib_path):
    """
    Extracts the figure filenames from the .bib file.
    """
    figure_filenames = []
    with open(bib_path, 'r') as bib_file:
        content = bib_file.read()
        # Regex to match the keys of entries (figure filenames)
        entries = re.findall(r'@Online{([^,]+),', content)
        figure_filenames.extend(entries)
    return figure_filenames

def write_figures_to_latex(figures, latex_file):
    """
    Writes the \includefigurestatic commands for each figure to a LaTeX file.
    """
    with open(latex_file, 'w') as file:
        for figure in figures:
            file.write(f'\\includefigurestatic{{{figure}}}\n\n')

# Extract figure filenames from the .bib file
figure_filenames = extract_figure_filenames(bib_file_path)
# Write the figures to the LaTeX file
write_figures_to_latex(figure_filenames, output_latex_file)

print(f'Figures have been written to {output_latex_file}')



#################

# Correcting and integrating the entire process into a single execution block

# Re-defining base paths and directories for completeness
base_dir = "/mnt/data"  # Using accessible path for demonstration
bib_file_path = os.path.join(base_dir, "metadata.bib")
static_dir = os.path.join(base_dir, "static")
output_missing_bib_file = os.path.join(base_dir, "metadata_missing.bib")

# Function to get all figure file paths
def get_all_figures_in_static(dir_path):
    figures = []
    for root, _, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                figures.append(os.path.relpath(os.path.join(root, file), base_dir))
    return figures

# Function to extract figure entries from .bib file
def extract_figure_entries_from_bib(bib_path):
    with open(bib_path, 'r') as bib_file:
        content = bib_file.read()
    entries = set(re.findall(r'@Online{([^,]+),', content))
    return entries

# Corrected function to write missing metadata to .bib file
def write_missing_metadata_bib_corrected(figures, existing_entries, output_path):
    missing_figures = [fig for fig in figures if os.path.splitext(os.path.basename(fig))[0] not in existing_entries]
    with open(output_path, 'w') as file:
        for figure in missing_figures:
            figure_key = os.path.splitext(os.path.basename(figure))[0]  # Remove extension
            file.write(f'@Online{{{figure_key}}},\n')
            file.write(f'  author = {{Unknown Author}},\n')
            file.write(f'  title = {{Missing Metadata for {figure_key}}},\n')
            file.write(f'  year = {{2023}},\n')
            file.write(f'  options = {{skipbib=true}},\n')
            file.write(f'}}\n\n')

# Simulating the process (without actual files to read and write)
# Please replace "/mnt/data" with the actual directory paths where your files are located.

# all_figures = get_all_figures_in_static(static_dir)  # This line is commented out because the directory doesn't exist
# existing_entries = extract_figure_entries_from_bib(bib_file_path)  # This line is commented out because the file doesn't exist
# write_missing_metadata_bib_corrected(all_figures, existing_entries, output_missing_bib_file)  # This line is commented out because the previous lines are commented

# Output placeholder for demonstration purposes
output = {
    "all_figures": "N/A",  # Would be len(all_figures) if the directory existed
    "existing_entries": "N/A",  # Would be len(existing_entries) if the .bib file existed
    "metadata_missing_bib_path": output_missing_bib_file
}

output


