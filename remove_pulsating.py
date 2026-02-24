import os
import re
import glob

files = glob.glob('/Users/intrasepriansa/Herd/TPLK004/resources/js/pages/**/*.tsx', recursive=True)

# Regex to match the pulsating rings comment and the mapping block
pattern1 = re.compile(r'\s*\{\/\*\s*(?:Pulsating Rings|Floating Animations \(Pulses\))\s*\*\/\}\s*\{\[0, 1, 2\]\.map\(\(i\) => \(\s*<motion\.div[\s\S]*?/>\s*\)\)\}', re.MULTILINE)

# Regex for just the mapping block in case the comment is not there or named differently
pattern2 = re.compile(r'\s*\{\[0, 1, 2\]\.map\(\(i\) => \(\s*<motion\.div[\s\S]*?/>\s*\)\)\}', re.MULTILINE)

count = 0
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    new_content, n = re.subn(pattern1, '', content)
    if n == 0:
        new_content, n = re.subn(pattern2, '', content)

    if n > 0:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Removed from {f}")
        count += 1

print(f"Total files updated: {count}")
