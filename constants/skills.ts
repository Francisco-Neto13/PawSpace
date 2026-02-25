export const SKILL_TREE_DATA = {
  nexus: {
    label: 'Web Fundamentals',
    icon: '🌐',
    category: 'keystone',
    description: 'O início da jornada. Domine os pilares da web para desbloquear o resto do universo.',
    children: {
      
      'html-master': {
        label: 'HTML5 Architect',
        icon: '🏗️',
        category: 'html',
        description: 'Construindo estruturas sólidas, acessíveis e otimizadas para motores de busca.',
        children: {
          semantic: { label: 'Semantic Web', icon: '🏷️', category: 'html' },
          forms: { label: 'Advanced Forms', icon: '📝', category: 'html' },
          accessibility: { label: 'A11y & ARIA', icon: '♿', category: 'html' },
          seo: { label: 'SEO Basics', icon: '🔍', category: 'html' },
          svg: { label: 'SVG Graphics', icon: '📐', category: 'html' },
        },
      },

      'css-master': {
        label: 'CSS Styling',
        icon: '🎨',
        category: 'css',
        description: 'A arte de transformar código em interfaces ricas e responsivas.',
        children: {
          flexbox: { label: 'Flexbox', icon: '📦', category: 'css' },
          grid: { label: 'CSS Grid', icon: '🏁', category: 'css' },
          animations: { label: 'Transitions & Keyframes', icon: '🎭', category: 'css' },
          responsive: { label: 'Media Queries', icon: '📱', category: 'css' },
          variables: { label: 'CSS Variables', icon: '🧪', category: 'css' },
          tailwind: { label: 'Tailwind CSS', icon: '🌊', category: 'css' },
          sass: { label: 'Sass / SCSS', icon: '💅', category: 'css' },
        },
      },

      'js-master': {
        label: 'JavaScript Engine',
        icon: '⚡',
        category: 'javascript',
        description: 'A força motriz por trás da interatividade e lógica do navegador.',
        children: {
          dom: { label: 'DOM Manipulation', icon: '🌳', category: 'javascript' },
          es6: { label: 'ES6+ Features', icon: '💎', category: 'javascript' },
          async: { 
            label: 'Async JS', 
            icon: '⏳', 
            category: 'javascript',
            children: {
              promises: { label: 'Promises', icon: '🤝', category: 'javascript' },
              fetch: { label: 'Fetch API', icon: '📡', category: 'javascript' },
              websockets: { label: 'WebSockets', icon: '🔌', category: 'javascript' },
            }
          },
          arrays: { label: 'Array Mastery', icon: '[]', category: 'javascript' },
          storage: { label: 'Browser Storage', icon: '💾', category: 'javascript' },
        },
      },

      'react-master': {
        label: 'React Ecosystem',
        icon: '⚛️',
        category: 'javascript',
        description: 'Componentização e estados complexos em aplicações modernas.',
        children: {
          hooks: { label: 'Hooks (useState, useEffect)', icon: '⚓', category: 'javascript' },
          state: { label: 'State Management', icon: '🧠', category: 'javascript' },
          router: { label: 'React Router', icon: '🛤️', category: 'javascript' },
          nextjs: { 
            label: 'Next.js', 
            icon: '🌑', 
            category: 'javascript',
            children: {
              ssr: { label: 'SSR & SSG', icon: '🚀', category: 'javascript' },
              api: { label: 'API Routes', icon: '🛣️', category: 'javascript' },
            }
          },
        },
      },

      'tooling-master': {
        label: 'Dev Tooling',
        icon: '🛠️',
        category: 'backend', 
        description: 'Automação, performance e deploy de aplicações.',
        children: {
          git: { label: 'Git & GitHub', icon: '🌿', category: 'backend' },
          npm: { label: 'Package Managers', icon: '📦', category: 'backend' },
          vite: { label: 'Build Tools (Vite)', icon: '🚄', category: 'backend' },
          testing: { label: 'Testing (Jest/Cypress)', icon: '🧪', category: 'backend' },
          deployment: { label: 'Vercel / Netlify', icon: '☁️', category: 'backend' },
        },
      },
    },
  },
};