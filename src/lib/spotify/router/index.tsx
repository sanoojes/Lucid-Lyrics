import { atom } from "nanostores";
import { render } from "solid-js/web";
import { wait, waitForElement } from "@/lib/dom/wait";
import { createLogger } from "@/utils/logger";
import ErrorPage from "@/lib/spotify/router/component/ErrorPage";

export type RouteHandler = {
  onMount: (el: HTMLElement) => (() => void) | void;
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

export class Router {
  private _routes = new Map<string, RouteHandler>();
  private _cleanup: (() => void) | void = undefined;
  private _container: HTMLElement | null = null;
  private _hiddenSiblings: HTMLElement[] = [];

  private _basePath: string;
  private _transitionId = 0;
  private _isInitialized = false;
  private _readyPromise: Promise<void>;
  private _unlistenHistory?: () => void;

  constructor(basePath: string = "/lucid-lyrics", initialRoutes?: RouteDefinitions) {
    this._basePath = "/" + basePath.replace(/^\/+|\/+$/g, "");

    if (initialRoutes) {
      Object.entries(initialRoutes).forEach(([path, handler]) => this.addRoute(path, handler));
    }
    this._readyPromise = this._init();
  }

  private get _history() {
    return Spicetify?.Platform?.History;
  }

  private _normalizePath(path: string, absolute = false): string {
    const cleanPath = path.replace(/\/+$/, "") || "/";
    if (absolute || cleanPath.startsWith(this._basePath)) return cleanPath;
    return (
      `${this._basePath}/${cleanPath.replace(/^\/+/, "")}`.replace(/\/+$/, "") || this._basePath
    );
  }

  private async _init() {
    const history = await wait(() => this._history);
    if (!history) return log.error("Spicetify History API not found");

    this._unlistenHistory = history.listen((loc: HistoryLocation) => this._handle(loc.pathname));
    this._isInitialized = true;
    this._handle(history.location.pathname);
  }

  private async _handle(rawPath: string) {
    const path = rawPath.replace(/\/+$/, "") || "/";
    const handler = this._routes.get(path);
    const isMatched = path.startsWith(this._basePath) || handler?.absolute === true;

    $router_state.set({ path, isNavigating: true });

    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }

    this._restoreSiblings();

    if (!isMatched) {
      this._container?.remove();
      this._container = null;
      $router_state.set({ ...$router_state.get(), isNavigating: false });
      return;
    }

    if (!this._isInitialized && this._routes.size === 0) return;

    const tId = ++this._transitionId;
    const parentSelector = handler?.selector || SELECTORS.MAIN_VIEW;
    const parent = (await waitForElement(parentSelector)) as HTMLElement;

    if (tId !== this._transitionId) return;

    if (!this._container) {
      this._container = document.createElement("main");
      this._container.id = SELECTORS.CONTAINER_ID;
      this._container.style.position = "relative";
    }

    if (this._container.parentElement !== parent) {
      parent.appendChild(this._container);
    }

    this._container.innerHTML = "";
    this._container.dataset.path = path;

    if (handler?.hideSiblings) this._hideSiblings(parent, this._container);

    try {
      if (handler) {
        const start = performance.now();
        this._cleanup = handler.onMount(this._container);
        log.debug(`mounted: ${path} (${(performance.now() - start).toFixed(2)}ms)`);
      } else {
        log.error(`404: ${path}`);
        this._hideSiblings(parent, this._container);
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
    } catch (err) {
      this._hideSiblings(parent, this._container);
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
    }

    $router_state.set({ path, isNavigating: false });
  }

  private _hideSiblings(parent: HTMLElement, current: HTMLElement) {
    for (const child of Array.from(parent.children)) {
      if (child !== current) {
        const el = child as HTMLElement;
        el.dataset.lucidHidden = el.style.display;
        el.style.display = "none";
        this._hiddenSiblings.push(el);
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

    if (this._isInitialized && normalized === $router_state.get().path) {
      this._handle(normalized);
    }
  }

  public async navigate(path: string, absolute = false) {
    await this._readyPromise;
    this._history?.push(this._normalizePath(path, absolute || this._routes.get(path)?.absolute));
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

  public togglePath(path: string, absolute = false): boolean {
    const normalizedPath = this._normalizePath(path, absolute || this._routes.get(path)?.absolute);
    if ($router_state.get().path === normalizedPath) {
      this.goBack();
      return false;
    }
    this.navigate(normalizedPath, absolute);
    return true;
  }

  public destroy() {
    this._isInitialized = false;
    if (this._unlistenHistory) this._unlistenHistory();
    if (this._cleanup) this._cleanup();
    this._restoreSiblings();
    this._container?.remove();
  }
}

export default Router;
