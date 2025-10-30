const fs = require('fs');
const path = require('path');

const dir = './app/components/ui';

fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix @radix-ui imports
  content = content.replace(/@radix-ui\/([a-z-]+)@[\d.]+/g, '@radix-ui/$1');
  // Fix lucide-react imports
  content = content.replace(/from ['"]lucide-react@[\d.]+['"]/g, 'from "lucide-react"');
  // Fix class-variance-authority imports
  content = content.replace(/from ['"]class-variance-authority@[\d.]+['"]/g, 'from "class-variance-authority"');
  // Fix tailwind-merge imports
  content = content.replace(/from ['"]tailwind-merge@[\d.]+['"]/g, 'from "tailwind-merge"');
  // Fix sonner imports
  content = content.replace(/from ['"]sonner@[\d.]+['"]/g, 'from "sonner"');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('✓ Fixed:', file);
  }
});

console.log('\n✅ All component files updated!');
