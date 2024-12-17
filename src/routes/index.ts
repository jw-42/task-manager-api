import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import auth from "./auth";
import project from "./project";

import { AuthorizationMiddleware, RateLimiterMiddleware } from "../middleware";

const Router = new Hono();

Router.use(cors());
Router.use(logger());

Router.route("/auth", auth);

Router.use(RateLimiterMiddleware);

Router.use(AuthorizationMiddleware);

Router.route("/project", project);

export { Router };
