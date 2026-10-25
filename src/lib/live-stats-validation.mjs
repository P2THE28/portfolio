function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0
}

function isUrl(value) {
  if (typeof value !== 'string') return false
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

function nullableString(value) {
  return value === null || typeof value === 'string'
}

export function parseGitHubUser(value) {
  if (!isRecord(value) || typeof value.login !== 'string' || !value.login.trim() ||
      !nullableString(value.name) || !nullableString(value.bio) ||
      !isUrl(value.avatar_url) || !isUrl(value.html_url) ||
      !isNonNegativeInteger(value.public_repos) || !isNonNegativeInteger(value.followers)) {
    throw new Error('GitHub returned malformed profile data')
  }
  return value
}

export function parseGitHubRepositories(value) {
  if (!Array.isArray(value)) throw new Error('GitHub returned malformed repository data')
  for (const repo of value) {
    if (!isRecord(repo) || typeof repo.name !== 'string' || !repo.name.trim() ||
        !nullableString(repo.description) || !nullableString(repo.language) ||
        !isNonNegativeInteger(repo.stargazers_count) || !isNonNegativeInteger(repo.forks_count) ||
        !isUrl(repo.html_url) || typeof repo.updated_at !== 'string' || !Number.isFinite(Date.parse(repo.updated_at)) ||
        typeof repo.fork !== 'boolean') {
      throw new Error('GitHub returned malformed repository data')
    }
  }
  return value
}

export function parseGitHubEvents(value) {
  if (!Array.isArray(value)) throw new Error('GitHub returned malformed activity data')
  for (const event of value) {
    if (!isRecord(event) || typeof event.type !== 'string' || !isRecord(event.repo) ||
        typeof event.repo.name !== 'string' || !nullableString(event.created_at) ||
        (event.created_at !== null && !Number.isFinite(Date.parse(event.created_at)))) {
      throw new Error('GitHub returned malformed activity data')
    }
  }
  return value
}

export function unwrapCodeforcesResult(value) {
  if (!isRecord(value) || value.status !== 'OK' || !Object.hasOwn(value, 'result')) {
    throw new Error(isRecord(value) && typeof value.comment === 'string' ? value.comment : 'Codeforces returned an invalid response')
  }
  return value.result
}

export function parseCodeforcesUsers(value) {
  if (!Array.isArray(value) || value.some((user) => !isRecord(user) || typeof user.handle !== 'string' || !user.handle.trim() ||
      (user.rating !== undefined && !isNonNegativeInteger(user.rating)) ||
      (user.maxRating !== undefined && !isNonNegativeInteger(user.maxRating)) ||
      (user.rank !== undefined && typeof user.rank !== 'string') ||
      (user.maxRank !== undefined && typeof user.maxRank !== 'string'))) {
    throw new Error('Codeforces returned malformed profile data')
  }
  return value
}

export function parseCodeforcesRatingHistory(value) {
  if (!Array.isArray(value) || value.some((item) => !isRecord(item) || typeof item.contestName !== 'string' ||
      !isNonNegativeInteger(item.newRating) || !isNonNegativeInteger(item.ratingUpdateTimeSeconds))) {
    throw new Error('Codeforces returned malformed rating history')
  }
  return value
}

export function parseCodeforcesSubmissions(value) {
  if (!Array.isArray(value) || value.some((submission) => !isRecord(submission) ||
      (submission.verdict !== undefined && typeof submission.verdict !== 'string') ||
      !isNonNegativeInteger(submission.creationTimeSeconds) || !isRecord(submission.problem) ||
      (submission.problem.contestId !== undefined && !isNonNegativeInteger(submission.problem.contestId)) ||
      (submission.problem.index !== undefined && typeof submission.problem.index !== 'string') ||
      (submission.problem.name !== undefined && typeof submission.problem.name !== 'string') ||
      (submission.problem.rating !== undefined && !isNonNegativeInteger(submission.problem.rating)))) {
    throw new Error('Codeforces returned malformed submission data')
  }
  return value
}
