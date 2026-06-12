import glob
import re

files = [
  'app/dashboard/services/electric/page.jsx',
  'app/dashboard/services/cable/page.jsx',
  'app/dashboard/services/bvn-slip/page.jsx',
  'app/dashboard/services/nin-slip/page.jsx',
  'app/dashboard/services/ipe/page.jsx'
]

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Remove state
        content = re.sub(r'\s*const \[pin, setPin\].*?;\n', '\n', content)
        content = re.sub(r'\s*const \[showPin, setShowPin\].*?;\n', '\n', content)
        content = re.sub(r'\s*// Create refs for PIN inputs\n', '', content)
        content = re.sub(r'\s*const pinRefs.*?;\n', '\n', content)
        
        # Remove functions
        content = re.sub(r'\s*// Handle PIN input change[\s\S]*?const handlePinChange =[\s\S]*?};\n', '\n', content)
        content = re.sub(r'\s*const handlePinChange =[\s\S]*?};\n', '\n', content)
        
        content = re.sub(r'\s*// Handle keyboard navigation[\s\S]*?const handleKeyDown =[\s\S]*?};\n', '\n', content)
        content = re.sub(r'\s*const handleKeyDown =[\s\S]*?};\n', '\n', content)
        
        # Remove validation
        content = re.sub(r'\s*if \(!pin\.every[\s\S]*?}\n', '\n', content)
        content = re.sub(r'\s*if \(pin\.some[\s\S]*?}\n', '\n', content)
        
        # Remove payload field
        content = re.sub(r'\s*pin: pin\.join\(""\),?\n', '\n', content)
        
        # Remove clear
        content = re.sub(r'\s*setPin\(\["", "", "", ""\]\);\n', '\n', content)
        
        # Remove JSX block
        content = re.sub(r'\s*\{\/\* PIN Input \*\/\}[\s\S]*?Transaction PIN[\s\S]*?(?:</div>\s*){2,3}(?=\s*\{\/\* Submit Button \*\/}|\s*<button)', '\n', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    except Exception as e:
        print(f"Failed {file_path}: {e}")

