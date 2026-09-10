let repositoryKnowledge = null;

const setRepositoryKnowledge = (knowledge) => {
  repositoryKnowledge = knowledge;
};

const getRepositoryKnowledge = () => {
  return repositoryKnowledge;
};

const hasRepositoryKnowledge = () => repositoryKnowledge != null;

const getRepositoryKnowledgeSize = () =>
  repositoryKnowledge ? repositoryKnowledge.length : 0;

const clearRepositoryKnowledge = () => {
  const wasPresent = repositoryKnowledge != null;
  repositoryKnowledge = null;
  return wasPresent;
};

module.exports = {
  setRepositoryKnowledge,
  getRepositoryKnowledge,
  hasRepositoryKnowledge,
  getRepositoryKnowledgeSize,
  clearRepositoryKnowledge,
};