// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse } from 'waku/router';


// prettier-ignore
type Page =
| { path: '/login'; render: 'dynamic' }
| { path: '/signup'; render: 'dynamic' }
| { path: '/'; render: 'dynamic' }
| { path: '/project/[projectId]'; render: 'dynamic' }
| { path: '/project/[projectId]/tasks/[taskId]'; render: 'dynamic' }
| { path: '/project/[projectId]/tasks/[taskId]/subtasks/[subtaskId]'; render: 'dynamic' }
| { path: '/project/create'; render: 'dynamic' };

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
  }
}
