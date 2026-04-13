import { atom } from "nanostores";
import { render } from "solid-js/web";
import { wait, waitForElement } from "~/lib/dom/wait";
import { createLogger } from "~/utils/logger";
import ErrorPage from "~/lib/spotify/router/component/ErrorPage";

export type RouteHandler = {
  onMount: (el: HTMLElement) => (() => void) | void;
  selector?: string;
  absolute?: boolean;
  hideSiblings?: boolean;
};

export type RouteDefinitions = Record<string, RouteHandler>;

export const $router_state = atom({
  isNavigating: false,
  path: Spicetify?.Platform?.History?.location?.pathname ?? "",
});

const log = createLogger("router");

const SELECTORS = {
  // MAIN_VIEW: "#main-view .main-view-container__scroll-node-child > main, .Root__main-view .main-view-container__scroll-node-child > main",
  CONTAINER_ID: "lucid-page",
  MAIN_VIEW: "#main-view, .Root__main-view",
};

export class Router {
  private _routes = new Map<string, RouteHandler>();
  private _cleanup?: () => void;
  private _container: HTMLElement | null = null;
  private _hiddenSiblings: HTMLElement[] = [];

  private _basePath: string;
  private _transitionId = 0;
  private _currentPath: string | null = null;
  private _readyPromise: Promise<void> | null = null;
  private _unlistenHistory?: () => void;

  constructor(basePath: string = "/lucid-lyrics", initialRoutes?: RouteDefinitions) {
    const cleanBase = basePath.replace(/^\/+|\/+$/g, "");
    this._basePath = `/${cleanBase}`;

    if (initialRoutes) {
      for (const [path, handler] of Object.entries(initialRoutes)) {
        this.addRoute(path, handler);
      }
    }
  }

  private get _history() {
    return Spicetify?.Platform?.History;
  }

  private _normalizePath(path: string, absolute = false): string {
    let cleanPath = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
    if (!cleanPath) cleanPath = "/";

    if (absolute || cleanPath.startsWith(this._basePath)) return cleanPath;

    const joined = `${this._basePath}/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
    return joined.endsWith("/") && joined.length > 1 ? joined.slice(0, -1) : joined;
  }

  public init(): Promise<void> {
    if (!this._readyPromise) {
      this._readyPromise = (async () => {
        const history = await wait(() => this._history);
        if (!history) {
          log.error("Spicetify History API not found");
          return;
        }

        this._unlistenHistory = history.listen((loc: HistoryLocation) =>
          this._handle(loc.pathname),
        );
        this._handle(history.location.pathname);
      })();
    }
    return this._readyPromise;
  }

  private async _handle(rawPath: string) {
    const path =
      rawPath.endsWith("/") && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath || "/";

    if (this._currentPath === path && this._container) {
      return;
    }

    const handler = this._routes.get(path);
    const isMatched = path.startsWith(this._basePath) || handler?.absolute;

    $router_state.set({ isNavigating: true, path });

    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }

    if (!isMatched) {
      this._restoreSiblings();
      this._container?.remove();
      this._container = null;
      this._currentPath = null;
      $router_state.set({ isNavigating: false, path });
      return;
    }

    const tId = ++this._transitionId;
    const parentSelector = handler?.selector || SELECTORS.MAIN_VIEW;
    const parent = (await waitForElement(parentSelector)) as HTMLElement;

    if (tId !== this._transitionId) return;

    this._restoreSiblings();

    if (!this._container) {
      this._container = document.createElement("main");
      this._container.id = SELECTORS.CONTAINER_ID;
      this._container.style.position = "relative";
    }

    if (this._container.parentElement !== parent) {
      parent.appendChild(this._container);
    }

    this._container.dataset.path = path;

    let siblingsHidden = false;

    if (handler?.hideSiblings) {
      this._hideSiblings(parent, this._container);
      siblingsHidden = true;
    }

    try {
      if (handler) {
        const start = performance.now();
        this._cleanup = handler.onMount(this._container) || undefined;
        log.debug(`mounted: ${path} (${(performance.now() - start).toFixed(2)}ms)`);
      } else {
        log.error(`404: ${path}`);
        if (!siblingsHidden) {
          this._hideSiblings(parent, this._container);
          siblingsHidden = true;
        }
        this._cleanup = render(
          () => (
            <ErrorPage
              icon="404"
              title="Page Not Found"
              message={`We couldn't find ${path}`}
              onHome={() => this._history?.push("/")}
            />
          ),
          this._container,
        );
      }
      this._currentPath = path;
    } catch (err) {
      if (!siblingsHidden) {
        this._hideSiblings(parent, this._container);
        siblingsHidden = true;
      }

      log.error(`error_mounting ${path}:`, err);
      this._cleanup = render(
        () => (
          <ErrorPage
            icon="error"
            title="Something went wrong"
            message={`Failed to load ${path}`}
            errorDetails={String(err)}
            showRetry
            onRetry={() => this._handle(path)}
            onHome={() => this._history?.push("/")}
          />
        ),
        this._container,
      );
      this._currentPath = path;
    }

    $router_state.set({ isNavigating: false, path });
  }

  private _hideSiblings(parent: HTMLElement, current: HTMLElement) {
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (child !== current) {
        child.dataset.lucidHidden = child.style.display;
        child.style.display = "none";
        this._hiddenSiblings.push(child);
      }
    }
  }

  private _restoreSiblings() {
    let el;
    while ((el = this._hiddenSiblings.pop())) {
      el.style.display = el.dataset.lucidHidden || "";
      delete el.dataset.lucidHidden;
    }
  }

  public get state() {
    return $router_state;
  }

  public addRoute(path: string, handler: RouteHandler) {
    const normalized = this._normalizePath(path, handler.absolute);
    this._routes.set(normalized, handler);

    if (this._readyPromise && normalized === $router_state.get().path) {
      this._handle(normalized);
    }
  }

  public async navigate(path: string, absolute = false) {
    await this.init();
    this._history?.push(this._normalizePath(path, absolute || !!this._routes.get(path)?.absolute));
  }

  public async goBack() {
    await this.init();
    this._history?.goBack();
  }

  public async goForward() {
    await this.init();
    this._history?.goForward();
  }

  public togglePath(path: string, absolute = false): boolean {
    const normalizedPath = this._normalizePath(
      path,
      absolute || !!this._routes.get(path)?.absolute,
    );
    if ($router_state.get().path === normalizedPath) {
      this.goBack();
      return false;
    }
    this.navigate(normalizedPath, absolute);
    return true;
  }

  public destroy() {
    this._unlistenHistory?.();
    this._cleanup?.();
    this._restoreSiblings();
    this._container?.remove();
  }
}

export default Router;
