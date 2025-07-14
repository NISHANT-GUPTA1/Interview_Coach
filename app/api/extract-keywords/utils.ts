export function extractRealisticKeywords(text: string, role: string): string[] {
  const technicalKeywords = [
    "react",
    "vue",
    "angular",
    "javascript",
    "typescript",
    "node.js",
    "python",
    "java",
    "sql",
    "database",
    "api",
    "microservices",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "cloud",
    "git",
    "agile",
    "testing",
    "debugging",
    "performance",
  ]

  const roleSpecificKeywords: { [key: string]: string[] } = {
    "Software Engineer": ["algorithm", "data structures", "system design", "scalability"],
    "Frontend Developer": ["html", "css", "responsive design", "ui/ux", "component"],
    "Backend Developer": ["server", "database", "api", "security", "scalability"],
    "Data Scientist": ["machine learning", "statistics", "data analysis", "modeling", "python"],
  }

  const words = text.toLowerCase().split(/\s+/)
  const relevantKeywords = technicalKeywords.filter((keyword) => words.includes(keyword))

  if (roleSpecificKeywords[role]) {
    relevantKeywords.push(...roleSpecificKeywords[role].filter((keyword) => words.includes(keyword)))
  }

  return relevantKeywords.slice(0, 5)
}
