let repositoryKnowledge = null;

const setRepositoryKnowledge = (knowledge) => {
  repositoryKnowledge = knowledge;
};

const getRepositoryKnowledge = () => {
  return repositoryKnowledge;
};

module.exports = {
  setRepositoryKnowledge,
  getRepositoryKnowledge,
};