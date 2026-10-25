export const profileConfig = {
  name: 'Priyanshu Kumar',
  role: 'Computer Science and Engineering student / Developer',
  primaryLanguage: 'C++',
  interests: ['Data Structures and Algorithms', 'Competitive Programming', 'Full-Stack Development', 'AI/ML'],
  githubUsername: import.meta.env.VITE_GITHUB_USERNAME || 'p2the28',
  codeforcesHandle: import.meta.env.VITE_CODEFORCES_HANDLE || 'p2the28',
  leetcodeUsername: import.meta.env.VITE_LEETCODE_USERNAME || 'p2the28',
  featuredRepositories: [] as string[],
  resumeUrl: '/125CS0018_Priyanshu_Kumar_Resume.pdf',
  email: 'priyanshuask23@gmail.com',
} as const

export const profileLinks = {
  github: `https://github.com/${profileConfig.githubUsername}`,
  codeforces: `https://codeforces.com/profile/${profileConfig.codeforcesHandle}`,
  leetcode: `https://leetcode.com/${profileConfig.leetcodeUsername}`,
  linkedin: 'https://www.linkedin.com/in/p2the28/',
} as const
