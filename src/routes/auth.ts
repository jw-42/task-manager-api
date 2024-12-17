import { Hono } from "hono";
import { checkVKLaunchParams } from "../controllers/auth";

const auth = new Hono();

auth.post("/checkVKLaunchParams", ...checkVKLaunchParams);

export default auth;