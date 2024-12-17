import { Hono } from "hono";
import { create, deleteProject, editMembers, getAll, getById, getMembers, setOwner } from "../controllers/project";

const project = new Hono();

project.post("/create", ...create);
project.post("/getAll", ...getAll);
project.post("/getById", ...getById);
project.post("/getMembers", ...getMembers);
project.post("/editMembers", ...editMembers);
project.post("/setOwner", ...setOwner);
project.post("/delete", ...deleteProject);

export default project;