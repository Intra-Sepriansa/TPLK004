import os
import re

TARGET_DIR = 'resources/js/'

def process_file(filepath):
    if 'sesi-absen.tsx' in filepath:
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content

    # 1. Update Global Variants Definitions
    content = re.sub(
        r'const containerVariants\s*=\s*\{\s*hidden:\s*\{\s*opacity:\s*0\s*\},\s*visible:\s*\{\s*opacity:\s*1,\s*transition:\s*\{\s*staggerChildren:\s*0\.\d+,\s*delayChildren:\s*0\.\d+,\s*\}\s*\}\s*\}\s*(?:as const)?;',
        r"""const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        }
    }
} as const;""",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'const itemVariants\s*=\s*\{\s*hidden:\s*\{\s*opacity:\s*0,\s*y:\s*\d+,\s*scale:\s*0\.\d+\s*\},\s*visible:\s*\{\s*opacity:\s*1,\s*y:\s*0,\s*scale:\s*1,\s*transition:\s*\{\s*type:\s*\'spring\',\s*stiffness:\s*\d+,\s*damping:\s*\d+\s*\}\s*\}\s*\}\s*(?:as const)?;',
        r"""const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
} as const;""",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'const cardVariants\s*=\s*\{\s*hidden:\s*\{\s*opacity:\s*0,\s*y:\s*\d+,\s*scale:\s*0\.\d+\s*\},\s*visible:\s*\{\s*opacity:\s*1,\s*y:\s*0,\s*scale:\s*1,\s*transition:\s*\{\s*type:\s*\'spring\',\s*stiffness:\s*\d+,\s*damping:\s*\d+\s*\}\s*\},\s*hover:\s*.*?\}\s*(?:as const)?;',
        r"""const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;""",
        content,
        flags=re.DOTALL
    )

    # 2. Header Animation
    # Look for:
    # initial={{ opacity: 0, y: -20 }}
    # animate={{ opacity: 1, y: 0 }}
    # transition={{ duration: ANY, ease: 'ANY' }}
    # Replace the transition with Sesi Absen's spring transition
    header_regex = re.compile(r'(initial=\{\{\s*opacity:\s*0,\s*y:\s*-20\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=)\{\{.*?\}\}', re.DOTALL)
    content = header_regex.sub(r"\1{{ duration: 0.6, type: 'spring', stiffness: 100 }}", content)

    # 3. Icon Animation (Hero Icons)
    # Look for: initial={{ opacity: 0, scale: 0.5, rotate: -20 }} -> change to rotate: -10
    content = re.sub(r'initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.5,\s*rotate:\s*-[0-9]+\s*\}\}', r'initial={{ opacity: 0, scale: 0.5, rotate: -10 }}', content)
    # Target whileHover={{ scale: 1.1, rotate: 0 }} or similar in the same icon blocks
    # Actually just broadly replace whileHover={{ scale: 1.1, rotate: 0 }} with the Sesi Absen one (1.05 and 5)
    content = content.replace("whileHover={{ scale: 1.1, rotate: 0 }}", "whileHover={{ scale: 1.05, rotate: 5 }}")
    
    # 4. Content Containers that use opacity: 0, y: 20 -> change transition to delay: 0.2
    glass_card_regex = re.compile(r'(initial=\{\{\s*opacity:\s*0,\s*y:\s*20\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*transition=)\{\{.*?\}\}', re.DOTALL)
    content = glass_card_regex.sub(r"\1{{ delay: 0.2 }}", content)

    # 5. List items mapped stagger delay
    content = re.sub(r'transition=\{\{\s*delay:\s*idx\s*\*\s*0\.[0-9]+\s*\}\}', r'transition={{ delay: idx * 0.05 }}', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    modified = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                if process_file(os.path.join(root, file)):
                    modified += 1
                    print(f"Updated {file}")
    print(f"Total modified: {modified}")

if __name__ == '__main__':
    main()
