import { Command } from "commander";
import { BitbucketClient } from "../../api/client.js";
import { getRepository } from "../../api/repos.js";
import { resolveWorkspace } from "../../auth/credentials.js";
import { outputResult } from "../../utils/output.js";
import { handleApiError } from "../../utils/errors.js";

export const repoViewCommand = new Command("view")
  .description("Get details for a specific repository")
  .argument("<repo>", "Repository slug")
  .action(async (repo, _, cmd) => {
    const globals = cmd.optsWithGlobals();
    try {
      const workspace = resolveWorkspace(globals.workspace);
      const client = new BitbucketClient(globals.verbose);
      const repository = await getRepository(client, workspace, repo);

      if (globals.json) {
        outputResult(repository, { json: true });
      } else {
        outputResult(
          {
            "Full Name": repository.full_name,
            Slug: repository.slug,
            Description: repository.description || "-",
            Language: repository.language || "-",
            "Default Branch": repository.mainbranch?.name ?? "-",
            "Created": repository.created_on,
            "Updated": repository.updated_on,
            Size: `${Math.round(repository.size / 1024)} KB`,
            Private: repository.is_private,
            URL: repository.links.html?.href ?? "-",
          },
          { json: false },
        );
      }
    } catch (err) {
      handleApiError(err);
    }
  });
