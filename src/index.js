const express = require("express");

const { v4: uuid, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function checkIfThisRepositoryAlreadyExists (request, response, next) {
  const { id } = request.params;

  const repository = repositories.find(repository => repository.id === id);

  const isValidUUID = validate(id);

  if (!repository) {
    return response.status(404).json({ error: "Repository not found" });
  }

  if(!isValidUUID) {
    return response.status(400).json({
      error: "UUID is not valid."
    })
  }
  
  request.repository = repository;

  return next();
}

app.get("/repositories", (request, response)   => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", checkIfThisRepositoryAlreadyExists, (request, response) => {
  const { repository } = request;

  const {
    title,
    url,
    techs
  } = request.body;

  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  return response.json(repository);
});

app.delete("/repositories/:id", checkIfThisRepositoryAlreadyExists, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", checkIfThisRepositoryAlreadyExists, (request, response) => {
  const { repository } = request;

  const likes = ++repository.likes;

  return response.json({ likes });
});

module.exports = app;
