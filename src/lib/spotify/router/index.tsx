import { atom } from "nanostores";
import { render } from "solid-js/web";
import { wait, waitForElement } from "@/lib/dom/wait";
import { createLogger } from "@/utils/logger";
import ErrorPage from "@/lib/spotify/router/component/ErrorPage";

export type RouteHandler = {
  onMount: (el: HTMLElement) => (() => void) | void;
  onUnmount?: () => void;
  selector?: string;
  absolute?: boolean;
  hideSiblings?: boolean;
};

export type RouteDefinitions = Record<string, RouteHandler>;

interface HistoryLocation {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}

export const $router_state = atom({
  path: Spicetify?.Platform?.History?.location?.pathname ?? "",
  isNavigating: false,
});

const log = createLogger("router");

const SELECTORS = {
  // MAIN_VIEW: "#main-view .main-view-container__scroll-node-child > main, .Root__main-view .main-view-container__scroll-node-child > main",
  MAIN_VIEW: "#main-view, .Root__main-view",
  CONTAINER_ID: "lucid-page",
};

class Router {
  private _routes = new Map<string, RouteHandler>();
  private _currentCleanup: (() => void) | null = null;
  private _basePath: string;
  private _lastTransitionId: number = 0;
  private _isInitialized = false;
  private _readyPromise: Promise<void>;
  private _unlistenHistory?: () => void;
  private _hiddenSiblings: HTMLElement[] = [];

  constructor(basePath: string = "/lucid-lyrics", initialRoutes?: RouteDefinitions) {
    this._basePath = "/" + basePath.replace(/^\/+|\/+$/g, "");

    if (initialRoutes) {
      Object.entries(initialRoutes).forEach(([path, handler]) => {
        this.addRoute(path, handler);
      });
    }

    this._readyPromise = this._init();
  }

  private get _history() {
    return Spicetify?.Platform?.History;
  }

  private _normalizePath(path: string, isAbsolute: boolean = false): string {
    const cleanPath = path.replace(/\/+$/, "") || "/";

    if (isAbsolute || cleanPath.startsWith(this._basePath)) {
      return cleanPath;
    }

    const joinedPath = `${this._basePath}/${cleanPath.replace(/^\/+/, "")}`;
    return joinedPath.replace(/\/+$/, "") || this._basePath;
  }

  private async _init() {
    const history = await wait(() => this._history);
    if (!history) {
      log.error("Spicetify History API not found");
      return;
    }

    this._unlistenHistory = history.listen((loc: HistoryLocation) => this._handle(loc.pathname));
    this._isInitialized = true;
    this._handle(history.location.pathname);
  }

  private _handle(rawPath: string) {
    const path = rawPath.replace(/\/+$/, "") || "/";
    const handler = this._routes.get(path);
    const isMatched = path.startsWith(this._basePath) || handler?.absolute === true;

    $router_state.set({ path, isNavigating: true });

    if (!isMatched) {
      this._togglePage(path, false);
      $router_state.set({ ...$router_state.get(), isNavigating: false });
      return;
    }

    if (!this._isInitialized && this._routes.size === 0) return;

    const transitionId = ++this._lastTransitionId;
    this._cleanupCurrentRoute();

    this._togglePage(path, true, handler?.selector, handler?.hideSiblings).then((container) => {
      if (!this._isInitialized || !container) return;
      if (transitionId !== this._lastTransitionId) {
        log.warn(`Aborted transition to ${path} (stale)`);
        return;
      }

      container.innerHTML = "";

      if (handler) {
        this._mountRoute(container, path, handler);
      } else {
        log.error(`404: ${path}`);
        this._render404(container, path);
      }

      $router_state.set({ path, isNavigating: false });
    });
  }

  private _cleanupCurrentRoute() {
    if (this._currentCleanup) {
      this._currentCleanup();
      this._currentCleanup = null;
    }
  }

  private _mountRoute(container: HTMLElement, path: string, handler: RouteHandler) {
    const start = performance.now();
    try {
      const unmountRef = handler.onMount(container);
      const duration = (performance.now() - start).toFixed(2);
      log.debug(`mounted: ${path} (${duration}ms)`);

      this._currentCleanup = () => {
        if (typeof unmountRef === "function") unmountRef();
        handler.onUnmount?.();
        log.debug(`unmounted: ${path}`);
      };
    } catch (err) {
      log.error(`error_mounting ${path}:`, err);
      this._renderError(container, path, err);
    }
  }

  private async _togglePage(
    path: string,
    isActive: boolean,
    selector: string = SELECTORS.MAIN_VIEW,
    hideSiblings: boolean = false,
  ): Promise<HTMLElement | null> {
    const main = (await waitForElement(selector)) as HTMLElement;

    this._restoreSiblings();

    let container = document.getElementById(SELECTORS.CONTAINER_ID);

    if (!isActive) {
      if (container) {
        container.remove();
      }
      return null;
    }

    if (!container) {
      container = document.createElement("main");
      container.id = SELECTORS.CONTAINER_ID;
      main.appendChild(container);
    } else if (container.parentElement !== main) {
      main.appendChild(container);
    }

    container.dataset.path = path;
    container.style.position = "relative";

    if (hideSiblings) {
      this._hideSiblings(main, container);
    }

    return container;
  }

  private _hideSiblings(parent: HTMLElement, currentContainer: HTMLElement) {
    for (const child of Array.from(parent.children)) {
      if (child !== currentContainer) {
        const el = child as HTMLElement;
        el.dataset.lucidHidden = el.style.display;
        el.style.display = "none";
        this._hiddenSiblings.push(el);
      }
    }
  }

  private _restoreSiblings() {
    while (this._hiddenSiblings.length > 0) {
      const el = this._hiddenSiblings.pop();
      if (el) {
        el.style.display = el.dataset.lucidHidden || "";
        delete el.dataset.lucidHidden;
      }
    }
  }

  private _render404(container: HTMLElement, path: string) {
    const dispose = render(
      () => (
        <ErrorPage
          icon="404"
          title="Page Not Found"
          message={`We couldn't find ${path}`}
          onHome={() => this._history?.push("/")}
        />
      ),
      container,
    );
    this._currentCleanup = () => dispose();
  }

  private _renderError(container: HTMLElement, path: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const dispose = render(
      () => (
        <ErrorPage
          icon="error"
          title="Something went wrong"
          message={`Failed to load ${path}`}
          errorDetails={errorMessage}
          showRetry
          onRetry={() => this._handle(path)}
          onHome={() => this._history?.push("/")}
        />
      ),
      container,
    );
    this._currentCleanup = () => dispose();
  }

  public get state() {
    return $router_state;
  }

  public addRoute(path: string, handler: RouteHandler) {
    const normalized = this._normalizePath(path, handler.absolute);
    this._routes.set(normalized, handler);

    const currentPath = $router_state.get().path;
    if (this._isInitialized && normalized === currentPath) {
      this._handle(currentPath);
    }
  }

  public async navigate(path: string, absolute: boolean = false) {
    await this._readyPromise;
    const isRegisteredAbsolute = this._routes.get(path)?.absolute;
    this._history?.push(this._normalizePath(path, absolute || isRegisteredAbsolute));
  }

  public async onReady() {
    return this._readyPromise;
  }

  public async goBack() {
    await this._readyPromise;
    this._history?.goBack();
  }

  public async goForward() {
    await this._readyPromise;
    this._history?.goForward();
  }

  public togglePath(path: string, absolute: boolean = false): boolean {
    const isRegisteredAbsolute = this._routes.get(path)?.absolute;
    const normalizedPath = this._normalizePath(path, absolute || isRegisteredAbsolute);
    const { path: currentPath } = $router_state.get();

    if (currentPath === normalizedPath) {
      this.goBack();
      return false;
    } else {
      this.navigate(normalizedPath, absolute);
      return true;
    }
  }

  public destroy() {
    this._isInitialized = false;

    if (this._unlistenHistory) {
      this._unlistenHistory();
      this._unlistenHistory = undefined;
    }

    this._cleanupCurrentRoute();

    this._togglePage("", false).then((container) => {
      if (container) container.remove();
    });
  }
}

export default Router;
