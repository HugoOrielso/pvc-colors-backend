import { Router } from "express";
import { getDistributorsController } from "../../controllers/distributors/list/listDistributors.controller";
import { getArticlesController } from "../../controllers/articles/article.controller";

const publicArticlesRouter = Router();

publicArticlesRouter.get("/", getArticlesController);

export default publicArticlesRouter;